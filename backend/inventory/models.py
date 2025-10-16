"""
Modelos do Módulo de Inventário
Gestão de Produtos e Controle de Estoque
"""
import uuid
from django.db import models
from django.core.validators import MinValueValidator
from core.models import TenantAwareModel


class Product(TenantAwareModel):
    """
    Produto para venda
    """
    CATEGORY_CHOICES = [
        ('pomada', 'Pomada'),
        ('shampoo', 'Shampoo'),
        ('condicionador', 'Condicionador'),
        ('oleo', 'Óleo'),
        ('cera', 'Cera'),
        ('gel', 'Gel'),
        ('talco', 'Talco'),
        ('navalhete', 'Navalhete/Descartável'),
        ('toalha', 'Toalha'),
        ('outro', 'Outro'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField('Nome', max_length=200)
    description = models.TextField('Descrição', blank=True)
    category = models.CharField('Categoria', max_length=50, choices=CATEGORY_CHOICES)
    
    # Precificação
    cost_price = models.DecimalField(
        'Preço de Custo',
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text='Quanto você paga ao fornecedor'
    )
    sale_price = models.DecimalField(
        'Preço de Venda',
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text='Quanto você cobra do cliente'
    )
    
    # Estoque
    stock_quantity = models.IntegerField(
        'Quantidade em Estoque',
        default=0,
        validators=[MinValueValidator(0)]
    )
    min_stock = models.IntegerField(
        'Estoque Mínimo',
        default=5,
        validators=[MinValueValidator(0)],
        help_text='Alerta quando estoque ficar abaixo deste valor'
    )
    
    # Informações adicionais
    barcode = models.CharField('Código de Barras', max_length=100, blank=True)
    sku = models.CharField('SKU', max_length=100, blank=True, help_text='Stock Keeping Unit')
    image_url = models.URLField('URL da Imagem', blank=True)
    
    # Status
    is_active = models.BooleanField('Ativo', default=True)
    
    # Auditoria
    created_at = models.DateTimeField('Criado em', auto_now_add=True)
    updated_at = models.DateTimeField('Atualizado em', auto_now=True)
    
    class Meta:
        db_table = 'products'
        verbose_name = 'Produto'
        verbose_name_plural = 'Produtos'
        ordering = ['name']
        indexes = [
            models.Index(fields=['tenant', 'is_active']),
            models.Index(fields=['tenant', 'category']),
            models.Index(fields=['barcode']),
            models.Index(fields=['sku']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['tenant', 'name'],
                name='unique_product_name_per_tenant'
            ),
        ]
    
    def __str__(self):
        return self.name
    
    @property
    def profit_margin(self):
        """Calcula a margem de lucro percentual"""
        if self.cost_price > 0:
            return ((self.sale_price - self.cost_price) / self.cost_price) * 100
        return 0
    
    @property
    def is_low_stock(self):
        """Verifica se o estoque está abaixo do mínimo"""
        return self.stock_quantity <= self.min_stock
    
    @property
    def stock_status(self):
        """Retorna status do estoque: ok, low, out"""
        if self.stock_quantity == 0:
            return 'out'
        elif self.is_low_stock:
            return 'low'
        return 'ok'


class StockMovement(TenantAwareModel):
    """
    Movimentação de Estoque
    Registra entradas e saídas de produtos
    """
    MOVEMENT_TYPE_CHOICES = [
        ('entrada', 'Entrada'),  # Compra, devolução de cliente
        ('saida', 'Saída'),      # Venda, perda, uso interno
    ]
    
    REASON_CHOICES = [
        ('compra', 'Compra de Fornecedor'),
        ('venda', 'Venda ao Cliente'),
        ('devolucao', 'Devolução'),
        ('perda', 'Perda/Dano'),
        ('uso_interno', 'Uso Interno'),
        ('ajuste', 'Ajuste de Inventário'),
        ('outro', 'Outro'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name='stock_movements',
        verbose_name='Produto'
    )
    
    movement_type = models.CharField(
        'Tipo de Movimentação',
        max_length=20,
        choices=MOVEMENT_TYPE_CHOICES
    )
    reason = models.CharField(
        'Motivo',
        max_length=50,
        choices=REASON_CHOICES
    )
    
    quantity = models.IntegerField(
        'Quantidade',
        validators=[MinValueValidator(1)]
    )
    
    # Estoque antes e depois (para auditoria)
    stock_before = models.IntegerField('Estoque Anterior')
    stock_after = models.IntegerField('Estoque Após')
    
    notes = models.TextField('Observações', blank=True)
    
    # Referência opcional para venda (será usado no PDV)
    transaction = models.ForeignKey(
        'financial.Transaction',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='stock_movements',
        verbose_name='Transação Relacionada'
    )
    
    # Auditoria
    created_by = models.ForeignKey(
        'core.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='stock_movements_created',
        verbose_name='Criado por'
    )
    created_at = models.DateTimeField('Data da Movimentação', auto_now_add=True)
    
    class Meta:
        db_table = 'stock_movements'
        verbose_name = 'Movimentação de Estoque'
        verbose_name_plural = 'Movimentações de Estoque'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tenant', 'product', '-created_at']),
            models.Index(fields=['tenant', 'movement_type', '-created_at']),
            models.Index(fields=['transaction']),
        ]
    
    def __str__(self):
        return f"{self.get_movement_type_display()} - {self.product.name} ({self.quantity})"
    
    def save(self, *args, **kwargs):
        """
        Atualiza o estoque do produto automaticamente
        """
        if not self.pk:  # Apenas na criação
            # Registra estoque anterior
            self.stock_before = self.product.stock_quantity
            
            # Atualiza estoque do produto
            if self.movement_type == 'entrada':
                new_stock = self.product.stock_quantity + self.quantity
            else:  # saída
                new_stock = self.product.stock_quantity - self.quantity
                
                # Validação: não permite estoque negativo
                if new_stock < 0:
                    raise ValueError(
                        f'Estoque insuficiente. Disponível: {self.stock_before}, '
                        f'Solicitado: {self.quantity}'
                    )
            
            # Registra estoque após
            self.stock_after = new_stock
            
            # Salva a movimentação
            super().save(*args, **kwargs)
            
            # Atualiza o produto
            self.product.stock_quantity = new_stock
            self.product.save()
        else:
            super().save(*args, **kwargs)
