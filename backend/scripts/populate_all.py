"""
Script completo para popular o sistema com dados realistas para screenshots
"""
import os
import sys
import django
from decimal import Decimal
from datetime import datetime, timedelta
import random

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from customers.models import Customer
from inventory.models import Product, Category as ProductCategory
from scheduling.models import Service, ServiceCategory, Appointment
from pos.models import Sale, SaleItem, CashRegister
from financial.models import Account, Transaction
from commissions.models import CommissionRule, Commission
from goals.models import Goal, GoalProgress
from core.models import Tenant

User = get_user_model()

def get_or_create_tenant():
    """Obtém ou cria tenant de demonstração"""
    tenant, created = Tenant.objects.get_or_create(
        name="Salão Beleza & Estilo",
        defaults={
            'subdomain': 'demo',
            'is_active': True
        }
    )
    if created:
        print(f"✅ Tenant criado: {tenant.name}")
    else:
        print(f"✅ Usando tenant existente: {tenant.name}")
    return tenant

def create_users(tenant):
    """Cria usuários profissionais"""
    print("\n👥 Criando usuários profissionais...")
    
    users_data = [
        {
            'email': 'admin@teste.com',
            'password': 'Admin@123',
            'first_name': 'Admin',
            'last_name': 'Sistema',
            'is_staff': True,
            'is_superuser': True,
        },
        {
            'email': 'ana.silva@demo.com',
            'password': 'Demo@123',
            'first_name': 'Ana',
            'last_name': 'Silva',
        },
        {
            'email': 'carlos.souza@demo.com',
            'password': 'Demo@123',
            'first_name': 'Carlos',
            'last_name': 'Souza',
        },
        {
            'email': 'maria.santos@demo.com',
            'password': 'Demo@123',
            'first_name': 'Maria',
            'last_name': 'Santos',
        },
    ]
    
    users = []
    for user_data in users_data:
        user, created = User.objects.get_or_create(
            email=user_data['email'],
            defaults={
                'tenant': tenant,
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name'],
                'is_staff': user_data.get('is_staff', False),
                'is_superuser': user_data.get('is_superuser', False),
            }
        )
        if created:
            user.set_password(user_data['password'])
            user.save()
            print(f"  ✅ Criado: {user.get_full_name()} ({user.email})")
        users.append(user)
    
    return users

def create_customers(tenant):
    """Cria clientes de demonstração"""
    print("\n👤 Criando clientes...")
    
    customers_data = [
        {'name': 'João Pedro Santos', 'email': 'joao.santos@email.com', 'phone': '(11) 98765-4321'},
        {'name': 'Maria Oliveira Costa', 'email': 'maria.costa@email.com', 'phone': '(11) 97654-3210'},
        {'name': 'Ana Paula Ferreira', 'email': 'ana.ferreira@email.com', 'phone': '(11) 96543-2109'},
        {'name': 'Carlos Eduardo Lima', 'email': 'carlos.lima@email.com', 'phone': '(11) 95432-1098'},
        {'name': 'Juliana Rodrigues', 'email': 'juliana.rodrigues@email.com', 'phone': '(11) 94321-0987'},
        {'name': 'Fernando Almeida', 'email': 'fernando.almeida@email.com', 'phone': '(11) 93210-9876'},
        {'name': 'Patricia Souza', 'email': 'patricia.souza@email.com', 'phone': '(11) 92109-8765'},
        {'name': 'Ricardo Martins', 'email': 'ricardo.martins@email.com', 'phone': '(11) 91098-7654'},
        {'name': 'Camila Nascimento', 'email': 'camila.nascimento@email.com', 'phone': '(11) 90987-6543'},
        {'name': 'Bruno Carvalho', 'email': 'bruno.carvalho@email.com', 'phone': '(11) 89876-5432'},
        {'name': 'Larissa Pereira', 'email': 'larissa.pereira@email.com', 'phone': '(11) 88765-4321'},
        {'name': 'Gabriel Costa', 'email': 'gabriel.costa@email.com', 'phone': '(11) 87654-3210'},
        {'name': 'Beatriz Lima', 'email': 'beatriz.lima@email.com', 'phone': '(11) 86543-2109'},
        {'name': 'Thiago Santos', 'email': 'thiago.santos@email.com', 'phone': '(11) 85432-1098'},
        {'name': 'Amanda Oliveira', 'email': 'amanda.oliveira@email.com', 'phone': '(11) 84321-0987'},
    ]
    
    customers = []
    for i, data in enumerate(customers_data):
        customer, created = Customer.objects.get_or_create(
            tenant=tenant,
            email=data['email'],
            defaults={
                'name': data['name'],
                'phone': data['phone'],
                'birth_date': datetime.now().date() - timedelta(days=random.randint(7000, 15000)),
                'notes': 'Cliente demonstração' if i < 5 else '',
            }
        )
        if created:
            print(f"  ✅ {customer.name}")
        customers.append(customer)
    
    return customers

