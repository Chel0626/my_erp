"""
Script para testar fluxo de venda e movimentação de estoque
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from inventory.models import Product, StockMovement
from pos.models import Sale, SaleItem, CashRegister
from core.models import User
from decimal import Decimal

# Busca dados de teste
user = User.objects.filter(role='admin').first()
if not user:
    print("❌ Nenhum usuário admin encontrado")
    exit()

tenant = user.tenant
print(f"✅ Usando tenant: {tenant.name}")
print(f"✅ Usando user: {user.email}")

# Busca ou cria produto de teste
product, created = Product.objects.get_or_create(
    tenant=tenant,
    name="Produto Teste PDV",
    defaults={
        'category': 'outro',
        'cost_price': Decimal('10.00'),
        'sale_price': Decimal('20.00'),
        'stock_quantity': 100,
        'min_stock': 5
    }
)

if created:
    print(f"✅ Produto criado: {product.name}")
else:
    print(f"✅ Produto encontrado: {product.name}")

print(f"📦 Estoque inicial: {product.stock_quantity}")

# Busca caixa aberto ou cria um novo
cash_register = CashRegister.objects.filter(
    tenant=tenant,
    user=user,
    status='open'
).first()

if not cash_register:
    print("💡 Criando novo caixa...")
    cash_register = CashRegister.objects.create(
        tenant=tenant,
        user=user,
        opening_balance=Decimal('100.00'),
        status='open'
    )
    print(f"✅ Caixa criado: #{cash_register.id}")
else:
    print(f"✅ Caixa aberto: #{cash_register.id}")

# Conta movimentações antes
movements_before = StockMovement.objects.filter(
    tenant=tenant,
    product=product
).count()

print(f"📊 Movimentações antes: {movements_before}")

# Simula criação de venda (seria feito via API)
print("\n🔄 Criando venda via serializer...")

from pos.serializers import SaleCreateSerializer
from rest_framework.request import Request
from django.test import RequestFactory

factory = RequestFactory()
request = factory.post('/api/pos/sales/')
request.user = user

serializer = SaleCreateSerializer(
    data={
        'customer': None,
        'discount': Decimal('0'),
        'payment_method': 'cash',  # Dinheiro
        'payment_status': 'paid',
        'notes': 'Teste de estoque',
        'items': [
            {
                'product': str(product.id),
                'service': None,
                'professional': None,
                'quantity': 2,
                'unit_price': product.sale_price,
                'discount': Decimal('0')
            }
        ]
    },
    context={'request': request}
)

if serializer.is_valid():
    try:
        sale = serializer.save()
        print(f"✅ Venda criada: #{sale.id}")
        print(f"💰 Total: R$ {sale.total}")
        
        # Recarrega produto do banco
        product.refresh_from_db()
        print(f"📦 Estoque após venda: {product.stock_quantity}")
        
        # Conta movimentações depois
        movements_after = StockMovement.objects.filter(
            tenant=tenant,
            product=product
        ).count()
        
        print(f"📊 Movimentações depois: {movements_after}")
        print(f"✨ Novas movimentações criadas: {movements_after - movements_before}")
        
        # Lista últimas movimentações
        print("\n📜 Últimas movimentações:")
        for mov in StockMovement.objects.filter(tenant=tenant, product=product).order_by('-created_at')[:3]:
            print(f"  • {mov.get_movement_type_display()} - Qtd: {mov.quantity}")
            print(f"    Estoque: {mov.stock_before} → {mov.stock_after}")
            print(f"    Motivo: {mov.get_reason_display()}")
            print(f"    Notas: {mov.notes}")
            print()
        
        print("✅ TESTE CONCLUÍDO COM SUCESSO!")
        
    except Exception as e:
        print(f"❌ Erro ao criar venda: {e}")
        import traceback
        traceback.print_exc()
else:
    print(f"❌ Validação falhou: {serializer.errors}")
