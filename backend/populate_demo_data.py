"""
Script para popular dados de demonstração para o usuário admin
Email: mhmservicos91@gmail.com
"""
import os
import django
import sys
from datetime import datetime, timedelta
from decimal import Decimal
import random

# Configurar Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Configurar variáveis de ambiente necessárias
os.environ.setdefault('SECRET_KEY', 'django-insecure-desenvolvimento-key-temporaria')
os.environ.setdefault('DEBUG', 'True')
os.environ.setdefault('DATABASE_URL', 'sqlite:///db.sqlite3')

django.setup()

from core.models import User
from customers.models import Customer
from inventory.models import Product, Service
from scheduling.models import Appointment
from financial.models import Transaction, PaymentMethod
from commissions.models import Commission, CommissionRule
from goals.models import Goal

def get_admin_user():
    """Busca o usuário admin"""
    try:
        user = User.objects.get(email='mhmservicos91@gmail.com')
        print(f"✅ Usuário encontrado: {user.email} (Tenant: {user.tenant_id})")
        return user
    except User.DoesNotExist:
        print("❌ Usuário não encontrado. Verifique o email.")
        return None

def create_customers(user, count=20):
    """Cria clientes de demonstração"""
    print(f"\n📋 Criando {count} clientes...")
    
    nomes = ["João Silva", "Maria Santos", "Pedro Oliveira", "Ana Costa", "Carlos Souza",
             "Juliana Lima", "Roberto Alves", "Fernanda Rodrigues", "Lucas Ferreira", "Patrícia Martins",
             "Rafael Carvalho", "Camila Ribeiro", "Bruno Araújo", "Larissa Gomes", "Felipe Barbosa",
             "Beatriz Cardoso", "Thiago Dias", "Amanda Correia", "Gabriel Monteiro", "Mariana Freitas"]
    
    telefones_base = ["11", "21", "31", "41", "51"]
    
    customers = []
    for i in range(count):
        customer = Customer.objects.create(
            name=nomes[i],
            email=f"cliente{i+1}@email.com",
            phone=f"({random.choice(telefones_base)}) 9{random.randint(1000,9999)}-{random.randint(1000,9999)}",
            notes=f"Cliente VIP" if i % 5 == 0 else "Cliente regular",
            tenant=user.tenant,
            created_by=user
        )
        customers.append(customer)
    
    print(f"✅ {len(customers)} clientes criados")
    return customers

def create_products(user, count=15):
    """Cria produtos de demonstração"""
    print(f"\n🛍️ Criando {count} produtos...")
    
    produtos = [
        ("Pomada Modeladora", 35.90, 50),
        ("Shampoo Anticaspa", 28.50, 30),
        ("Cera Finalizadora", 42.00, 25),
        ("Óleo para Barba", 55.00, 20),
        ("Balm para Barba", 48.90, 18),
        ("Navalha Profissional", 120.00, 10),
        ("Tesoura Corte", 85.00, 8),
        ("Pente Madeira", 15.00, 40),
        ("Escova Profissional", 65.00, 12),
        ("Gel Fixador", 32.00, 35),
        ("Mousse Modelador", 38.50, 22),
        ("Spray Finalizador", 45.00, 28),
        ("Loção Pós-Barba", 52.00, 15),
        ("Kit Barba Completo", 150.00, 5),
        ("Máquina de Corte", 450.00, 3),
    ]
    
    products = []
    for i, (nome, preco, estoque) in enumerate(produtos):
        product = Product.objects.create(
            name=nome,
            description=f"Produto profissional de alta qualidade - {nome}",
            price=Decimal(str(preco)),
            cost=Decimal(str(preco * 0.6)),  # 40% de margem
            stock_quantity=estoque,
            min_stock_level=5,
            tenant=user.tenant,
            created_by=user
        )
        products.append(product)
    
    print(f"✅ {len(products)} produtos criados")
    return products

def create_services(user, count=10):
    """Cria serviços de demonstração"""
    print(f"\n✂️ Criando {count} serviços...")
    
    servicos = [
        ("Corte Masculino", 45.00, 30, "Corte profissional com acabamento"),
        ("Barba Completa", 35.00, 25, "Barba desenhada e aparada"),
        ("Corte + Barba", 70.00, 50, "Combo completo de corte e barba"),
        ("Platinado", 120.00, 90, "Descoloração completa"),
        ("Luzes", 150.00, 120, "Luzes profissionais"),
        ("Relaxamento", 80.00, 60, "Relaxamento capilar"),
        ("Hidratação", 60.00, 40, "Tratamento hidratante profundo"),
        ("Sobrancelha", 20.00, 15, "Design de sobrancelhas"),
        ("Pigmentação Barba", 100.00, 45, "Pigmentação profissional"),
        ("Spa da Barba", 90.00, 60, "Tratamento completo para barba"),
    ]
    
    services = []
    for nome, preco, duracao, descricao in servicos:
        service = Service.objects.create(
            name=nome,
            description=descricao,
            price=Decimal(str(preco)),
            duration_minutes=duracao,
            tenant=user.tenant,
            created_by=user
        )
        services.append(service)
    
    print(f"✅ {len(services)} serviços criados")
    return services

