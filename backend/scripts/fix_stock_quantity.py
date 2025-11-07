"""
Script para corrigir produtos sem stock_quantity
"""
import os
import sys
import django

# Configura Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from inventory.models import Product

def fix_stock_quantity():
    """Adiciona stock_quantity=0 para produtos que não têm"""
    products_without_stock = Product.objects.filter(stock_quantity__isnull=True)
    count = products_without_stock.count()
    
    if count == 0:
        print("✅ Todos os produtos já têm stock_quantity!")
        return
    
    print(f"📦 Encontrados {count} produtos sem stock_quantity")
    
    for product in products_without_stock:
        product.stock_quantity = 0
        product.save()
        print(f"  ✓ {product.name}: stock_quantity = 0")
    
    print(f"\n✅ Corrigidos {count} produtos!")

if __name__ == '__main__':
    fix_stock_quantity()
