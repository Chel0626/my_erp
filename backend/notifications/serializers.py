"""
Serializers for the notifications app.
"""
from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer para notificações."""
    
    user_name = serializers.CharField(source='user.name', read_only=True)
    notification_type_display = serializers.CharField(
        source='get_notification_type_display',
        read_only=True
    )
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'notification_type',
            'notification_type_display',
            'title',
            'message',
            'is_read',
            'read_at',
            'reference_type',
            'reference_id',
            'created_at',
            'user_name',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'read_at',
            'user_name',
        ]


class CreateNotificationSerializer(serializers.ModelSerializer):
    """Serializer para criar notificações."""
    
    class Meta:
        model = Notification
        fields = [
            'user',
            'notification_type',
            'title',
            'message',
            'reference_type',
            'reference_id',
        ]
    
    def validate_user(self, value):
        """Valida se o usuário pertence ao mesmo tenant."""
        request = self.context.get('request')
        if request and value.tenant != request.user.tenant:
            raise serializers.ValidationError(
                "Você não pode criar notificações para usuários de outra empresa."
            )
        return value


class MarkAsReadSerializer(serializers.Serializer):
    """Serializer para marcar notificações como lidas."""
    
    notification_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=True,
        help_text="Lista de IDs das notificações a serem marcadas como lidas"
    )


class NotificationCountSerializer(serializers.Serializer):
    """Serializer para contar notificações."""
    
    total = serializers.IntegerField(read_only=True)
    unread = serializers.IntegerField(read_only=True)
    read = serializers.IntegerField(read_only=True)
