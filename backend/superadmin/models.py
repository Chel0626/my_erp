"""
Módulo de Administração de Tenants (Super Admin)
Este módulo gerencia todas as empresas/tenants que usam o sistema
"""
from django.db import models
from django.utils import timezone
from core.models import Tenant


class Subscription(models.Model):
    """Modelo para gerenciar assinaturas dos tenants"""
    
    PLAN_CHOICES = [
        ('free', 'Grátis'),
        ('basic', 'Básico'),
        ('professional', 'Profissional'),
        ('enterprise', 'Empresarial'),
    ]
    
    STATUS_CHOICES = [
        ('trial', 'Período de Teste'),
        ('active', 'Ativa'),
        ('suspended', 'Suspensa'),
        ('cancelled', 'Cancelada'),
        ('expired', 'Expirada'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('paid', 'Pago'),
        ('overdue', 'Atrasado'),
        ('failed', 'Falhou'),
    ]
    
    tenant = models.OneToOneField(
        Tenant,
        on_delete=models.CASCADE,
        related_name='subscription',
        verbose_name='Empresa'
    )
    
    plan = models.CharField(
        'Plano',
        max_length=20,
        choices=PLAN_CHOICES,
        default='free'
    )
    
    status = models.CharField(
        'Status',
        max_length=20,
        choices=STATUS_CHOICES,
        default='trial'
    )
    
    payment_status = models.CharField(
        'Status do Pagamento',
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='pending'
    )
    
    start_date = models.DateField(
        'Data de Início',
        default=timezone.now
    )
    
    trial_end_date = models.DateField(
        'Fim do Período de Teste',
        null=True,
        blank=True
    )
    
    next_billing_date = models.DateField(
        'Próxima Data de Cobrança',
        null=True,
        blank=True
    )
    
    monthly_price = models.DecimalField(
        'Preço Mensal',
        max_digits=10,
        decimal_places=2,
        default=0.00
    )
    
    max_users = models.IntegerField(
        'Máximo de Usuários',
        default=5
    )
    
    max_appointments_per_month = models.IntegerField(
        'Máximo de Agendamentos/Mês',
        default=100
    )
    
    features = models.JSONField(
        'Recursos Habilitados',
        default=dict,
        blank=True,
        help_text='JSON com features habilitadas: {"sms": true, "whatsapp": false, ...}'
    )
    
    notes = models.TextField(
        'Observações',
        blank=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Assinatura'
        verbose_name_plural = 'Assinaturas'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.tenant.company_name} - {self.get_plan_display()}"
    
    @property
    def is_active(self):
        """Verifica se a assinatura está ativa"""
        return self.status == 'active'
    
    @property
    def is_trial(self):
        """Verifica se está em período de teste"""
        return self.status == 'trial'
    
    @property
    def days_until_expiration(self):
        """Calcula dias até expiração"""
        if self.next_billing_date:
            delta = self.next_billing_date - timezone.now().date()
            return delta.days
        return None


class PaymentHistory(models.Model):
    """Histórico de pagamentos dos tenants"""
    
    PAYMENT_METHOD_CHOICES = [
        ('credit_card', 'Cartão de Crédito'),
        ('debit_card', 'Cartão de Débito'),
        ('pix', 'PIX'),
        ('bank_slip', 'Boleto'),
        ('bank_transfer', 'Transferência'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('processing', 'Processando'),
        ('paid', 'Pago'),
        ('failed', 'Falhou'),
        ('refunded', 'Reembolsado'),
        ('cancelled', 'Cancelado'),
    ]
    
    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.CASCADE,
        related_name='payments',
        verbose_name='Assinatura'
    )
    
    amount = models.DecimalField(
        'Valor',
        max_digits=10,
        decimal_places=2
    )
    
    payment_method = models.CharField(
        'Método de Pagamento',
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES
    )
    
    status = models.CharField(
        'Status',
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    reference_month = models.DateField(
        'Mês de Referência',
        help_text='Mês ao qual este pagamento se refere'
    )
    
    paid_at = models.DateTimeField(
        'Data de Pagamento',
        null=True,
        blank=True
    )
    
    transaction_id = models.CharField(
        'ID da Transação',
        max_length=255,
        blank=True,
        help_text='ID da transação no gateway de pagamento'
    )
    
    notes = models.TextField(
        'Observações',
        blank=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Pagamento'
        verbose_name_plural = 'Pagamentos'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.subscription.tenant.company_name} - R$ {self.amount} ({self.get_status_display()})"


class SystemError(models.Model):
    """Log de erros do sistema por tenant"""
    
    SEVERITY_CHOICES = [
        ('low', 'Baixa'),
        ('medium', 'Média'),
        ('high', 'Alta'),
        ('critical', 'Crítica'),
    ]
    
    STATUS_CHOICES = [
        ('new', 'Novo'),
        ('investigating', 'Investigando'),
        ('resolved', 'Resolvido'),
        ('ignored', 'Ignorado'),
    ]
    
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='errors',
        verbose_name='Empresa',
        null=True,
        blank=True,
        help_text='Deixe em branco para erros do sistema global'
    )
    
    error_type = models.CharField(
        'Tipo de Erro',
        max_length=100,
        help_text='Ex: DatabaseError, ValidationError, APIError'
    )
    
    severity = models.CharField(
        'Severidade',
        max_length=20,
        choices=SEVERITY_CHOICES,
        default='medium'
    )
    
    status = models.CharField(
        'Status',
        max_length=20,
        choices=STATUS_CHOICES,
        default='new'
    )
    
    message = models.TextField(
        'Mensagem',
        help_text='Mensagem de erro'
    )
    
    stack_trace = models.TextField(
        'Stack Trace',
        blank=True,
        help_text='Stack trace completo do erro'
    )
    
    endpoint = models.CharField(
        'Endpoint',
        max_length=255,
        blank=True,
        help_text='URL ou endpoint onde o erro ocorreu'
    )
    
    user_email = models.EmailField(
        'Email do Usuário',
        blank=True,
        help_text='Email do usuário que encontrou o erro'
    )
    
    ip_address = models.GenericIPAddressField(
        'Endereço IP',
        null=True,
        blank=True
    )
    
    user_agent = models.TextField(
        'User Agent',
        blank=True
    )
    
    occurrences = models.IntegerField(
        'Ocorrências',
        default=1,
        help_text='Número de vezes que este erro ocorreu'
    )
    
    first_seen = models.DateTimeField(
        'Primeira Ocorrência',
        auto_now_add=True
    )
    
    last_seen = models.DateTimeField(
        'Última Ocorrência',
        auto_now=True
    )
    
    resolved_at = models.DateTimeField(
        'Resolvido em',
        null=True,
        blank=True
    )
    
    resolved_by = models.CharField(
        'Resolvido por',
        max_length=255,
        blank=True
    )
    
    resolution_notes = models.TextField(
        'Notas de Resolução',
        blank=True
    )
    
    class Meta:
        verbose_name = 'Erro do Sistema'
        verbose_name_plural = 'Erros do Sistema'
        ordering = ['-last_seen']
        indexes = [
            models.Index(fields=['-last_seen']),
            models.Index(fields=['severity', 'status']),
        ]
    
    def __str__(self):
        tenant_name = self.tenant.company_name if self.tenant else 'Sistema Global'
        return f"{tenant_name} - {self.error_type} ({self.get_severity_display()})"


class TenantUsageStats(models.Model):
    """Estatísticas de uso por tenant (mensal)"""
    
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='usage_stats',
        verbose_name='Empresa'
    )
    
    month = models.DateField(
        'Mês',
        help_text='Primeiro dia do mês de referência'
    )
    
    total_users = models.IntegerField(
        'Total de Usuários',
        default=0
    )
    
    active_users = models.IntegerField(
        'Usuários Ativos',
        default=0,
        help_text='Usuários que fizeram login no mês'
    )
    
    total_appointments = models.IntegerField(
        'Total de Agendamentos',
        default=0
    )
    
    completed_appointments = models.IntegerField(
        'Agendamentos Concluídos',
        default=0
    )
    
    total_revenue = models.DecimalField(
        'Receita Total',
        max_digits=12,
        decimal_places=2,
        default=0.00
    )
    
    total_customers = models.IntegerField(
        'Total de Clientes',
        default=0
    )
    
    new_customers = models.IntegerField(
        'Novos Clientes',
        default=0
    )
    
    api_calls = models.IntegerField(
        'Chamadas de API',
        default=0,
        help_text='Total de chamadas à API no mês'
    )
    
    storage_used_mb = models.FloatField(
        'Armazenamento (MB)',
        default=0.0,
        help_text='Espaço em disco utilizado em MB'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Estatística de Uso'
        verbose_name_plural = 'Estatísticas de Uso'
        ordering = ['-month']
        unique_together = ['tenant', 'month']
    
    def __str__(self):
        return f"{self.tenant.company_name} - {self.month.strftime('%m/%Y')}"
