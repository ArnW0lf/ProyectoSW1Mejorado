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
        # Un usuario solo puede ver sus propias carpetas
        return self.request.user.folders.all()

    def perform_create(self, serializer):
        # Asigna el usuario actual como propietario al crear una carpeta
        serializer.save(owner=self.request.user)


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
        # Un usuario puede ver documentos si:
        # 1. Es el propietario (owner=user)
        # O
        # 2. Tiene un permiso explícito en el documento (permissions__user=user)
        return Document.objects.filter(
            Q(owner=user) | Q(permissions__user=user)
        ).distinct()

    # Configuración de filtros y búsqueda
    filter_backends = [DjangoFilterBackend, SearchFilter]
    # Permite buscar por nombre de archivo y nombre de etiqueta
    search_fields = ['file', 'tags__name']
    filterset_fields = ['tags']  # Permite filtrar por el ID de la etiqueta

    def perform_create(self, serializer):
        # Asigna el usuario actual como propietario al subir un documento
        serializer.save(owner=self.request.user)

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
        Comparte un documento con otro usuario.
        """
        document = self.get_object()

        # Solo el propietario del documento puede compartirlo
        if document.owner != request.user:
            return Response({'detail': 'No tienes permiso para compartir este documento.'}, status=403)

        serializer = DocumentPermissionSerializer(data=request.data)
        if serializer.is_valid():
            user_id = serializer.validated_data['user_id']
            permission_level = serializer.validated_data['permission_level']

            # Evita que el propietario se comparta el documento a sí mismo
            if document.owner.id == user_id:
                return Response({'detail': 'No puedes compartir un documento contigo mismo.'}, status=400)

            # Crea o actualiza el permiso
            permission, created = DocumentPermission.objects.update_or_create(
                document=document,
                user_id=user_id,
                defaults={'permission_level': permission_level}
            )
            return Response({'detail': f'Documento compartido con el usuario {user_id} con permiso de {permission_level}.'}, status=200)
        return Response(serializer.errors, status=400)
