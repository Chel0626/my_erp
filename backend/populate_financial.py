"""
Script para popular o banco com dados de teste do módulo Financeiro
Execute: python manage.py shell < populate_financial.py
"""
from datetime import datetime, timedelta
from decimal import Decimal
from django.utils import timezone

# Importações dos modelos
from core.models import Tenant, User
from financial.models import PaymentMethod, Transaction

# Busca o tenant e usuário
tenant = Tenant.objects.first()
user = User.objects.filter(tenant=tenant).first()

print(f"🏢 Tenant: {tenant.name}")
print(f"👤 Usuário: {user.email}\n")

# ==========================================
# 1. CRIAR MÉTODOS DE PAGAMENTO
# ==========================================
print("💳 Criando Métodos de Pagamento...")

payment_methods_data = [
    {"name": "Dinheiro", "is_active": True},
    {"name": "PIX", "is_active": True},
    {"name": "Cartão de Débito", "is_active": True},
    {"name": "Cartão de Crédito", "is_active": True},
    {"name": "Transferência Bancária", "is_active": True},
]

payment_methods = {}
for pm_data in payment_methods_data:
    pm, created = PaymentMethod.objects.get_or_create(
        tenant=tenant,
        name=pm_data['name'],
        defaults={'is_active': pm_data['is_active']}
    )
    payment_methods[pm_data['name']] = pm
    status = "✅ Criado" if created else "⏭️  Já existe"
    print(f"   {status}: {pm.name}")

print(f"\n✅ {len(payment_methods)} métodos de pagamento processados!\n")

# ==========================================
# 2. CRIAR TRANSAÇÕES (últimos 7 dias)
# ==========================================
print("💰 Criando Transações Financeiras...")

today = timezone.now().date()
transaction_count = 0

# Receitas dos últimos 7 dias
receitas = [
    # Hoje
    {"desc": "Corte - João Silva", "amount": "35.00", "days_ago": 0, "payment": "PIX"},
    {"desc": "Barba - Pedro Santos", "amount": "25.00", "days_ago": 0, "payment": "Dinheiro"},
    {"desc": "Corte + Barba - Carlos Lima", "amount": "50.00", "days_ago": 0, "payment": "Cartão de Débito"},
    
    # Ontem
    {"desc": "Corte - Maria Silva", "amount": "30.00", "days_ago": 1, "payment": "PIX"},
    {"desc": "Infantil - Joãozinho", "amount": "25.00", "days_ago": 1, "payment": "Dinheiro"},
    {"desc": "Corte + Barba - Roberto", "amount": "50.00", "days_ago": 1, "payment": "Cartão de Crédito"},
    
    # 2 dias atrás
    {"desc": "Corte - Ana Costa", "amount": "35.00", "days_ago": 2, "payment": "PIX"},
    {"desc": "Barba - Lucas Martins", "amount": "25.00", "days_ago": 2, "payment": "Dinheiro"},
    
    # 3 dias atrás
    {"desc": "Corte - Fernando Alves", "amount": "35.00", "days_ago": 3, "payment": "Cartão de Débito"},
    {"desc": "Corte + Barba - Ricardo", "amount": "50.00", "days_ago": 3, "payment": "PIX"},
    
    # 4 dias atrás
    {"desc": "Infantil - Pedrinho", "amount": "25.00", "days_ago": 4, "payment": "Dinheiro"},
    {"desc": "Corte - Gustavo", "amount": "35.00", "days_ago": 4, "payment": "PIX"},
    
    # 5 dias atrás
    {"desc": "Barba - Marcelo", "amount": "25.00", "days_ago": 5, "payment": "Dinheiro"},
    {"desc": "Corte + Barba - André", "amount": "50.00", "days_ago": 5, "payment": "Cartão de Crédito"},
    
    # 6 dias atrás
    {"desc": "Corte - Paulo", "amount": "35.00", "days_ago": 6, "payment": "PIX"},
    {"desc": "Corte - Rafael", "amount": "35.00", "days_ago": 6, "payment": "Dinheiro"},
]

for rec in receitas:
    date = today - timedelta(days=rec['days_ago'])
    Transaction.objects.create(
        tenant=tenant,
        created_by=user,
        type='receita',
        description=rec['desc'],
        amount=Decimal(rec['amount']),
        date=date,
        payment_method=payment_methods[rec['payment']],
        notes=''
    )
    transaction_count += 1
    print(f"   ✅ Receita: {rec['desc']} - R$ {rec['amount']}")

# Despesas dos últimos 7 dias
despesas = [
    # Hoje
    {"desc": "Conta de Luz", "amount": "250.00", "days_ago": 0, "payment": "PIX"},
    
    # 2 dias atrás
    {"desc": "Produtos (shampoo, condicionador)", "amount": "180.00", "days_ago": 2, "payment": "Cartão de Crédito"},
    
    # 3 dias atrás
    {"desc": "Aluguel", "amount": "1500.00", "days_ago": 3, "payment": "Transferência Bancária"},
    
    # 5 dias atrás
    {"desc": "Material de limpeza", "amount": "80.00", "days_ago": 5, "payment": "Dinheiro"},
    
    # 6 dias atrás
    {"desc": "Internet", "amount": "120.00", "days_ago": 6, "payment": "PIX"},
]

for desp in despesas:
    date = today - timedelta(days=desp['days_ago'])
    Transaction.objects.create(
        tenant=tenant,
        created_by=user,
        type='despesa',
        description=desp['desc'],
        amount=Decimal(desp['amount']),
        date=date,
        payment_method=payment_methods[desp['payment']],
        notes=''
    )
    transaction_count += 1
    print(f"   ⚠️  Despesa: {desp['desc']} - R$ {desp['amount']}")

print(f"\n✅ {transaction_count} transações criadas!\n")

# ==========================================
# 3. RESUMO
# ==========================================
print("=" * 50)
print("📊 RESUMO DO BANCO DE DADOS - MÓDULO FINANCEIRO")
print("=" * 50)

total_receitas = Transaction.objects.filter(tenant=tenant, type='receita').count()
total_despesas = Transaction.objects.filter(tenant=tenant, type='despesa').count()

valor_receitas = sum(
    [float(t.amount) for t in Transaction.objects.filter(tenant=tenant, type='receita')]
)
valor_despesas = sum(
    [float(t.amount) for t in Transaction.objects.filter(tenant=tenant, type='despesa')]
)
saldo = valor_receitas - valor_despesas

print(f"💳 Métodos de Pagamento: {PaymentMethod.objects.filter(tenant=tenant).count()}")
print(f"💰 Total de Receitas: {total_receitas} (R$ {valor_receitas:.2f})")
print(f"⚠️  Total de Despesas: {total_despesas} (R$ {valor_despesas:.2f})")
print(f"💵 Saldo: R$ {saldo:.2f}")
print("=" * 50)

print("\n🎉 Banco de dados populado com sucesso!")
print("🚀 Agora você pode testar o módulo financeiro!\n")
