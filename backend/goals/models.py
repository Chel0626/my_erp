from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
from core.models import TenantAwareModel
from django.contrib.auth import get_user_model

User = get_user_model()


class Goal(TenantAwareModel):
    """Meta/Objetivo - Individual ou de Equipe"""
    
    TYPE_CHOICES = [
        ('individual', 'Individual'),
        ('team', 'Equipe'),
    ]
    
    TARGET_TYPE_CHOICES = [
        ('revenue', 'Faturamento'),
        ('sales_count', 'Quantidade de Vendas'),
        ('services_count', 'Quantidade de Serviços'),
        ('products_sold', 'Produtos Vendidos'),
        ('new_customers', 'Novos Clientes'),
    ]
    
    PERIOD_CHOICES = [
        ('daily', 'Diário'),
        ('weekly', 'Semanal'),
        ('monthly', 'Mensal'),
        ('quarterly', 'Trimestral'),
        ('yearly', 'Anual'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Ativa'),
        ('completed', 'Concluída'),
        ('failed', 'Falhada'),
        ('cancelled', 'Cancelada'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='goals',
        null=True,
        blank=True,
        verbose_name='Profissional',
        help_text='Deixe vazio para meta de equipe'
    )
    
    name = models.CharField(max_length=200, verbose_name='Nome')
    description = models.TextField(blank=True, verbose_name='Descrição')
    
    type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default='individual',
        verbose_name='Tipo'
    )
    
    target_type = models.CharField(
        max_length=20,
        choices=TARGET_TYPE_CHOICES,
        verbose_name='Tipo de Meta'
    )
    
    target_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name='Valor Alvo'
    )
    
    current_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))],
        default=Decimal('0'),
        verbose_name='Valor Atual'
    )
    
    period = models.CharField(
        max_length=20,
        choices=PERIOD_CHOICES,
        verbose_name='Período'
    )
    
    start_date = models.DateField(verbose_name='Data Início')
    end_date = models.DateField(verbose_name='Data Fim')
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        verbose_name='Status'
    )
    
    created_at = models.DateTimeField('Criado em', auto_now_add=True)
    updated_at = models.DateTimeField('Atualizado em', auto_now=True)
    
    class Meta:
        db_table = 'goals_goal'
        verbose_name = 'Meta'
        verbose_name_plural = 'Metas'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['tenant', 'user']),
            models.Index(fields=['start_date', 'end_date']),
        ]
    
    def __str__(self):
        if self.user:
            return f"{self.name} - {self.user.get_full_name()}"
        return f"{self.name} - Equipe"
    
    def percentage(self):
        """Calcula porcentagem atingida"""
        if self.target_value == 0:
            return 0
        return (self.current_value / self.target_value) * 100
    
    def update_progress(self, value):
        """Atualiza progresso da meta"""
        self.current_value = value
        self.check_completion()
        self.save()
    
    def check_completion(self):
        """Verifica se meta foi atingida"""
        from django.utils import timezone
        
        if self.current_value >= self.target_value:
            self.status = 'completed'
        elif timezone.now().date() > self.end_date and self.current_value < self.target_value:
            self.status = 'failed'
    
    def calculate_current_value(self):
        """Calcula valor atual baseado em vendas/serviços"""
        from pos.models import Sale
        from scheduling.models import Appointment
        from customers.models import Customer
        
        filters = {
            'tenant': self.tenant,
            'date__gte': self.start_date,
            'date__lte': self.end_date,
        }
        
        if self.user:
            filters['user'] = self.user
        
        if self.target_type == 'revenue':
            # Somatório de vendas pagas
            total = Sale.objects.filter(
                payment_status='paid',
                **filters
            ).aggregate(total=models.Sum('total'))['total'] or Decimal('0')
            self.current_value = total
        
        elif self.target_type == 'sales_count':
            # Contagem de vendas
            count = Sale.objects.filter(
                payment_status='paid',
                **filters
            ).count()
            self.current_value = Decimal(count)
        
        elif self.target_type == 'services_count':
            # Contagem de serviços concluídos
            appointment_filters = {
                'tenant': self.tenant,
                'start_time__date__gte': self.start_date,
                'start_time__date__lte': self.end_date,
                'status': 'completed',
            }
            if self.user:
                appointment_filters['professional'] = self.user
            
            count = Appointment.objects.filter(**appointment_filters).count()
            self.current_value = Decimal(count)
        
        elif self.target_type == 'products_sold':
            # Quantidade de produtos vendidos
            from pos.models import SaleItem
            sale_filters = {
                'sale__tenant': self.tenant,
                'sale__date__gte': self.start_date,
                'sale__date__lte': self.end_date,
                'sale__payment_status': 'paid',
                'product__isnull': False,
            }
            if self.user:
                sale_filters['sale__user'] = self.user
            
            total = SaleItem.objects.filter(**sale_filters).aggregate(
                total=models.Sum('quantity')
            )['total'] or Decimal('0')
            self.current_value = total
        
        elif self.target_type == 'new_customers':
            # Novos clientes cadastrados
            customer_filters = {
                'tenant': self.tenant,
                'created_at__date__gte': self.start_date,
                'created_at__date__lte': self.end_date,
            }
            count = Customer.objects.filter(**customer_filters).count()
            self.current_value = Decimal(count)
        
        self.check_completion()
        self.save()


class GoalProgress(TenantAwareModel):
    """Histórico de progresso da meta"""
    
    goal = models.ForeignKey(
        Goal,
        on_delete=models.CASCADE,
        related_name='progress_history',
        verbose_name='Meta'
    )
    
    date = models.DateField(verbose_name='Data')
    value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name='Valor'
    )
    percentage = models.FloatField(verbose_name='Porcentagem')
    notes = models.TextField(blank=True, verbose_name='Observações')
    
    created_at = models.DateTimeField('Criado em', auto_now_add=True)
    
    class Meta:
        db_table = 'goals_progress'
        verbose_name = 'Progresso da Meta'
        verbose_name_plural = 'Progresso das Metas'
        ordering = ['-date']
        indexes = [
            models.Index(fields=['goal', 'date']),
        ]
    
    def __str__(self):
        return f"{self.goal.name} - {self.date} ({self.percentage:.1f}%)"
    
    def save(self, *args, **kwargs):
        # Calcula porcentagem automaticamente
        if self.goal.target_value > 0:
            self.percentage = float((self.value / self.goal.target_value) * 100)
        super().save(*args, **kwargs)
