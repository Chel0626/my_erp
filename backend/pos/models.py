from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
from core.models import TenantAwareModel
from customers.models import Customer
from inventory.models import Product
from scheduling.models import Service
from django.contrib.auth import get_user_model

User = get_user_model()


class CashRegister(TenantAwareModel):
    """Caixa - Controle de abertura e fechamento"""
    
    STATUS_CHOICES = [
        ('open', 'Aberto'),
        ('closed', 'Fechado'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='cash_registers',
        verbose_name='Operador'
    )
    opened_at = models.DateTimeField(auto_now_add=True, verbose_name='Aberto em')
    closed_at = models.DateTimeField(null=True, blank=True, verbose_name='Fechado em')
    
    opening_balance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name='Saldo Inicial'
    )
    closing_balance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name='Saldo Final'
    )
    expected_balance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name='Saldo Esperado'
    )
    difference = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Diferença'
    )
    
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='open',
        verbose_name='Status'
    )
    notes = models.TextField(blank=True, verbose_name='Observações')
    
    class Meta:
        db_table = 'pos_cash_register'
        verbose_name = 'Caixa'
        verbose_name_plural = 'Caixas'
        ordering = ['-opened_at']
    
    def __str__(self):
        return f"Caixa {self.user.get_full_name()} - {self.opened_at.strftime('%d/%m/%Y %H:%M')}"
    
    def calculate_expected_balance(self):
        """Calcula saldo esperado baseado nas vendas"""
        total_sales = self.sales.filter(payment_status='paid').aggregate(
            total=models.Sum('total')
        )['total'] or Decimal('0')
        
        self.expected_balance = self.opening_balance + total_sales
        return self.expected_balance
    
    def calculate_difference(self):
        """Calcula diferença entre saldo final e esperado"""
        if self.closing_balance is not None and self.expected_balance is not None:
            self.difference = self.closing_balance - self.expected_balance
        return self.difference


class Sale(TenantAwareModel):
    """Venda realizada no PDV"""
    
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Dinheiro'),
        ('credit_card', 'Cartão de Crédito'),
        ('debit_card', 'Cartão de Débito'),
        ('pix', 'PIX'),
        ('bank_transfer', 'Transferência'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('paid', 'Pago'),
        ('cancelled', 'Cancelado'),
    ]
    
    cash_register = models.ForeignKey(
        CashRegister,
        on_delete=models.PROTECT,
        related_name='sales',
        verbose_name='Caixa'
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name='sales',
        null=True,
        blank=True,
        verbose_name='Cliente'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='sales',
        verbose_name='Vendedor'
    )
    
    date = models.DateTimeField(auto_now_add=True, verbose_name='Data')
    
    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))],
        default=Decimal('0'),
        verbose_name='Subtotal'
    )
    discount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))],
        default=Decimal('0'),
        verbose_name='Desconto'
    )
    total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))],
        default=Decimal('0'),
        verbose_name='Total'
    )
    
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        verbose_name='Forma de Pagamento'
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='pending',
        verbose_name='Status Pagamento'
    )
    
    notes = models.TextField(blank=True, verbose_name='Observações')
    
    class Meta:
        db_table = 'pos_sale'
        verbose_name = 'Venda'
        verbose_name_plural = 'Vendas'
        ordering = ['-date']
        indexes = [
            models.Index(fields=['tenant', '-date']),
            models.Index(fields=['tenant', 'payment_status', '-date']),
            models.Index(fields=['tenant', 'payment_method', '-date']),
            models.Index(fields=['cash_register', '-date']),
            models.Index(fields=['customer', '-date']),
        ]
    
    def __str__(self):
        customer_name = self.customer.name if self.customer else 'Cliente Avulso'
        return f"Venda #{self.id} - {customer_name} - R$ {self.total}"
    
    def calculate_total(self):
        """Calcula total da venda baseado nos items"""
        items_total = self.items.aggregate(
            total=models.Sum('total')
        )['total'] or Decimal('0')
        
        self.subtotal = items_total
        self.total = self.subtotal - self.discount
        self.save()
        return self.total
    
    def generate_commissions(self):
        """Gera comissões para os profissionais"""
        from commissions.models import Commission, CommissionRule
        
        for item in self.items.all():
            if item.professional:
                # Busca regra de comissão
                rule = None
                if item.service:
                    rule = CommissionRule.objects.filter(
                        tenant=self.tenant,
                        service=item.service,
                        is_active=True
                    ).first()
                elif item.product:
                    rule = CommissionRule.objects.filter(
                        tenant=self.tenant,
                        product=item.product,
                        is_active=True
                    ).first()
                
                if rule:
                    commission_value = (item.total * rule.percentage) / 100
                    
                    Commission.objects.create(
                        tenant=self.tenant,
                        user=item.professional,
                        sale=self,
                        service=item.service,
                        product=item.product,
                        base_value=item.total,
                        percentage=rule.percentage,
                        commission_value=commission_value,
                        payment_status='pending'
                    )


class SaleItem(TenantAwareModel):
    """Item da venda (produto ou serviço)"""
    
    sale = models.ForeignKey(
        Sale,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='Venda'
    )
    
    # Pode ser produto OU serviço
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name='sale_items',
        null=True,
        blank=True,
        verbose_name='Produto'
    )
    service = models.ForeignKey(
        Service,
        on_delete=models.PROTECT,
        related_name='sale_items',
        null=True,
        blank=True,
        verbose_name='Serviço'
    )
    
    professional = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='sale_items',
        null=True,
        blank=True,
        verbose_name='Profissional'
    )
    
    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        default=Decimal('1'),
        verbose_name='Quantidade'
    )
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name='Preço Unitário'
    )
    discount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))],
        default=Decimal('0'),
        verbose_name='Desconto'
    )
    total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))],
        default=Decimal('0'),
        verbose_name='Total'
    )
    
    class Meta:
        db_table = 'pos_sale_item'
        verbose_name = 'Item da Venda'
        verbose_name_plural = 'Itens da Venda'
        ordering = ['id']
    
    def __str__(self):
        item_name = self.product.name if self.product else self.service.name
        return f"{item_name} x {self.quantity}"
    
    def save(self, *args, **kwargs):
        # Calcula total do item
        item_total = (self.unit_price * self.quantity)
        self.total = item_total - self.discount
        super().save(*args, **kwargs)
    
    def clean(self):
        from django.core.exceptions import ValidationError
        
        # Validação: deve ter produto OU serviço
        if not self.product and not self.service:
            raise ValidationError('Item deve ter um produto ou serviço.')
        
        if self.product and self.service:
            raise ValidationError('Item não pode ter produto e serviço ao mesmo tempo.')
