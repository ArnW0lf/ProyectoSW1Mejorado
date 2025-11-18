from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Usamos re_path para capturar el nombre de la sala de conferencia
    re_path(r'^ws/chat/(?P<room_name>\w+)/$', consumers.ChatConsumer.as_asgi()),]