from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
# ⚠️ Importamos la vista CustomVerifyEmailView desde donde esté definida
from api.views import CustomVerifyEmailView 
from django.shortcuts import redirect

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Rutas para tu aplicación local (api)
    path('api/', include('api.urls')),
    
    # 💥 Rutas de Autenticación Djoser 💥
    # Djoser incluye registro (/users/), gestión de usuarios, etc.
    path('api/', include('djoser.urls')), 
    
    # Djoser para login/logout con Token (/token/login, /token/logout)
    path('api/', include('djoser.urls.authtoken')),

    # 1. URL de Confirmación de Email (Apunta a la vista CustomVerifyEmailView)
    # Esta ruta es crítica para recibir la clave del correo de activación.
    re_path(r'^api/auth/register/account-confirm-email/(?P<key>[-:\w]+)/$',
            CustomVerifyEmailView.as_view(), name='account_confirm_email'),
    
    # 2. URL de Restablecimiento de Contraseña (Redirecciona al Frontend)
    # Esta ruta es crítica para el flujo de restablecimiento de contraseña.
    re_path(r'^password-reset/confirm/(?P<uidb64>.*)/(?P<token>.*)/$', 
        lambda request, uidb64, token: redirect(f'http://localhost:5173/password-reset/confirm?uid={uidb64}&token={token}'), 
        name='password_reset_confirm'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)