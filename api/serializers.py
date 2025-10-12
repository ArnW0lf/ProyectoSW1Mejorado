from rest_framework import serializers
from .models import Profile, Folder, Document, Tag, DocumentPermission


class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo de Perfil.
    """
    class Meta:
        model = Profile
        fields = ['language_preference', 'subscription_plan']


class FolderSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Folder."""
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Folder
        fields = ['id', 'name', 'owner', 'parent', 'created_at']


class DocumentSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Document."""
    owner = serializers.ReadOnlyField(source='owner.username')
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = ['id', 'owner', 'folder', 'file',
                  'file_url', 'uploaded_at', 'tags']
        read_only_fields = ['file_url', 'uploaded_at']

    def get_file_url(self, obj):
        return self.context['request'].build_absolute_uri(obj.file.url)


class TagSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Tag."""
    class Meta:
        model = Tag
        fields = ['id', 'name']


class DocumentPermissionSerializer(serializers.ModelSerializer):
    """Serializer para gestionar los permisos de un documento."""
    # Hacemos que el campo 'user' sea de solo lectura por su ID para la entrada,
    # pero muestre el username en la salida.
    user = serializers.ReadOnlyField(source='user.username')
    user_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = DocumentPermission
        fields = ['id', 'user', 'user_id', 'permission_level']
