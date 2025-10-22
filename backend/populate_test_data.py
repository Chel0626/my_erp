"""
Script para popular banco com dados de teste adicionais
Execute: python populate_test_data.py
"""
import os
import django
import random
from datetime import datetime, timedelta
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import Tenant, User
from customers.models import Customer
from scheduling.models import Service, Appointment
from inventory.models import Product, Category
from financial.models import Transaction, PaymentMethod
from commissions.models import CommissionRule

def create_customers(tenant, count=20):
    """Cria clientes de teste"""
    print(f"\n📋 Criando {count} clientes...")
    
    first_names = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Julia', 'Lucas', 'Beatriz', 'Rafael', 'Mariana']
    last_names = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Ferreira', 'Costa', 'Rodrigues', 'Almeida', 'Nascimento']
    tags = ['vip', 'regular', 'novo']
    
    for i in range(count):
        first = random.choice(first_names)
        last = random.choice(last_names)
        
        customer = Customer.objects.create(
            tenant=tenant,
            name=f"{first} {last}",
            email=f"{first.lower()}.{last.lower()}{i}@email.com",
            phone=f"(11) 9{random.randint(1000, 9999)}-{random.randint(1000, 9999)}",
            tag=random.choice(tags),
            notes=f"Cliente criado automaticamente para testes"
        )
        print(f"  ✅ {customer.name}")

def create_appointments(tenant, count=50):
    """Cria agendamentos de teste"""
    print(f"\n📅 Criando {count} agendamentos...")
    
    customers = list(Customer.objects.filter(tenant=tenant))
    services = list(Service.objects.filter(tenant=tenant))
    professionals = list(User.objects.filter(tenant=tenant, role__in=['admin', 'professional']))
    statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']
    
    if not customers or not services or not professionals:
        print("  ⚠️  Precisa ter clientes, serviços e profissionais cadastrados")
        return
    
    # Criar agendamentos nos últimos 30 dias e próximos 15 dias
    for i in range(count):
        # Data aleatória entre -30 e +15 dias
        days_offset = random.randint(-30, 15)
        date = datetime.now() + timedelta(days=days_offset)
        
        # Horário comercial (8h - 18h)
        hour = random.randint(8, 17)
        minute = random.choice([0, 30])
        start_time = date.replace(hour=hour, minute=minute, second=0, microsecond=0)
        
        customer = random.choice(customers)
        service = random.choice(services)
        professional = random.choice(professionals)
        
        # Status baseado na data
        if days_offset < -1:  # Passado
            status = random.choice(['completed', 'completed', 'completed', 'cancelled', 'falta'])
        elif days_offset == 0:  # Hoje
            status = random.choice(['confirmed', 'in_progress', 'completed'])
        else:  # Futuro
            status = random.choice(['pending', 'confirmed'])
        
        appointment = Appointment.objects.create(
            tenant=tenant,
            customer=customer,
            service=service,
            professional=professional,
            start_time=start_time,
            status=status,
            final_price=service.price,
            notes=f"Agendamento de teste #{i+1}"
        )
        print(f"  ✅ {customer.name} - {service.name} - {start_time.strftime('%d/%m %H:%M')} ({status})")

def create_products(tenant, count=15):
    """Cria produtos de teste"""
    print(f"\n📦 Criando {count} produtos...")
    
    # Criar categorias primeiro
    categories_data = [
        ('Pomadas', 'Pomadas e ceras para cabelo'),
        ('Shampoos', 'Shampoos profissionais'),
        ('Óleos', 'Óleos para barba e cabelo'),
        ('Ferramentas', 'Tesouras, máquinas e acessórios'),
    ]
    
    categories = []
    for name, desc in categories_data:
        category, _ = Category.objects.get_or_create(
            tenant=tenant,
            name=name,
            defaults={'description': desc}
        )
        categories.append(category)
    
    products_data = [
        ('Pomada Modeladora Forte', 'Pomadas', 45.90, 20, 5),
        ('Pomada Brilho Natural', 'Pomadas', 39.90, 15, 5),
        ('Shampoo Anti-Resíduos', 'Shampoos', 32.00, 25, 8),
        ('Shampoo para Barba', 'Shampoos', 28.50, 18, 6),
        ('Óleo para Barba Premium', 'Óleos', 55.00, 12, 4),
        ('Óleo Finalizador', 'Óleos', 42.00, 14, 5),
        ('Tesoura Profissional 6"', 'Ferramentas', 180.00, 5, 2),
        ('Máquina Clipper Pro', 'Ferramentas', 450.00, 3, 1),
        ('Pente Carbono', 'Ferramentas', 25.00, 30, 10),
        ('Cera Modeladora', 'Pomadas', 38.00, 22, 7),
        ('Condicionador Hidratante', 'Shampoos', 35.00, 20, 8),
        ('Óleo Pós-Barba', 'Óleos', 48.00, 10, 3),
        ('Navalha Retrátil', 'Ferramentas', 85.00, 8, 3),
        ('Gel Fixador Extra Forte', 'Pomadas', 29.90, 25, 8),
        ('Kit Manutenção Barba', 'Óleos', 120.00, 6, 2),
    ]
    
    for name, cat_name, price, stock, min_stock in products_data:
        category = next((c for c in categories if c.name == cat_name), categories[0])
        
        product = Product.objects.create(
            tenant=tenant,
            name=name,
            description=f"Produto profissional de alta qualidade: {name}",
            category=category,
            price=Decimal(str(price)),
            cost=Decimal(str(price * 0.6)),  # 60% do preço de venda
            stock=stock,
            min_stock=min_stock,
            sku=f"PROD{random.randint(1000, 9999)}"
        )
        print(f"  ✅ {product.name} - R$ {product.price} (Estoque: {product.stock})")