def create_service_categories(tenant):
    """Cria categorias de serviços"""
    print("\n✂️ Criando categorias de serviços...")
    
    categories_data = [
        'Corte',
        'Barba',
        'Coloração',
        'Tratamento Capilar',
        'Manicure & Pedicure',
        'Depilação',
        'Maquiagem',
        'Design de Sobrancelhas',
    ]
    
    categories = []
    for name in categories_data:
        category, created = ServiceCategory.objects.get_or_create(
            tenant=tenant,
            name=name,
            defaults={'description': f'Serviços de {name}'}
        )
        if created:
            print(f"  ✅ {name}")
        categories.append(category)
    
    return categories

def create_services(tenant, categories, users):
    """Cria serviços"""
    print("\n💇 Criando serviços...")
    
    services_data = [
        {'name': 'Corte Masculino', 'category': 0, 'price': '45.00', 'duration': 30, 'commission': '15.00'},
        {'name': 'Corte Feminino', 'category': 0, 'price': '60.00', 'duration': 45, 'commission': '20.00'},
        {'name': 'Corte Infantil', 'category': 0, 'price': '35.00', 'duration': 25, 'commission': '12.00'},
        {'name': 'Barba Completa', 'category': 1, 'price': '40.00', 'duration': 30, 'commission': '15.00'},
        {'name': 'Barba + Corte', 'category': 1, 'price': '75.00', 'duration': 60, 'commission': '25.00'},
        {'name': 'Coloração Completa', 'category': 2, 'price': '150.00', 'duration': 120, 'commission': '50.00'},
        {'name': 'Mechas', 'category': 2, 'price': '180.00', 'duration': 150, 'commission': '60.00'},
        {'name': 'Hidratação', 'category': 3, 'price': '80.00', 'duration': 60, 'commission': '25.00'},
        {'name': 'Reconstrução Capilar', 'category': 3, 'price': '120.00', 'duration': 90, 'commission': '40.00'},
        {'name': 'Manicure', 'category': 4, 'price': '35.00', 'duration': 45, 'commission': '12.00'},
        {'name': 'Pedicure', 'category': 4, 'price': '40.00', 'duration': 50, 'commission': '15.00'},
        {'name': 'Manicure + Pedicure', 'category': 4, 'price': '70.00', 'duration': 90, 'commission': '25.00'},
        {'name': 'Depilação Facial', 'category': 5, 'price': '30.00', 'duration': 20, 'commission': '10.00'},
        {'name': 'Depilação Pernas', 'category': 5, 'price': '60.00', 'duration': 40, 'commission': '20.00'},
        {'name': 'Maquiagem Social', 'category': 6, 'price': '100.00', 'duration': 60, 'commission': '35.00'},
        {'name': 'Maquiagem Noiva', 'category': 6, 'price': '250.00', 'duration': 120, 'commission': '80.00'},
        {'name': 'Design de Sobrancelhas', 'category': 7, 'price': '40.00', 'duration': 30, 'commission': '15.00'},
        {'name': 'Micropigmentação', 'category': 7, 'price': '300.00', 'duration': 180, 'commission': '100.00'},
    ]
    
    services = []
    for data in services_data:
        service, created = Service.objects.get_or_create(
            tenant=tenant,
            name=data['name'],
            defaults={
                'category': categories[data['category']],
                'description': f'Serviço de {data["name"]}',
                'price': data['price'],
                'duration': data['duration'],
                'commission_type': 'fixed',
                'commission_value': data['commission'],
                'is_active': True,
            }
        )
        if created:
            print(f"  ✅ {service.name} - R$ {service.price}")
        services.append(service)
    
    return services

