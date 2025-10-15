"""
Modelos do Módulo Financeiro
Sistema de controle de receitas, despesas e fluxo de caixa
"""
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
import uuid


class PaymentMethod(models.Model):
    """
    Métodos de pagamento aceitos
    Ex: Dinheiro, PIX, Cartão de Crédito, Cartão de Débito
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        'core.Tenant',
        on_delete=models.CASCADE,
        related_name='payment_methods'
    )
    name = models.CharField(max_length=100, verbose_name="Nome")
    is_active = models.BooleanField(default=True, verbose_name="Ativo")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")

    class Meta:
        verbose_name = "Método de Pagamento"
        verbose_name_plural = "Métodos de Pagamento"
        unique_together = [['tenant', 'name']]
        ordering = ['name']

    def __str__(self):
        return self.name


class Transaction(models.Model):
    """
    Transações financeiras (Receitas e Despesas)
    """
    TRANSACTION_TYPES = [
        ('receita', 'Receita'),
        ('despesa', 'Despesa'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        'core.Tenant',
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    
    # Tipo e dados básicos
    type = models.CharField(
        max_length=10,
        choices=TRANSACTION_TYPES,
        verbose_name="Tipo"
    )
    description = models.CharField(max_length=255, verbose_name="Descrição")
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name="Valor"
    )
    
    # Data e pagamento
    date = models.DateField(verbose_name="Data")
    payment_method = models.ForeignKey(
        PaymentMethod,
        on_delete=models.PROTECT,
        related_name='transactions',
        verbose_name="Método de Pagamento"
    )
    
    # Relacionamentos opcionais
    appointment = models.ForeignKey(
        'scheduling.Appointment',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transactions',
        verbose_name="Agendamento"
    )
    
    # Observações
    notes = models.TextField(blank=True, verbose_name="Observações")
    
    # Auditoria
    created_by = models.ForeignKey(
        'core.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_transactions',
        verbose_name="Criado por"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")

    class Meta:
        verbose_name = "Transação"
        verbose_name_plural = "Transações"
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['tenant', 'date']),
            models.Index(fields=['tenant', 'type']),
            models.Index(fields=['tenant', 'payment_method']),
        ]

    def __str__(self):
        symbol = '+' if self.type == 'receita' else '-'
        return f"{symbol} R$ {self.amount} - {self.description}"

    def clean(self):
        """Validações customizadas"""
        from django.core.exceptions import ValidationError
        
        # Valida que payment_method pertence ao mesmo tenant
        if self.payment_method and self.payment_method.tenant_id != self.tenant_id:
            raise ValidationError({
                'payment_method': 'O método de pagamento não pertence à sua empresa.'
            })
        
        # Valida que appointment pertence ao mesmo tenant (se fornecido)
        if self.appointment and self.appointment.tenant_id != self.tenant_id:
            raise ValidationError({
                'appointment': 'O agendamento não pertence à sua empresa.'
            })

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class CashFlow(models.Model):
    """
    Resumo do fluxo de caixa por período
    Gerado automaticamente via signals ou tarefa agendada
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        'core.Tenant',
        on_delete=models.CASCADE,
        related_name='cash_flows'
    )
    
    # Período
    date = models.DateField(verbose_name="Data", unique=False)
    
    # Valores calculados
    total_revenue = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="Total de Receitas"
    )
    total_expenses = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="Total de Despesas"
    )
    balance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="Saldo"
    )
    
    # Auditoria
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")

    class Meta:
        verbose_name = "Fluxo de Caixa"
        verbose_name_plural = "Fluxos de Caixa"
        unique_together = [['tenant', 'date']]
        ordering = ['-date']
        indexes = [
            models.Index(fields=['tenant', 'date']),
        ]

    def __str__(self):
        return f"Fluxo de Caixa - {self.date} - Saldo: R$ {self.balance}"

    def calculate(self):
        """Calcula os totais baseado nas transações do dia"""
        from django.db.models import Sum, Q
        
        transactions = Transaction.objects.filter(
            tenant=self.tenant,
            date=self.date
        )
        
        # Calcula receitas
        revenue = transactions.filter(type='receita').aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')
        
        # Calcula despesas
        expenses = transactions.filter(type='despesa').aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')
        
        # Atualiza valores
        self.total_revenue = revenue
        self.total_expenses = expenses
        self.balance = revenue - expenses
        self.save()
        
        return self