def create_transactions(tenant, count=30):
    """Cria transações financeiras de teste"""
    print(f"\n💰 Criando {count} transações...")
    
    # Criar métodos de pagamento
    payment_methods_data = [
        ('Dinheiro', True, 0),
        ('Cartão de Débito', True, 2.5),
        ('Cartão de Crédito', True, 3.8),
        ('PIX', True, 0),
    ]
    
    for name, active, fee in payment_methods_data:
        PaymentMethod.objects.get_or_create(
            tenant=tenant,
            name=name,
            defaults={'is_active': active, 'fee_percentage': Decimal(str(fee))}
        )
    
    payment_methods = list(PaymentMethod.objects.filter(tenant=tenant))
    
    # Transações de receita (de agendamentos)
    appointments = Appointment.objects.filter(
        tenant=tenant, 
        status='completed'
    ).order_by('-start_time')[:count]
    
    for appointment in appointments:
        payment_method = random.choice(payment_methods)
        
        Transaction.objects.create(
            tenant=tenant,
            type='income',
            amount=appointment.final_price,
            payment_method=payment_method,
            category='service',
            description=f"Pagamento - {appointment.service.name} - {appointment.customer.name}",
            date=appointment.start_time.date(),
            appointment=appointment
        )
        print(f"  ✅ Receita: R$ {appointment.final_price} - {appointment.customer.name}")
    
    # Algumas despesas aleatórias
    expense_categories = [
        ('rent', 'Aluguel do estabelecimento', 2500.00),
        ('utilities', 'Conta de luz', 350.00),
        ('utilities', 'Conta de água', 120.00),
        ('supplies', 'Compra de produtos', 800.00),
        ('marketing', 'Anúncios Facebook/Instagram', 450.00),
    ]
    
    for category, description, amount in expense_categories:
        date = datetime.now() - timedelta(days=random.randint(1, 30))
        
        Transaction.objects.create(
            tenant=tenant,
            type='expense',
            amount=Decimal(str(amount)),
            payment_method=payment_methods[0],  # Dinheiro
            category=category,
            description=description,
            date=date.date()
        )
        print(f"  ✅ Despesa: R$ {amount} - {description}")

def populate_all():
    """Popula todos os dados de teste"""
    print("\n" + "="*60)
    print("🚀 POPULANDO BANCO DE DADOS COM DADOS DE TESTE")
    print("="*60)
    
    # Pegar o primeiro tenant
    tenant = Tenant.objects.first()
    if not tenant:
        print("❌ Nenhum tenant encontrado. Execute create_superuser.py primeiro.")
        return
    
    print(f"\n📍 Usando tenant: {tenant.company_name}")
    
    # Verificar dados existentes
    print("\n📊 Dados atuais:")
    print(f"  - Clientes: {Customer.objects.filter(tenant=tenant).count()}")
    print(f"  - Serviços: {Service.objects.filter(tenant=tenant).count()}")
    print(f"  - Agendamentos: {Appointment.objects.filter(tenant=tenant).count()}")
    print(f"  - Produtos: {Product.objects.filter(tenant=tenant).count()}")
    print(f"  - Transações: {Transaction.objects.filter(tenant=tenant).count()}")
    
    # Perguntar se quer continuar
    response = input("\n❓ Deseja adicionar mais dados de teste? (s/n): ")
    if response.lower() != 's':
        print("❌ Cancelado.")
        return
    
    # Popular dados
    try:
        create_customers(tenant, count=20)
        create_products(tenant, count=15)
        create_appointments(tenant, count=50)
        create_transactions(tenant, count=30)
        
        print("\n" + "="*60)
        print("✅ DADOS DE TESTE CRIADOS COM SUCESSO!")
        print("="*60)
        
        # Mostrar totais finais
        print("\n📊 Totais finais:")
        print(f"  - Clientes: {Customer.objects.filter(tenant=tenant).count()}")
        print(f"  - Serviços: {Service.objects.filter(tenant=tenant).count()}")
        print(f"  - Agendamentos: {Appointment.objects.filter(tenant=tenant).count()}")
        print(f"  - Produtos: {Product.objects.filter(tenant=tenant).count()}")
        print(f"  - Transações: {Transaction.objects.filter(tenant=tenant).count()}")
        
        print("\n🎉 Agora você pode testar o sistema com dados realistas!")
        print("   Acesse: http://localhost:3000")
        print("   Login: admin@barbearia.com / admin123")
        
    except Exception as e:
        print(f"\n❌ Erro ao criar dados: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    populate_all()