def create_product_categories(tenant):
    """Cria categorias de produtos"""
    print("\n📦 Criando categorias de produtos...")
    
    categories_data = [
        'Shampoo',
        'Condicionador',
        'Máscara Capilar',
        'Coloração',
        'Finalizador',
        'Ferramentas',
        'Acessórios',
    ]
    
    categories = []
    for name in categories_data:
        category, created = ProductCategory.objects.get_or_create(
            tenant=tenant,
            name=name,
            defaults={'description': f'Produtos de {name}'}
        )
        if created:
            print(f"  ✅ {name}")
        categories.append(category)
    
    return categories

def create_products(tenant, categories):
    """Cria produtos"""
    print("\n🛍️ Criando produtos...")
    
    products_data = [
        {'name': 'Shampoo Hidratante 500ml', 'category': 0, 'cost': '25.00', 'price': '45.00', 'stock': 50},
        {'name': 'Shampoo Anti-Resíduo 400ml', 'category': 0, 'cost': '30.00', 'price': '55.00', 'stock': 30},
        {'name': 'Condicionador Nutritivo 500ml', 'category': 1, 'cost': '28.00', 'price': '48.00', 'stock': 45},
        {'name': 'Máscara de Hidratação 250g', 'category': 2, 'cost': '40.00', 'price': '75.00', 'stock': 35},
        {'name': 'Máscara de Reconstrução 300g', 'category': 2, 'cost': '50.00', 'price': '90.00', 'stock': 25},
        {'name': 'Coloração Permanente - Preto', 'category': 3, 'cost': '15.00', 'price': '28.00', 'stock': 60},
        {'name': 'Coloração Permanente - Castanho', 'category': 3, 'cost': '15.00', 'price': '28.00', 'stock': 55},
        {'name': 'Coloração Permanente - Loiro', 'category': 3, 'cost': '15.00', 'price': '28.00', 'stock': 40},
        {'name': 'Leave-in 200ml', 'category': 4, 'cost': '20.00', 'price': '38.00', 'stock': 40},
        {'name': 'Sérum Anti-Frizz 60ml', 'category': 4, 'cost': '35.00', 'price': '65.00', 'stock': 30},
        {'name': 'Spray Fixador 300ml', 'category': 4, 'cost': '18.00', 'price': '32.00', 'stock': 35},
        {'name': 'Tesoura Profissional', 'category': 5, 'cost': '80.00', 'price': '150.00', 'stock': 10},
        {'name': 'Pente de Corte', 'category': 5, 'cost': '12.00', 'price': '25.00', 'stock': 20},
        {'name': 'Escova Térmica Grande', 'category': 5, 'cost': '25.00', 'price': '45.00', 'stock': 15},
        {'name': 'Presilha para Cabelo (Pacote 10un)', 'category': 6, 'cost': '8.00', 'price': '15.00', 'stock': 100},
        {'name': 'Touca de Banho', 'category': 6, 'cost': '5.00', 'price': '12.00', 'stock': 80},
        {'name': 'Esmalte Vermelho', 'category': 6, 'cost': '6.00', 'price': '12.00', 'stock': 70},
        {'name': 'Esmalte Rosa', 'category': 6, 'cost': '6.00', 'price': '12.00', 'stock': 65},
    ]
    
    products = []
    for data in products_data:
        product, created = Product.objects.get_or_create(
            tenant=tenant,
            name=data['name'],
            defaults={
                'category': categories[data['category']],
                'description': f'Produto de qualidade: {data["name"]}',
                'sku': f'PROD{random.randint(1000, 9999)}',
                'cost_price': data['cost'],
                'sale_price': data['price'],
                'stock': data['stock'],
                'min_stock': 10,
                'is_active': True,
            }
        )
        if created:
            print(f"  ✅ {product.name} - R$ {product.sale_price} (estoque: {product.stock})")
        products.append(product)
    
    return products

