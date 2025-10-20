"""
Models for the notifications app.
Sistema de notificações para alertar usuários sobre eventos importantes.
"""
from django.db import models
from django.utils import timezone
from core.models import User, Tenant
import uuid


class Notification(models.Model):
    """
    Modelo para notificações do sistema.
    Notifica usuários sobre eventos importantes: novos agendamentos, pagamentos, etc.
    """
    
    NOTIFICATION_TYPES = [
        ('appointment_new', 'Novo Agendamento'),
        ('appointment_confirmed', 'Agendamento Confirmado'),
        ('appointment_cancelled', 'Agendamento Cancelado'),
        ('payment_received', 'Pagamento Recebido'),
        ('commission_generated', 'Comissão Gerada'),
        ('stock_low', 'Estoque Baixo'),
        ('stock_out', 'Produto Sem Estoque'),
        ('customer_new', 'Novo Cliente'),
        ('system', 'Sistema'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name='Empresa'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name='Usuário',
        help_text='Usuário que receberá a notificação'
    )
    notification_type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPES,
        verbose_name='Tipo de Notificação'
    )
    title = models.CharField(
        max_length=200,
        verbose_name='Título'
    )
    message = models.TextField(
        verbose_name='Mensagem',
        help_text='Conteúdo da notificação'
    )
    is_read = models.BooleanField(
        default=False,
        verbose_name='Lida',
        help_text='Indica se a notificação foi lida pelo usuário'
    )
    read_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Lida em',
        help_text='Data e hora em que a notificação foi lida'
    )
    
    # Campos opcionais para referência
    reference_type = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        verbose_name='Tipo de Referência',
        help_text='Ex: appointment, payment, product'
    )
    reference_id = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        verbose_name='ID da Referência',
        help_text='ID do objeto relacionado'
    )
    
    # Metadata
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Criado em'
    )
    
    class Meta:
        verbose_name = 'Notificação'
        verbose_name_plural = 'Notificações'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tenant', 'user', 'is_read']),
            models.Index(fields=['tenant', 'created_at']),
            models.Index(fields=['user', 'is_read', 'created_at']),
        ]
    
    def __str__(self):
        status = "Lida" if self.is_read else "Não lida"
        return f"{self.title} - {self.user.name} ({status})"
    
    def mark_as_read(self):
        """Marca a notificação como lida."""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
    
    def save(self, *args, **kwargs):
        """Override save to ensure tenant is set from user."""
        if not self.tenant_id and self.user_id:
            self.tenant = self.user.tenant
        super().save(*args, **kwargs)
