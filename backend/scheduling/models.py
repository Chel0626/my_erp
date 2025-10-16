"""
Models do módulo de Agendamentos
Implementa BLOCO 4: Construção do Primeiro Módulo (Barbearia)
"""
import uuid
from datetime import timedelta
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
    
    # Cliente (FK ou dados manuais para compatibilidade)
    customer = models.ForeignKey(
        'customers.Customer',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='appointments',
        verbose_name='Cliente'
    )
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
    
    # Preço cobrado (pode ser diferente do preço base do serviço)
    price = models.DecimalField(
        'Preço Cobrado',
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Preço cobrado por este agendamento específico'
    )
    
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
            models.Index(fields=['tenant', 'customer']),
        ]

    def __str__(self):
        return f"{self.customer_name} - {self.service.name} - {self.start_time.strftime('%d/%m/%Y %H:%M')}"
    
    def save(self, *args, **kwargs):
        """
        Sobrescreve save para:
        1. Validar tenant
        2. Sincronizar dados do cliente
        3. Definir preço padrão
        """
        # Valida service
        if self.service and self.service.tenant_id != self.tenant_id:
            raise ValueError('O serviço deve pertencer ao mesmo tenant')
        
        # Valida professional
        if self.professional and self.professional.tenant_id != self.tenant_id:
            raise ValueError('O profissional deve pertencer ao mesmo tenant')
        
        # Se tem customer vinculado, sincroniza os dados
        if self.customer:
            self.customer_name = self.customer.name
            self.customer_phone = self.customer.phone
            self.customer_email = self.customer.email or ''
        
        # Se preço não foi definido, usa o preço do serviço
        if self.price is None and self.service:
            self.price = self.service.price
        
        # Calcula end_time automaticamente se não foi definido
        if not self.end_time and self.service:
            self.end_time = self.start_time + timedelta(minutes=self.service.duration_minutes)
        
        super().save(*args, **kwargs)
    
    def get_final_price(self):
        """Retorna o preço final (price ou service.price)"""
        return self.price if self.price is not None else self.service.price
    
    def is_paid(self):
        """Verifica se existe transação vinculada"""
        return self.transactions.exists()