def create_appointments(tenant, customers, services, users):
    """Cria agendamentos"""
    print("\n📅 Criando agendamentos...")
    
    today = datetime.now().date()
    appointments_created = 0
    
    # Agendamentos dos últimos 30 dias
    for days_ago in range(30, 0, -1):
        date = today - timedelta(days=days_ago)
        
        # 2-4 agendamentos por dia
        num_appointments = random.randint(2, 4)
        for _ in range(num_appointments):
            customer = random.choice(customers)
            service = random.choice(services)
            professional = random.choice([u for u in users if not u.is_superuser])
            
            hour = random.randint(9, 17)
            minute = random.choice([0, 30])
            start_time = datetime.combine(date, datetime.min.time().replace(hour=hour, minute=minute))
            
            status = random.choice(['completed', 'completed', 'completed', 'cancelled', 'no_show'])
            
            appointment, created = Appointment.objects.get_or_create(
                tenant=tenant,
                customer=customer,
                service=service,
                professional=professional,
                start_time=start_time,
                defaults={
                    'end_time': start_time + timedelta(minutes=service.duration),
                    'status': status,
                    'notes': 'Agendamento demonstração',
                }
            )
            if created:
                appointments_created += 1
    
    # Agendamentos futuros (próximos 7 dias)
    for days_ahead in range(1, 8):
        date = today + timedelta(days=days_ahead)
        
        num_appointments = random.randint(3, 5)
        for _ in range(num_appointments):
            customer = random.choice(customers)
            service = random.choice(services)
            professional = random.choice([u for u in users if not u.is_superuser])
            
            hour = random.randint(9, 17)
            minute = random.choice([0, 30])
            start_time = datetime.combine(date, datetime.min.time().replace(hour=hour, minute=minute))
            
            appointment, created = Appointment.objects.get_or_create(
                tenant=tenant,
                customer=customer,
                service=service,
                professional=professional,
                start_time=start_time,
                defaults={
                    'end_time': start_time + timedelta(minutes=service.duration),
                    'status': 'scheduled',
                    'notes': 'Agendamento futuro',
                }
            )
            if created:
                appointments_created += 1
    
    print(f"  ✅ {appointments_created} agendamentos criados")

def create_sales(tenant, customers, products, services, users):
    """Cria vendas no PDV"""
    print("\n💰 Criando vendas...")
    
    # Primeiro, abrir um caixa
    cash_register, created = CashRegister.objects.get_or_create(
        tenant=tenant,
        is_open=True,
        defaults={
            'opened_by': users[1],
            'opening_balance': Decimal('200.00'),
            'opened_at': datetime.now() - timedelta(hours=8),
        }
    )
    if created:
        print(f"  ✅ Caixa aberto com saldo inicial R$ 200.00")
    
    today = datetime.now().date()
    sales_created = 0
    
    # Vendas dos últimos 30 dias
    for days_ago in range(30, 0, -1):
        date = today - timedelta(days=days_ago)
        
        # 3-6 vendas por dia
        num_sales = random.randint(3, 6)
        for _ in range(num_sales):
            customer = random.choice(customers) if random.random() > 0.3 else None
            professional = random.choice([u for u in users if not u.is_superuser])
            
            sale = Sale.objects.create(
                tenant=tenant,
                customer=customer,
                professional=professional,
                cash_register=cash_register,
                payment_method=random.choice(['cash', 'credit_card', 'debit_card', 'pix']),
                payment_status='paid',
                discount=Decimal('0.00'),
                created_at=datetime.combine(date, datetime.min.time().replace(hour=random.randint(9, 18))),
            )
            
            # Adicionar 1-3 itens por venda
            num_items = random.randint(1, 3)
            
            # Pelo menos 1 serviço
            service = random.choice(services)
            SaleItem.objects.create(
                tenant=tenant,
                sale=sale,
                service=service,
                professional=professional,
                quantity=1,
                unit_price=service.price,
                discount=Decimal('0.00'),
            )
            
            # Produtos opcionais
            if num_items > 1:
                for _ in range(num_items - 1):
                    if random.random() > 0.5:  # 50% chance de adicionar produto
                        product = random.choice(products)
                        quantity = random.randint(1, 3)
                        SaleItem.objects.create(
                            tenant=tenant,
                            sale=sale,
                            product=product,
                            quantity=quantity,
                            unit_price=product.sale_price,
                            discount=Decimal('0.00'),
                        )
            
            sale.calculate_total()
            sales_created += 1
    
    print(f"  ✅ {sales_created} vendas criadas")

