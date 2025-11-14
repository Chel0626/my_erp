from django.db.models.signals import post_save
from django.dispatch import receiver
from decimal import Decimal

from .models import Sale
from financial.models import Transaction, PaymentMethod


@receiver(post_save, sender=Sale)
def create_financial_transaction_on_sale(sender, instance, created, **kwargs):
    """
    Cria transação financeira (receita) quando venda é criada.
    
    Lógica:
    - Cria receita no módulo financeiro para vendas pagas
    - Valor = total da venda
    - Usa o payment_method da venda
    - Evita duplicação verificando transações existentes
    """
    # Apenas para vendas pagas
    if instance.payment_status != 'paid':
        return
    
    # Evita duplicação - verifica se já existe transação para esta venda
    from financial.models import Transaction
    existing = Transaction.objects.filter(
        tenant=instance.tenant,
        description__contains=f'Venda #{instance.id}'
    ).exists()
    
    if existing:
        return  # Já tem transação criada
    
    # Mapeia payment_method da venda para PaymentMethod do financial
    payment_method_map = {
        'cash': 'Dinheiro',
        'credit_card': 'Cartão de Crédito',
        'debit_card': 'Cartão de Débito',
        'pix': 'PIX',
        'bank_transfer': 'Transferência Bancária',
    }
    
    payment_name = payment_method_map.get(instance.payment_method, 'Dinheiro')
    
    # Busca ou cria método de pagamento
    payment_method, _ = PaymentMethod.objects.get_or_create(
        tenant=instance.tenant,
        name=payment_name,
        defaults={'is_active': True}
    )
    
    # Identifica cliente
    customer_info = instance.customer.name if instance.customer else 'Cliente Avulso'
    
    # Cria transação financeira (receita)
    Transaction.objects.create(
        tenant=instance.tenant,
        type='receita',
        category='produto',  # Pode ser 'servico' se tiver serviços na venda
        description=f'Venda #{instance.id} - {customer_info}',
        amount=instance.total,
        date=instance.date.date(),  # Converte datetime para date
        payment_method=payment_method,
        notes=f'Gerado automaticamente pela venda. Items: {instance.items.count()}',
        created_by=instance.user
    )
    
    print(f"✅ Transação financeira criada: Receita de R$ {instance.total} para venda #{instance.id}")


@receiver(post_save, sender=Sale)
def handle_sale_payment(sender, instance, created, **kwargs):
    """
    Signal para gerar comissões quando venda é paga
    
    TEMPORARIAMENTE DESABILITADO: 
    O modelo Commission precisa ser atualizado para suportar vendas,
    atualmente só suporta appointments.
    """
    pass
    # if not created:  # Apenas em updates
    #     if instance.payment_status == 'paid':
    #         # Verifica se já tem comissões geradas
    #         from commissions.models import Commission
    #         existing_commissions = Commission.objects.filter(sale=instance).exists()
    #         
    #         if not existing_commissions:
    #             instance.generate_commissions()
