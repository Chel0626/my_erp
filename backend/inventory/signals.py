"""
Signals do Módulo de Inventário
Integração automática com o módulo financeiro
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from decimal import Decimal
from datetime import date

from .models import StockMovement
from financial.models import Transaction, PaymentMethod


@receiver(post_save, sender=StockMovement)
def create_financial_transaction_on_purchase(sender, instance, created, **kwargs):
    """
    Cria transação financeira (despesa) quando há entrada de estoque por compra.
    
    Lógica:
    - Apenas para movement_type='entrada' e reason='compra'
    - Cria despesa no módulo financeiro
    - Valor = cost_price * quantity do produto
    - Evita duplicação verificando se já existe transação relacionada
    """
    if not created:
        return  # Apenas para novas movimentações
    
    # Apenas para compras (entrada de estoque)
    if instance.movement_type != 'entrada' or instance.reason != 'compra':
        return
    
    # Evita duplicação - se já tem transação relacionada, não cria outra
    if instance.transaction:
        return
    
    # Calcula valor da compra
    product = instance.product
    total_cost = product.cost_price * Decimal(instance.quantity)
    
    # Busca método de pagamento padrão (ou cria um genérico)
    payment_method, _ = PaymentMethod.objects.get_or_create(
        tenant=instance.tenant,
        name='Dinheiro',
        defaults={'is_active': True}
    )
    
    # Cria transação financeira (despesa)
    transaction = Transaction.objects.create(
        tenant=instance.tenant,
        type='despesa',
        category='fornecedor',
        description=f'Compra de estoque: {product.name} ({instance.quantity} un.)',
        amount=total_cost,
        date=date.today(),
        payment_method=payment_method,
        notes=f'Gerado automaticamente pela movimentação de estoque #{instance.id}',
        created_by=instance.created_by
    )
    
    # Vincula transação à movimentação
    instance.transaction = transaction
    instance.save(update_fields=['transaction'])
    
    print(f"✅ Transação financeira criada: Despesa de R$ {total_cost} para compra de {product.name}")
