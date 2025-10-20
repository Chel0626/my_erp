"""
Views for the notifications app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count
from django.utils import timezone

from core.permissions import IsSameTenant
from .models import Notification
from .serializers import (
    NotificationSerializer,
    CreateNotificationSerializer,
    MarkAsReadSerializer,
    NotificationCountSerializer,
)


class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar notificações.
    
    Endpoints:
    - GET /api/notifications/ - Listar notificações do usuário
    - GET /api/notifications/{id}/ - Buscar notificação específica
    - POST /api/notifications/ - Criar nova notificação
    - PATCH /api/notifications/{id}/ - Atualizar notificação
    - DELETE /api/notifications/{id}/ - Deletar notificação
    - GET /api/notifications/unread/ - Listar apenas não lidas
    - POST /api/notifications/mark_as_read/ - Marcar como lida
    - POST /api/notifications/mark_all_as_read/ - Marcar todas como lidas
    - GET /api/notifications/count/ - Contar notificações
    """
    
    permission_classes = [IsAuthenticated, IsSameTenant]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['notification_type', 'is_read']
    
    def get_queryset(self):
        """Retorna apenas notificações do usuário autenticado."""
        return Notification.objects.filter(
            user=self.request.user
        ).select_related('user', 'tenant')
    
    def get_serializer_class(self):
        """Retorna o serializer apropriado para cada ação."""
        if self.action == 'create':
            return CreateNotificationSerializer
        elif self.action == 'mark_as_read':
            return MarkAsReadSerializer
        elif self.action == 'count':
            return NotificationCountSerializer
        return NotificationSerializer
    
    def perform_create(self, serializer):
        """Garante que o tenant seja definido ao criar."""
        serializer.save(tenant=self.request.user.tenant)
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """
        GET /api/notifications/unread/
        Retorna apenas notificações não lidas do usuário.
        """
        queryset = self.get_queryset().filter(is_read=False)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def mark_as_read(self, request):
        """
        POST /api/notifications/mark_as_read/
        Marca uma ou mais notificações como lidas.
        Body: { "notification_ids": ["uuid1", "uuid2", ...] }
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        notification_ids = serializer.validated_data['notification_ids']
        
        # Buscar notificações do usuário
        notifications = self.get_queryset().filter(
            id__in=notification_ids,
            is_read=False
        )
        
        if not notifications.exists():
            return Response(
                {'error': 'Nenhuma notificação não lida encontrada com os IDs fornecidos'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Marcar como lidas
        updated_count = notifications.update(
            is_read=True,
            read_at=timezone.now()
        )
        
        return Response({
            'message': f'{updated_count} notificação(ões) marcada(s) como lida(s)',
            'updated_count': updated_count
        })
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """
        POST /api/notifications/mark_all_as_read/
        Marca todas as notificações não lidas do usuário como lidas.
        """
        updated_count = self.get_queryset().filter(
            is_read=False
        ).update(
            is_read=True,
            read_at=timezone.now()
        )
        
        return Response({
            'message': f'{updated_count} notificação(ões) marcada(s) como lida(s)',
            'updated_count': updated_count
        })
    
    @action(detail=False, methods=['get'])
    def count(self, request):
        """
        GET /api/notifications/count/
        Retorna contagem de notificações (total, lidas, não lidas).
        """
        queryset = self.get_queryset()
        
        counts = queryset.aggregate(
            total=Count('id'),
            unread=Count('id', filter=Q(is_read=False)),
            read=Count('id', filter=Q(is_read=True)),
        )
        
        serializer = self.get_serializer(counts)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """
        POST /api/notifications/{id}/mark_read/
        Marca uma notificação específica como lida.
        """
        notification = self.get_object()
        notification.mark_as_read()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)
