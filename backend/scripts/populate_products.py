"""
Script para popular banco com Produtos de teste
Execute: python manage.py shell < scripts/populate_products.py
"""
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import Tenant
from inventory.models import Product, StockMovement
from django.contrib.auth import get_user_model

User = get_user_model()

print('\n🧪 POPULANDO PRODUTOS DE TESTE')
print('=' * 60)

# Pegar tenant e usuário de teste
try:
    tenant = Tenant.objects.first()
    if not tenant:
        print('❌ Nenhum tenant encontrado. Execute populate_db.py primeiro!')
        sys.exit(1)
    
    admin_user = User.objects.filter(tenant=tenant, role='admin').first()
    if not admin_user:
        print('❌ Nenhum admin encontrado!')
        sys.exit(1)
    
    print(f'🏢 Tenant: {tenant.name}')
    print(f'👤 Admin: {admin_user.name}')
    print()
    
    # Deletar produtos existentes do tenant
    Product.objects.filter(tenant=tenant).delete()
    print('🗑️  Produtos anteriores deletados')
    print()
    
    # Lista de produtos
    products_data = [
        {
            'name': 'Pomada Modeladora Strong',
            'description': 'Pomada de fixação forte para modelar cabelo',
            'category': 'pomada',
            'cost_price': 15.00,
            'sale_price': 35.00,
            'stock_quantity': 25,
            'min_stock': 5,
            'barcode': '7891234560001',
            'sku': 'POM-STR-001',
        },
        {
            'name': 'Shampoo Anti-Resíduo',
            'description': 'Shampoo para limpeza profunda',
            'category': 'shampoo',
            'cost_price': 12.00,
            'sale_price': 28.00,
            'stock_quantity': 15,
            'min_stock': 5,
            'barcode': '7891234560002',
            'sku': 'SHA-ANT-001',
        },
        {
            'name': 'Óleo de Barba Premium',
            'description': 'Óleo hidratante para barba',
            'category': 'oleo',
            'cost_price': 18.00,
            'sale_price': 45.00,
            'stock_quantity': 30,
            'min_stock': 10,
            'barcode': '7891234560003',
            'sku': 'OLE-BAR-001',
        },
        {
            'name': 'Cera Modeladora Matte',
            'description': 'Cera com efeito fosco',
            'category': 'cera',
            'cost_price': 14.00,
            'sale_price': 32.00,
            'stock_quantity': 20,
            'min_stock': 8,
            'barcode': '7891234560004',
            'sku': 'CER-MAT-001',
        },
        {
            'name': 'Gel Fixador Extra Forte',
            'description': 'Gel com fixação extra forte',
            'category': 'gel',
            'cost_price': 10.00,
            'sale_price': 22.00,
            'stock_quantity': 18,
            'min_stock': 5,
            'barcode': '7891234560005',
            'sku': 'GEL-EXT-001',
        },
        {
            'name': 'Talco Barber Shop',
            'description': 'Talco clássico de barbearia',
            'category': 'talco',
            'cost_price': 8.00,
            'sale_price': 18.00,
            'stock_quantity': 12,
            'min_stock': 5,
            'barcode': '7891234560006',
            'sku': 'TAL-BAR-001',
        },
        {
            'name': 'Lâminas Descartáveis (Cx c/ 100)',
            'description': 'Caixa com 100 lâminas descartáveis',
            'category': 'navalhete',
            'cost_price': 25.00,
            'sale_price': 50.00,
            'stock_quantity': 8,
            'min_stock': 3,
            'barcode': '7891234560007',
            'sku': 'LAM-DES-100',
        },
        {
            'name': 'Condicionador Hidratante',
            'description': 'Condicionador para hidratação profunda',
            'category': 'condicionador',
            'cost_price': 13.00,
            'sale_price': 30.00,
            'stock_quantity': 10,
            'min_stock': 5,
            'barcode': '7891234560008',
            'sku': 'CON-HID-001',
        },
        {
            'name': 'Pomada Light Shine',
            'description': 'Pomada com brilho leve, fixação média',
            'category': 'pomada',
            'cost_price': 14.00,
            'sale_price': 32.00,
            'stock_quantity': 4,  # ESTOQUE BAIXO
            'min_stock': 5,
            'barcode': '7891234560009',
            'sku': 'POM-LIG-001',
        },
        {
            'name': 'Toalha Profissional Preta',
            'description': 'Toalha 100% algodão para barbearia',
            'category': 'toalha',
            'cost_price': 20.00,
            'sale_price': 45.00,
            'stock_quantity': 0,  # SEM ESTOQUE
            'min_stock': 10,
            'barcode': '7891234560010',
            'sku': 'TOA-PRO-BLA',
        },
    ]
    
    # Criar produtos
    created_products = []
    for prod_data in products_data:
        product = Product.objects.create(
            tenant=tenant,
            **prod_data
        )
        created_products.append(product)
        
        status_emoji = '✅'
        if product.stock_quantity == 0:
            status_emoji = '❌'
        elif product.is_low_stock:
            status_emoji = '⚠️'
        
        print(f'{status_emoji} {product.name}')
        print(f'   💰 Custo: R$ {product.cost_price} | Venda: R$ {product.sale_price}')
        print(f'   📦 Estoque: {product.stock_quantity} (mín: {product.min_stock})')
        print(f'   📊 Margem: {product.profit_margin:.1f}%')
        print()
    
    print('=' * 60)
    print(f'✅ {len(created_products)} produtos criados com sucesso!')
    print()
    
    print('=' * 60)
    print('🎉 BANCO POPULADO COM SUCESSO!')
    print()
    print('📊 RESUMO:')
    print(f'   Total de produtos: {len(created_products)}')
    print(f'   Produtos ativos: {Product.objects.filter(tenant=tenant, is_active=True).count()}')
    print(f'   Com estoque baixo: {Product.objects.filter(tenant=tenant, stock_quantity__lte=5, stock_quantity__gt=0).count()}')
    print(f'   Sem estoque: {Product.objects.filter(tenant=tenant, stock_quantity=0).count()}')
    print()
    print('💡 As movimentações de estoque serão criadas automaticamente')
    print('   quando você usar os endpoints da API ou o PDV.')
    print()
    
except Exception as e:
    print(f'❌ ERRO: {e}')
    import traceback
    traceback.print_exc()
