"""
Models do módulo de Agendamentos
Implementa BLOCO 4: Construção do Primeiro Módulo (Barbearia)
"""
import uuid
from django.db import models
from core.models import TenantAwareModel, User


class Service(TenantAwareModel):
    """
    Catálogo de Serviços
    Ex: Corte Masculino, Barba, Escova
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField('Nome do Serviço', max_length=255)
    description = models.TextField('Descrição', blank=True)
    price = models.DecimalField('Preço', max_digits=10, decimal_places=2)
    duration_minutes = models.IntegerField('Duração (minutos)')
    is_active = models.BooleanField('Ativo', default=True)
    created_at = models.DateTimeField('Criado em', auto_now_add=True)
    updated_at = models.DateTimeField('Atualizado em', auto_now=True)

    class Meta:
        verbose_name = 'Serviço'
        verbose_name_plural = 'Serviços'
        ordering = ['name']
        # Garante que não haverá serviços duplicados no mesmo tenant
        unique_together = [['tenant', 'name']]

    def __str__(self):
        return f"{self.name} - R$ {self.price}"


class Appointment(TenantAwareModel):
    """
    Agendamentos
    A agenda da barbearia/empresa
    """
    STATUS_CHOICES = [
        ('marcado', 'Marcado'),
        ('confirmado', 'Confirmado'),
        ('em_atendimento', 'Em Atendimento'),
        ('concluido', 'Concluído'),
        ('cancelado', 'Cancelado'),
        ('falta', 'Falta do Cliente'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer_name = models.CharField('Nome do Cliente', max_length=255)
    customer_phone = models.CharField('Telefone', max_length=20, blank=True)
    customer_email = models.EmailField('Email', blank=True)
    
    service = models.ForeignKey(
        Service,
        on_delete=models.PROTECT,
        related_name='appointments',
        verbose_name='Serviço'
    )
    professional = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='appointments',
        verbose_name='Profissional'
    )
    
    start_time = models.DateTimeField('Data/Hora do Agendamento')
    end_time = models.DateTimeField('Data/Hora de Término', null=True, blank=True)
    
    status = models.CharField(
        'Status',
        max_length=20,
        choices=STATUS_CHOICES,
        default='marcado'
    )
    
    notes = models.TextField('Observações', blank=True)
    
    created_at = models.DateTimeField('Criado em', auto_now_add=True)
    updated_at = models.DateTimeField('Atualizado em', auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='appointments_created',
        verbose_name='Criado por'
    )

    class Meta:
        verbose_name = 'Agendamento'
        verbose_name_plural = 'Agendamentos'
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['tenant', 'start_time']),
            models.Index(fields=['tenant', 'professional', 'start_time']),
            models.Index(fields=['tenant', 'status']),
        ]

    def __str__(self):
        return f"{self.customer_name} - {self.service.name} - {self.start_time.strftime('%d/%m/%Y %H:%M')}"

    def save(self, *args, **kwargs):
        """
        Valida que service e professional pertencem ao mesmo tenant
        Implementa: BLOCO 3 - Regras de Segurança
        """
        # Valida service
        if self.service and self.service.tenant_id != self.tenant_id:
            raise ValueError('O serviço deve pertencer ao mesmo tenant')
        
        # Valida professional
        if self.professional and self.professional.tenant_id != self.tenant_id:
            raise ValueError('O profissional deve pertencer ao mesmo tenant')
        
        # Calcula end_time baseado na duração do serviço
        if self.service and self.start_time and not self.end_time:
            from datetime import timedelta
            self.end_time = self.start_time + timedelta(minutes=self.service.duration_minutes)
        
        super().save(*args, **kwargs)
