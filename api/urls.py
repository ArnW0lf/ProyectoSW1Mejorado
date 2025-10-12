# api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import test_endpoint, ProfileDetailView, FolderViewSet, DocumentViewSet, TagViewSet

# Creamos un router y registramos nuestros viewsets
router = DefaultRouter()
router.register(r'folders', FolderViewSet, basename='folder')
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'tags', TagViewSet, basename='tag')

urlpatterns = [
    path('test/', test_endpoint, name='test_endpoint'),
    path('profile/', ProfileDetailView.as_view(), name='profile-detail'),
    # Las URLs para la API de documentos y carpetas son generadas por el router
    path('', include(router.urls)),
]
