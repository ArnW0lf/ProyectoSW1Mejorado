from .models import TranslationHistory  # Asegúrate que esté importado
# Asegúrate que esté importado
from .serializers import TranslationHistorySerializer
from .translation import translate_text  # Importa nuestra nueva función
import os
from django.http import JsonResponse, FileResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, permissions, viewsets
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from rest_framework.decorators import action
from django.db.models import Q
from dj_rest_auth.registration.views import VerifyEmailView
from .models import Profile, Folder, Document, Tag, DocumentPermission
from .serializers import ProfileSerializer, FolderSerializer, DocumentSerializer, TagSerializer, DocumentPermissionSerializer
from .permissions import IsOwnerOrHasPermission
from django.contrib.auth.models import User

def test_endpoint(request):
    """
    Una vista de prueba que devuelve un mensaje JSON.
    """
    if request.method == 'GET':
        data = {
            'message': '¡Hola desde el backend de Django!',
            'status': 'ok'
        }
        return JsonResponse(data)


class CustomVerifyEmailView(VerifyEmailView):
    """
    Vista personalizada para manejar la verificación de correo electrónico a través de GET.
    Toma la clave de la URL y la procesa.
    """

    def get(self, request, key, *args, **kwargs):
        self.kwargs['key'] = key
        confirmation = self.get_object()
        confirmation.confirm(self.request)
        return Response({'detail': 'Correo electrónico verificado exitosamente.'}, status=200)


class ProfileDetailView(generics.RetrieveUpdateAPIView):
    """
    Vista para ver y actualizar el perfil del usuario autenticado.
    """
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Devuelve el perfil del usuario que hace la petición.
        # Si no existe, lo crea al momento.
        profile, created = Profile.objects.get_or_create(
            user=self.request.user)
        return profile


class FolderViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar las carpetas de los usuarios."""
    serializer_class = FolderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Correcto: solo devuelve las carpetas raíz
        return self.request.user.folders.filter(parent=None)

    def perform_create(self, serializer):
        # Correcto: solo una definición
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'], url_path='list-all')
    def list_all(self, request):
        """
        Devuelve una lista plana de TODAS las carpetas del usuario.
        """
        # Correcto: solo una definición
        queryset = self.request.user.folders.all()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class TagViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar las etiquetas de los usuarios."""
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.tags.all()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class DocumentViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar los documentos de los usuarios."""
    serializer_class = DocumentSerializer
    permission_classes = [IsOwnerOrHasPermission]

    def get_queryset(self):
        user = self.request.user
        return Document.objects.filter(
            Q(owner=user) | Q(permissions__user=user)
        ).distinct()

    # Configuración de filtros y búsqueda
    filter_backends = [DjangoFilterBackend, SearchFilter]
    # Permite buscar por nombre de archivo y nombre de etiqueta
    search_fields = ['file', 'tags__name', 'extracted_content']
    filterset_fields = ['tags', 'folder']

    def perform_create(self, serializer):
        # Asigna el usuario actual como propietario al subir un documento
        document = serializer.save(owner=self.request.user)

        # --- INICIO DE LA MODIFICACIÓN ---
        # Después de crear el documento, intentamos extraer su contenido.
        # Por ahora, solo soportamos archivos .txt
        file_path = document.file.path
        if file_path.lower().endswith('.txt'):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    document.extracted_content = f.read()
                document.save()
            except Exception as e:
                # Opcional: registrar el error si la lectura falla
                print(f"No se pudo leer el contenido del archivo {file_path}: {e}")
        # --- FIN DE LA MODIFICACIÓN ---
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """
        Acción personalizada para descargar el archivo físico de un documento.
        """
        document = self.get_object()
        # Devuelve el archivo para que el navegador lo descargue
        return FileResponse(document.file.open(), as_attachment=True, filename=document.file.name)

    @action(detail=True, methods=['post'], url_path='share')
    def share(self, request, pk=None):
        """
        Comparte un documento con otro usuario por su email.
        """
        document = self.get_object()

        if document.owner != request.user:
            return Response({'detail': 'No tienes permiso para compartir este documento.'}, status=403)

        # --- INICIO DE LA MODIFICACIÓN ---
        # Leemos los datos directamente desde request.data
        email = request.data.get('email')
        permission_level = request.data.get('permission_level')

        if not email or not permission_level:
            return Response({'detail': 'Se requieren "email" y "permission_level".'}, status=400)

        # Buscamos al usuario por su email
        try:
            user_to_share_with = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'detail': f'No se encontró ningún usuario con el email {email}.'}, status=404)
        
        # Evita que el propietario se comparta a sí mismo
        if document.owner == user_to_share_with:
            return Response({'detail': 'No puedes compartir un documento contigo mismo.'}, status=400)

        # Crea o actualiza el permiso
        permission, created = DocumentPermission.objects.update_or_create(
            document=document,
            user=user_to_share_with, # Usamos el objeto de usuario encontrado
            defaults={'permission_level': permission_level}
        )
        
        status_text = "actualizado" if not created else "creado"
        return Response({'detail': f'Permiso {status_text} para {email} con nivel de {permission_level}.'}, status=200)
    # --- INICIO DE NUEVAS ACCIONES (AÑADIR ESTO DENTRO DE DocumentViewSet) ---

    @action(detail=True, methods=['post'], url_path='translate-text')
    def translate_text_snippet(self, request, pk=None):
        """
        UC-19: Traduce un fragmento de texto proporcionado.
        """
        document = self.get_object()  # Para asegurar permisos
        text_to_translate = request.data.get('text')
        target_language = request.data.get(
            'target_language', 'en')  # 'en' por defecto
        source_language = request.data.get('source_language')  # Opcional

        if not text_to_translate:
            return Response({'error': 'El campo "text" es requerido.'}, status=400)

        result = translate_text(
            text_to_translate, target_language, source_language)

        if 'error' in result:
            return Response(result, status=400)

        # Opcional: Guardar en el historial
        TranslationHistory.objects.create(
            original_document=document,
            user=request.user,
            source_language=result['detected_source_language'],
            target_language=target_language,
            translated_content=f"Fragmento: '{text_to_translate}' -> '{result['translated_text']}'"
        )

        return Response(result, status=200)

    @action(detail=True, methods=['post'], url_path='translate-document')
    def translate_document(self, request, pk=None):
        """
        UC-17 & UC-18: Traduce el contenido extraído de un documento.
        """
        document = self.get_object()
        target_language = request.data.get('target_language')
        source_language = request.data.get('source_language')

        if not target_language:
            return Response({'error': 'El campo "target_language" es requerido.'}, status=400)

        if not document.extracted_content:
            return Response({'error': 'El documento no tiene contenido extraído para traducir.'}, status=400)

        result = translate_text(
            document.extracted_content, target_language, source_language)

        if 'error' in result:
            return Response(result, status=400)

        # Guardar el resultado en el historial
        TranslationHistory.objects.create(
            original_document=document,
            user=request.user,
            source_language=result['detected_source_language'],
            target_language=target_language,
            translated_content=result['translated_text']
        )

        return Response(result, status=200)

    # --- FIN DE NUEVAS ACCIONES ---


# --- AÑADIR ESTE NUEVO VIEWSET AL FINAL DEL ARCHIVO ---
class TranslationHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    UC-20: Vista para que un usuario pueda ver su historial de traducciones.
    """
    serializer_class = TranslationHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # El usuario solo puede ver su propio historial
        return TranslationHistory.objects.filter(user=self.request.user)