def create_goals(tenant, users):
    """Cria metas"""
    print("\n🎯 Criando metas...")
    
    today = datetime.now().date()
    current_month_start = today.replace(day=1)
    next_month_start = (today.replace(day=28) + timedelta(days=4)).replace(day=1)
    current_month_end = next_month_start - timedelta(days=1)
    
    goals_data = [
        {
            'name': 'Faturamento Novembro',
            'type': 'team',
            'target_type': 'revenue',
            'target_value': '15000.00',
            'period': 'monthly',
            'start_date': current_month_start,
            'end_date': current_month_end,
        },
        {
            'name': 'Meta de Vendas - Ana',
            'type': 'individual',
            'professional': users[1],
            'target_type': 'sales_count',
            'target_value': '50',
            'period': 'monthly',
            'start_date': current_month_start,
            'end_date': current_month_end,
        },
        {
            'name': 'Meta de Vendas - Carlos',
            'type': 'individual',
            'professional': users[2],
            'target_type': 'sales_count',
            'target_value': '45',
            'period': 'monthly',
            'start_date': current_month_start,
            'end_date': current_month_end,
        },
        {
            'name': 'Novos Clientes - Equipe',
            'type': 'team',
            'target_type': 'new_customers',
            'target_value': '20',
            'period': 'monthly',
            'start_date': current_month_start,
            'end_date': current_month_end,
        },
        {
            'name': 'Serviços Realizados - Maria',
            'type': 'individual',
            'professional': users[3],
            'target_type': 'services_count',
            'target_value': '40',
            'period': 'monthly',
            'start_date': current_month_start,
            'end_date': current_month_end,
        },
    ]
    
    for data in goals_data:
        goal, created = Goal.objects.get_or_create(
            tenant=tenant,
            name=data['name'],
            defaults={
                'description': f'Meta de {data["name"]}',
                'type': data['type'],
                'professional': data.get('professional'),
                'target_type': data['target_type'],
                'target_value': data['target_value'],
                'period': data['period'],
                'start_date': data['start_date'],
                'end_date': data['end_date'],
                'status': 'active',
            }
        )
        if created:
            # Atualizar progresso
            goal.update_progress()
            print(f"  ✅ {goal.name} - {goal.percentage()}%")

def main():
    """Executa população completa"""
    print("="*60)
    print("🚀 POPULAÇÃO COMPLETA DO SISTEMA")
    print("="*60)
    
    tenant = get_or_create_tenant()
    users = create_users(tenant)
    customers = create_customers(tenant)
    
    service_categories = create_service_categories(tenant)
    services = create_services(tenant, service_categories, users)
    
    product_categories = create_product_categories(tenant)
    products = create_products(tenant, product_categories)
    
    create_appointments(tenant, customers, services, users)
    create_sales(tenant, customers, products, services, users)
    create_goals(tenant, users)
    
    print("\n" + "="*60)
    print("✅ POPULAÇÃO CONCLUÍDA COM SUCESSO!")
    print("="*60)
    print("\n📊 RESUMO:")
    print(f"  • Tenant: {tenant.name}")
    print(f"  • Usuários: {len(users)}")
    print(f"  • Clientes: {Customer.objects.filter(tenant=tenant).count()}")
    print(f"  • Serviços: {Service.objects.filter(tenant=tenant).count()}")
    print(f"  • Produtos: {Product.objects.filter(tenant=tenant).count()}")
    print(f"  • Agendamentos: {Appointment.objects.filter(tenant=tenant).count()}")
    print(f"  • Vendas: {Sale.objects.filter(tenant=tenant).count()}")
    print(f"  • Metas: {Goal.objects.filter(tenant=tenant).count()}")
    print("\n💡 Sistema pronto para capturas de tela!")
    print("="*60)

if __name__ == '__main__':
    main()
