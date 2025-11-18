import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from chat.middleware import TokenAuthMiddleware
import chat.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": TokenAuthMiddleware( # <--- CAMBIAR AQUÍ
        URLRouter(
            chat.routing.websocket_urlpatterns
        )
    ),
})