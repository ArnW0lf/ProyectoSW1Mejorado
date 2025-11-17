from .models import TranslationHistory
from .serializers import TranslationHistorySerializer
from .translation import translate_text
import os
from django.http import JsonResponse, FileResponse, HttpResponse
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
from .text_extractor import extract_text
from django.shortcuts import redirect
from io import BytesIO
from docx import Document as DocxDocument

# IMPORTACIONES PARA PDF
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.units import inch


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
    Vista personalizada para manejar la verificación de correo electrónico.
    Toma la clave de la URL, la procesa y redirige al frontend.
    """

    def get(self, request, key, *args, **kwargs):
        self.kwargs['key'] = key
        
        frontend_url_success = 'http://localhost:5173/verify-email?success=true'
        frontend_url_failure = 'http://localhost:5173/verify-email?success=false'

        try:
            confirmation = self.get_object()
            confirmation.confirm(self.request)
            return redirect(frontend_url_success)
        except Exception as e:
            print(f"Error al verificar correo: {e}")
            return redirect(frontend_url_failure)


class ProfileDetailView(generics.RetrieveUpdateAPIView):
    """
    Vista para ver y actualizar el perfil del usuario autenticado.
    """
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, created = Profile.objects.get_or_create(
            user=self.request.user)
        return profile


class FolderViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar las carpetas de los usuarios."""
    serializer_class = FolderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.folders.filter(parent=None)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'], url_path='list-all')
    def list_all(self, request):
        """
        Devuelve una lista plana de TODAS las carpetas del usuario.
        """
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

    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['file', 'tags__name', 'extracted_content']
    filterset_fields = ['tags', 'folder']

    def perform_create(self, serializer):
        document = serializer.save(owner=self.request.user)
        try:
            content = extract_text(document)
            if content:
                document.extracted_content = content
                document.save()
        except Exception as e:
            print(f"No se pudo extraer el contenido del documento {document.id}: {e}")

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """
        Acción personalizada que genera un documento en el formato original
        (PDF o DOCX) usando el contenido actual (extracted_content).
        """
        document = self.get_object()

        # 1. Obtener el contenido de texto actual
        content = document.extracted_content
        if not content:
            content = "Este documento no tiene contenido de texto extraído."

        # 2. Detectar la extensión del archivo ORIGINAL
        original_filename = document.file.name
        _, original_extension = os.path.splitext(original_filename)
        original_extension = original_extension.lower()
        
        base_filename = os.path.basename(os.path.splitext(original_filename)[0])

        try:
            # 3. GENERAR PDF si el original era PDF
            if original_extension == '.pdf':
                return self._generate_pdf_response(content, base_filename)
            
            # 4. GENERAR DOCX si el original era DOCX/DOC
            elif original_extension in ['.docx', '.doc']:
                return self._generate_docx_response(content, base_filename)
            
            # 5. GENERAR TXT para otros formatos
            else:
                return self._generate_txt_response(content, base_filename)

        except Exception as e:
            print(f"Error al generar el archivo: {e}")
            # Fallback: devolver como TXT
            return self._generate_txt_response(content, base_filename)

    def _generate_pdf_response(self, content, base_filename):
        """Genera un PDF con el contenido."""
        buffer = BytesIO()
        pdf = SimpleDocTemplate(buffer, pagesize=letter)
        
        # Estilos
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            spaceAfter=12,
        )
        body_style = ParagraphStyle(
            'CustomBody',
            parent=styles['BodyText'],
            fontSize=11,
            leading=14,
        )
        
        # Contenido del PDF
        story = []
        title = Paragraph(f"Documento: {base_filename}", title_style)
        story.append(title)
        story.append(Spacer(1, 0.2 * inch))
        
        # Dividir en párrafos
        for line in content.split('\n'):
            if line.strip():
                # Escapar caracteres especiales de XML
                safe_line = line.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                p = Paragraph(safe_line, body_style)
                story.append(p)
                story.append(Spacer(1, 0.1 * inch))
        
        pdf.build(story)
        buffer.seek(0)
        
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{base_filename}_contenido.pdf"'
        return response

    def _generate_docx_response(self, content, base_filename):
        """Genera un DOCX con el contenido."""
        new_doc = DocxDocument()
        new_doc.add_paragraph(content)
        
        buffer = BytesIO()
        new_doc.save(buffer)
        buffer.seek(0)

        response = FileResponse(
            buffer,
            as_attachment=True,
            filename=f"{base_filename}_contenido.docx"
        )
        response['Content-Type'] = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        return response

    def _generate_txt_response(self, content, base_filename):
        """Genera un TXT con el contenido."""
        buffer = BytesIO(content.encode('utf-8'))
        response = FileResponse(
            buffer,
            as_attachment=True,
            filename=f"{base_filename}_contenido.txt"
        )
        response['Content-Type'] = 'text/plain; charset=utf-8'
        return response

    @action(detail=True, methods=['post'], url_path='share')
    def share(self, request, pk=None):
        """
        Comparte un documento con otro usuario por su email.
        """
        document = self.get_object()

        if document.owner != request.user:
            return Response({'detail': 'No tienes permiso para compartir este documento.'}, status=403)

        email = request.data.get('email')
        permission_level = request.data.get('permission_level')

        if not email or not permission_level:
            return Response({'detail': 'Se requieren "email" y "permission_level".'}, status=400)

        try:
            user_to_share_with = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'detail': f'No se encontró ningún usuario con el email {email}.'}, status=404)
        
        if document.owner == user_to_share_with:
            return Response({'detail': 'No puedes compartir un documento contigo mismo.'}, status=400)

        permission, created = DocumentPermission.objects.update_or_create(
            document=document,
            user=user_to_share_with,
            defaults={'permission_level': permission_level}
        )
        
        status_text = "actualizado" if not created else "creado"
        return Response({'detail': f'Permiso {status_text} para {email} con nivel de {permission_level}.'}, status=200)

    @action(detail=True, methods=['post'], url_path='translate-text')
    def translate_text_snippet(self, request, pk=None):
        """
        UC-19: Traduce un fragmento de texto proporcionado.
        """
        document = self.get_object()
        text_to_translate = request.data.get('text')
        target_language = request.data.get('target_language', 'en')
        source_language = request.data.get('source_language')

        if not text_to_translate:
            return Response({'error': 'El campo "text" es requerido.'}, status=400)

        result = translate_text(
            text_to_translate, target_language, source_language)

        if 'error' in result:
            return Response(result, status=400)

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

        TranslationHistory.objects.create(
            original_document=document,
            user=request.user,
            source_language=result['detected_source_language'],
            target_language=target_language,
            translated_content=result['translated_text']
        )

        return Response(result, status=200)


class TranslationHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    UC-20: Vista para que un usuario pueda ver su historial de traducciones.
    """
    serializer_class = TranslationHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TranslationHistory.objects.filter(user=self.request.user)