def create_appointments(user, customers, services, count=30):
    """Cria agendamentos (passados e futuros)"""
    print(f"\n📅 Criando {count} agendamentos...")
    
    now = datetime.now()
    appointments = []
    
    statuses = ['scheduled', 'completed', 'cancelled', 'no_show']
    weights = [0.3, 0.5, 0.1, 0.1]  # 30% agendado, 50% completo, 10% cancelado, 10% falta
    
    for i in range(count):
        # 60% passados, 40% futuros
        if random.random() < 0.6:
            days_offset = random.randint(-60, -1)
            status = random.choices(['completed', 'cancelled', 'no_show'], [0.7, 0.2, 0.1])[0]
        else:
            days_offset = random.randint(1, 30)
            status = 'scheduled'
        
        appointment_date = now + timedelta(days=days_offset)
        appointment_time = appointment_date.replace(
            hour=random.randint(9, 18),
            minute=random.choice([0, 30]),
            second=0,
            microsecond=0
        )
        
        service = random.choice(services)
        customer = random.choice(customers)
        
        appointment = Appointment.objects.create(
            customer=customer,
            service=service,
            professional=user,
            appointment_datetime=appointment_time,
            status=status,
            notes=f"Agendamento via WhatsApp" if i % 3 == 0 else "",
            tenant=user.tenant,
            created_by=user
        )
        appointments.append(appointment)
    
    print(f"✅ {len(appointments)} agendamentos criados")
    return appointments

def create_payment_methods(user):
    """Cria métodos de pagamento"""
    print(f"\n💳 Criando métodos de pagamento...")
    
    methods = [
        ("Dinheiro", True),
        ("Cartão de Débito", True),
        ("Cartão de Crédito", True),
        ("PIX", True),
        ("Transferência", True),
    ]
    
    payment_methods = []
    for name, is_active in methods:
        method, created = PaymentMethod.objects.get_or_create(
            name=name,
            tenant=user.tenant,
            defaults={'is_active': is_active}
        )
        payment_methods.append(method)
    
    print(f"✅ {len(payment_methods)} métodos de pagamento criados")
    return payment_methods

def create_transactions(user, customers, services, products, payment_methods, count=50):
    """Cria transações financeiras"""
    print(f"\n💰 Criando {count} transações financeiras...")
    
    now = datetime.now()
    transactions = []
    
    for i in range(count):
        # 70% receitas, 30% despesas
        is_income = random.random() < 0.7
        
        if is_income:
            transaction_type = 'income'
            category = random.choice(['service', 'product', 'other'])
            
            if category == 'service':
                service = random.choice(services)
                amount = service.price
                description = f"Serviço: {service.name}"
                related_customer = random.choice(customers)
            elif category == 'product':
                product = random.choice(products)
                quantity = random.randint(1, 3)
                amount = product.price * quantity
                description = f"Venda: {product.name} (x{quantity})"
                related_customer = random.choice(customers)
            else:
                amount = Decimal(str(random.uniform(50, 500)))
                description = "Outra receita"
                related_customer = None
        else:
            transaction_type = 'expense'
            category = random.choice(['supplies', 'salary', 'rent', 'utilities', 'other'])
            amount = Decimal(str(random.uniform(100, 2000)))
            description = f"Despesa: {category}"
            related_customer = None
        
        # 80% passadas, 20% futuras
        if random.random() < 0.8:
            days_offset = random.randint(-60, 0)
            status = random.choice(['paid', 'paid', 'paid', 'overdue'])  # Maioria pago
        else:
            days_offset = random.randint(1, 30)
            status = 'pending'
        
        transaction_date = (now + timedelta(days=days_offset)).date()
        
        transaction = Transaction.objects.create(
            type=transaction_type,
            category=category,
            amount=amount,
            description=description,
            date=transaction_date,
            status=status,
            payment_method=random.choice(payment_methods) if status == 'paid' else None,
            related_customer=related_customer,
            tenant=user.tenant,
            created_by=user
        )
        transactions.append(transaction)
    
    print(f"✅ {len(transactions)} transações criadas")
    return transactions

def create_commission_rules(user, services):
    """Cria regras de comissão"""
    print(f"\n💵 Criando regras de comissão...")
    
    rules = []
    
    # Regra geral - 10% de comissão
    rule = CommissionRule.objects.create(
        name="Comissão Padrão",
        rule_type='percentage',
        percentage=Decimal('10.00'),
        is_active=True,
        tenant=user.tenant,
        created_by=user
    )
    rules.append(rule)
    
    # Regras específicas para alguns serviços premium
    premium_services = [s for s in services if s.price > 100]
    for service in premium_services[:3]:
        rule = CommissionRule.objects.create(
            name=f"Comissão {service.name}",
            rule_type='percentage',
            percentage=Decimal('15.00'),
            service=service,
            is_active=True,
            tenant=user.tenant,
            created_by=user
        )
        rules.append(rule)
    
    print(f"✅ {len(rules)} regras de comissão criadas")
    return rules

def create_commissions(user, appointments):
    """Cria comissões baseadas nos agendamentos completos"""
    print(f"\n💸 Criando comissões...")
    
    completed_appointments = [a for a in appointments if a.status == 'completed']
    commissions = []
    
    for appointment in completed_appointments:
        # Comissão de 10-15% sobre o valor do serviço
        commission_percentage = Decimal(str(random.choice([10, 12, 15])))
        commission_amount = (appointment.service.price * commission_percentage / 100).quantize(Decimal('0.01'))
        
        # 70% pagas, 30% pendentes
        status = 'paid' if random.random() < 0.7 else 'pending'
        
        commission = Commission.objects.create(
            professional=user,
            appointment=appointment,
            amount=commission_amount,
            status=status,
            calculation_date=appointment.appointment_datetime.date(),
            payment_date=appointment.appointment_datetime.date() if status == 'paid' else None,
            tenant=user.tenant
        )
        commissions.append(commission)
    
    print(f"✅ {len(commissions)} comissões criadas")
    return commissions

def create_goals(user):
    """Cria metas"""
    print(f"\n🎯 Criando metas...")
    
    now = datetime.now()
    goals = []
    
    # Meta mensal de receita
    goal1 = Goal.objects.create(
        title="Meta de Receita Mensal",
        description="Alcançar R$ 15.000 em receitas no mês",
        metric='revenue',
        target_value=Decimal('15000.00'),
        current_value=Decimal(str(random.uniform(8000, 14000))),
        start_date=now.replace(day=1).date(),
        end_date=(now.replace(day=1) + timedelta(days=32)).replace(day=1).date() - timedelta(days=1),
        status='in_progress',
        assigned_to=user,
        tenant=user.tenant,
        created_by=user
    )
    goals.append(goal1)
    
    # Meta trimestral de atendimentos
    goal2 = Goal.objects.create(
        title="Meta de Atendimentos Q4",
        description="Realizar 200 atendimentos no trimestre",
        metric='appointments',
        target_value=Decimal('200'),
        current_value=Decimal(str(random.randint(120, 190))),
        start_date=(now.replace(day=1) - timedelta(days=60)).date(),
        end_date=(now.replace(day=1) + timedelta(days=30)).date(),
        status='in_progress',
        assigned_to=user,
        tenant=user.tenant,
        created_by=user
    )
    goals.append(goal2)
    
    # Meta de novos clientes
    goal3 = Goal.objects.create(
        title="Captação de Novos Clientes",
        description="Cadastrar 50 novos clientes no mês",
        metric='customers',
        target_value=Decimal('50'),
        current_value=Decimal(str(random.randint(30, 48))),
        start_date=now.replace(day=1).date(),
        end_date=(now.replace(day=1) + timedelta(days=32)).replace(day=1).date() - timedelta(days=1),
        status='in_progress',
        assigned_to=user,
        tenant=user.tenant,
        created_by=user
    )
    goals.append(goal3)
    
    print(f"✅ {len(goals)} metas criadas")
    return goals

def main():
    """Função principal"""
    print("=" * 60)
    print("🚀 POPULANDO DADOS DE DEMONSTRAÇÃO")
    print("=" * 60)
    
    # Buscar usuário
    user = get_admin_user()
    if not user:
        return
    
    # Verificar se já tem dados
    existing_customers = Customer.objects.filter(tenant=user.tenant).count()
    if existing_customers > 0:
        print(f"\n⚠️  ATENÇÃO: Já existem {existing_customers} clientes no sistema.")
        response = input("Deseja continuar e adicionar mais dados? (s/n): ")
        if response.lower() != 's':
            print("❌ Operação cancelada.")
            return
    
    try:
        # Popular dados
        customers = create_customers(user, 20)
        products = create_products(user, 15)
        services = create_services(user, 10)
        payment_methods = create_payment_methods(user)
        appointments = create_appointments(user, customers, services, 30)
        transactions = create_transactions(user, customers, services, products, payment_methods, 50)
        commission_rules = create_commission_rules(user, services)
        commissions = create_commissions(user, appointments)
        goals = create_goals(user)
        
        print("\n" + "=" * 60)
        print("✅ POPULAÇÃO CONCLUÍDA COM SUCESSO!")
        print("=" * 60)
        print(f"\n📊 RESUMO:")
        print(f"  • {len(customers)} clientes")
        print(f"  • {len(products)} produtos")
        print(f"  • {len(services)} serviços")
        print(f"  • {len(payment_methods)} métodos de pagamento")
        print(f"  • {len(appointments)} agendamentos")
        print(f"  • {len(transactions)} transações financeiras")
        print(f"  • {len(commission_rules)} regras de comissão")
        print(f"  • {len(commissions)} comissões")
        print(f"  • {len(goals)} metas")
        
        print(f"\n🎉 O usuário {user.email} agora tem dados completos para apresentação!")
        
    except Exception as e:
        print(f"\n❌ Erro ao popular dados: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
