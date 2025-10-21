"""
Script completo de populacao do banco de dados
Popula todos os modulos com dados realistas para o tenant 'Barbearia do Joao'
"""
import os
import sys
import django
from datetime import datetime, timedelta
from decimal import Decimal
import random

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from core.models import Tenant
from customers.models import Customer
from scheduling.models import Service, Appointment
from inventory.models import Product, StockMovement
from financial.models import PaymentMethod, Transaction
from commissions.models import CommissionRule, Commission

User = get_user_model()

def print_status(message):
    """Print sem emojis para evitar problemas de encoding no Windows"""
    print(f"\n>>> {message}")

def populate_payment_methods(tenant):
    """Cria metodos de pagamento"""
    print_status("Criando metodos de pagamento...")
    
    methods = [
        'Dinheiro',
        'PIX',
        'Cartao de Credito',
        'Cartao de Debito',
        'Transferencia Bancaria',
    ]
    
    created = []
    for name in methods:
        method, was_created = PaymentMethod.objects.get_or_create(
            tenant=tenant,
            name=name,
            defaults={'is_active': True}
        )
        if was_created:
            created.append(method)
            print(f"  - {name}")
    
    return created

def populate_services(tenant):
    """Cria servicos"""
    print_status("Criando servicos...")
    
    services_data = [
        {'name': 'Corte Masculino', 'description': 'Corte de cabelo masculino tradicional', 'price': '35.00', 'duration_minutes': 30},
        {'name': 'Corte + Barba', 'description': 'Corte de cabelo e barba completa', 'price': '55.00', 'duration_minutes': 45},
        {'name': 'Barba', 'description': 'Servico de barba completo', 'price': '25.00', 'duration_minutes': 20},
        {'name': 'Sobrancelha', 'description': 'Design de sobrancelha', 'price': '15.00', 'duration_minutes': 15},
        {'name': 'Corte Infantil', 'description': 'Corte de cabelo para criancas ate 10 anos', 'price': '30.00', 'duration_minutes': 25},
        {'name': 'Luzes/Tintura', 'description': 'Aplicacao de luzes ou tintura completa', 'price': '80.00', 'duration_minutes': 90},
        {'name': 'Hidratacao', 'description': 'Tratamento de hidratacao capilar', 'price': '40.00', 'duration_minutes': 40},
        {'name': 'Progressiva', 'description': 'Escova progressiva profissional', 'price': '120.00', 'duration_minutes': 120},
    ]
    
    created = []
    for data in services_data:
        service, was_created = Service.objects.get_or_create(
            tenant=tenant,
            name=data['name'],
            defaults={
                'description': data['description'],
                'price': Decimal(data['price']),
                'duration_minutes': data['duration_minutes'],
                'is_active': True
            }
        )
        if was_created:
            created.append(service)
            print(f"  - {data['name']} (R$ {data['price']})")
    
    return created

def populate_products(tenant):
    """Cria produtos"""
    print_status("Criando produtos...")
    
    products_data = [
        {'name': 'Pomada Modeladora Premium', 'category': 'pomada', 'cost': '18.00', 'sale': '35.00', 'stock': 25, 'min': 5},
        {'name': 'Pomada Efeito Molhado', 'category': 'pomada', 'cost': '15.00', 'sale': '30.00', 'stock': 30, 'min': 5},
        {'name': 'Shampoo Antiqueda 300ml', 'category': 'shampoo', 'cost': '20.00', 'sale': '42.00', 'stock': 18, 'min': 3},
        {'name': 'Shampoo 2 em 1', 'category': 'shampoo', 'cost': '12.00', 'sale': '28.00', 'stock': 22, 'min': 5},
        {'name': 'Condicionador Hidratante', 'category': 'condicionador', 'cost': '15.00', 'sale': '32.00', 'stock': 20, 'min': 4},
        {'name': 'Oleo de Barba Premium', 'category': 'oleo', 'cost': '22.00', 'sale': '45.00', 'stock': 15, 'min': 3},
        {'name': 'Oleo Capilar Argan', 'category': 'oleo', 'cost': '25.00', 'sale': '50.00', 'stock': 12, 'min': 3},
        {'name': 'Cera Modeladora Forte', 'category': 'cera', 'cost': '16.00', 'sale': '33.00', 'stock': 20, 'min': 4},
        {'name': 'Gel Fixador Extra Forte', 'category': 'gel', 'cost': '10.00', 'sale': '22.00', 'stock': 28, 'min': 6},
        {'name': 'Talco Perfumado', 'category': 'talco', 'cost': '8.00', 'sale': '18.00', 'stock': 35, 'min': 8},
        {'name': 'Kit Navalhas Descartaveis (10un)', 'category': 'navalhete', 'cost': '12.00', 'sale': '25.00', 'stock': 40, 'min': 10},
        {'name': 'Toalha Premium 100% Algodao', 'category': 'toalha', 'cost': '25.00', 'sale': '55.00', 'stock': 8, 'min': 2},
        {'name': 'Cera Depilatoria Roll-On', 'category': 'outro', 'cost': '8.00', 'sale': '20.00', 'stock': 30, 'min': 6},
        {'name': 'Pos-Barba Hidratante', 'category': 'outro', 'cost': '18.00', 'sale': '38.00', 'stock': 16, 'min': 4},
        {'name': 'Kit Presente (Pomada + Oleo)', 'category': 'outro', 'cost': '35.00', 'sale': '70.00', 'stock': 5, 'min': 2},
    ]
    
    created = []
    for data in products_data:
        product, was_created = Product.objects.get_or_create(
            tenant=tenant,
            name=data['name'],
            defaults={
                'description': f"Produto de qualidade para barbearia profissional",
                'category': data['category'],
                'cost_price': Decimal(data['cost']),
                'sale_price': Decimal(data['sale']),
                'stock_quantity': data['stock'],
                'min_stock': data['min'],
                'is_active': True
            }
        )
        if was_created:
            created.append(product)
            print(f"  - {data['name']} (Estoque: {data['stock']})")
    
    return created

def populate_appointments(tenant, customers, services, professionals):
    """Cria agendamentos passados e futuros"""
    print_status("Criando agendamentos...")
    
    if not services:
        print("  AVISO: Nenhum servico disponivel. Pulando agendamentos.")
        return []
    
    if not professionals:
        print("  AVISO: Nenhum profissional disponivel. Pulando agendamentos.")
        return []
    
    statuses_past = ['concluido', 'concluido', 'concluido', 'cancelado', 'falta']
    statuses_future = ['marcado', 'confirmado']
    
    created = []
    
    # Agendamentos passados (ultimos 60 dias)
    print("  Criando agendamentos passados...")
    for i in range(60):
        date = datetime.now() - timedelta(days=60-i)
        # 3-5 agendamentos por dia nos dias passados
        num_appointments = random.randint(3, 5)
        
        for j in range(num_appointments):
            customer = random.choice(customers)
            service = random.choice(services)
            professional = random.choice(professionals)
            
            # Horario entre 9h e 18h
            hour = random.randint(9, 17)
            minute = random.choice([0, 30])
            start_time = date.replace(hour=hour, minute=minute, second=0, microsecond=0)
            end_time = start_time + timedelta(minutes=service.duration_minutes)
            
            status = random.choice(statuses_past)
            
            appointment = Appointment.objects.create(
                tenant=tenant,
                customer=customer,
                customer_name=customer.name,
                customer_phone=customer.phone or '',
                customer_email=customer.email or '',
                service=service,
                professional=professional,
                start_time=start_time,
                end_time=end_time,
                status=status,
                notes=f"Agendamento via sistema - {status}"
            )
            created.append(appointment)
    
    print(f"  - {len(created)} agendamentos passados criados")
    
    # Agendamentos futuros (proximos 20 dias)
    print("  Criando agendamentos futuros...")
    future_count = 0
    for i in range(1, 21):
        date = datetime.now() + timedelta(days=i)
        # 2-4 agendamentos por dia nos dias futuros
        num_appointments = random.randint(2, 4)
        
        for j in range(num_appointments):
            customer = random.choice(customers)
            service = random.choice(services)
            professional = random.choice(professionals)
            
            hour = random.randint(9, 17)
            minute = random.choice([0, 30])
            start_time = date.replace(hour=hour, minute=minute, second=0, microsecond=0)
            end_time = start_time + timedelta(minutes=service.duration_minutes)
            
            status = random.choice(statuses_future)
            
            appointment = Appointment.objects.create(
                tenant=tenant,
                customer=customer,
                customer_name=customer.name,
                customer_phone=customer.phone or '',
                customer_email=customer.email or '',
                service=service,
                professional=professional,
                start_time=start_time,
                end_time=end_time,
                status=status,
                notes=f"Agendamento via sistema - {status}"
            )
            created.append(appointment)
            future_count += 1
    
    print(f"  - {future_count} agendamentos futuros criados")
    print(f"  TOTAL: {len(created)} agendamentos")
    
    return created

def populate_transactions(tenant, appointments, products, payment_methods):
    """Cria transacoes financeiras baseadas em agendamentos e produtos"""
    print_status("Criando transacoes financeiras...")
    
    if not payment_methods:
        print("  AVISO: Nenhum metodo de pagamento disponivel. Pulando transacoes.")
        return []
    
    created = []
    
    # Receitas de agendamentos concluidos
    completed = [a for a in appointments if a.status == 'concluido']
    for appointment in completed:
        method = random.choice(payment_methods)
        transaction = Transaction.objects.create(
            tenant=tenant,
            type='receita',
            category='servico',
            description=f"Servico: {appointment.service.name} - Cliente: {appointment.customer_name}",
            amount=appointment.service.price,
            date=appointment.start_time.date(),
            payment_method=method,
            paid=True,
            paid_at=appointment.start_time
        )
        created.append(transaction)
    
    print(f"  - {len(created)} receitas de servicos criadas")
    
    # Algumas vendas de produtos (15% dos agendamentos concluidos)
    product_sales = random.sample(completed, min(len(completed) // 7, len(completed)))
    for appointment in product_sales:
        product = random.choice(products)
        method = random.choice(payment_methods)
        transaction = Transaction.objects.create(
            tenant=tenant,
            type='receita',
            category='produto',
            description=f"Venda: {product.name} - Cliente: {appointment.customer_name}",
            amount=product.sale_price,
            date=appointment.start_time.date(),
            payment_method=method,
            paid=True,
            paid_at=appointment.start_time
        )
        created.append(transaction)
    
    print(f"  - {len(created) - len(completed)} receitas de produtos criadas")
    
    # Despesas fixas mensais
    despesas_fixas = [
        {'desc': 'Aluguel do Estabelecimento', 'valor': '2500.00', 'cat': 'aluguel'},
        {'desc': 'Conta de Luz', 'valor': '350.00', 'cat': 'outro'},
        {'desc': 'Conta de Agua', 'valor': '120.00', 'cat': 'outro'},
        {'desc': 'Internet e Telefone', 'valor': '180.00', 'cat': 'outro'},
    ]
    
    # Adiciona despesas dos ultimos 2 meses
    for mes in range(2):
        base_date = datetime.now() - timedelta(days=30 * (mes + 1))
        for desp in despesas_fixas:
            transaction = Transaction.objects.create(
                tenant=tenant,
                type='despesa',
                category=desp['cat'],
                description=desp['desc'],
                amount=Decimal(desp['valor']),
                date=base_date.replace(day=5).date(),
                paid=True,
                paid_at=base_date.replace(day=5)
            )
            created.append(transaction)
    
    print(f"  - {len(despesas_fixas) * 2} despesas fixas criadas")
    
    # Compra de produtos (estoque)
    for i in range(5):
        date = datetime.now() - timedelta(days=random.randint(10, 50))
        product = random.choice(products)
        quantity = random.randint(10, 30)
        total = product.cost_price * quantity
        
        transaction = Transaction.objects.create(
            tenant=tenant,
            type='despesa',
            category='fornecedor',
            description=f"Compra de estoque: {product.name} ({quantity} unidades)",
            amount=total,
            date=date.date(),
            paid=True,
            paid_at=date
        )
        created.append(transaction)
    
    print(f"  - 5 despesas de fornecedor criadas")
    print(f"  TOTAL: {len(created)} transacoes")
    
    return created

def populate_commission_rules(tenant, professionals, services):
    """Cria regras de comissao"""
    print_status("Criando regras de comissao...")
    
    if not professionals or not services:
        print("  AVISO: Sem profissionais ou servicos. Pulando regras.")
        return []
    
    created = []
    
    # Regra global padrao (30% para todos)
    rule, was_created = CommissionRule.objects.get_or_create(
        tenant=tenant,
        professional=None,
        service=None,
        defaults={
            'commission_percentage': Decimal('30.00'),
            'is_active': True,
            'priority': 0
        }
    )
    if was_created:
        created.append(rule)
        print(f"  - Regra Global: 30% para todos")
    
    # Regra especial para um profissional especifico (40%)
    if len(professionals) > 0:
        pro = professionals[0]
        rule, was_created = CommissionRule.objects.get_or_create(
            tenant=tenant,
            professional=pro,
            service=None,
            defaults={
                'commission_percentage': Decimal('40.00'),
                'is_active': True,
                'priority': 10
            }
        )
        if was_created:
            created.append(rule)
            print(f"  - Regra Especial: 40% para {pro.name}")
    
    # Regra especial para servico premium (35%)
    premium_services = [s for s in services if s.price >= Decimal('80.00')]
    if premium_services:
        service = premium_services[0]
        rule, was_created = CommissionRule.objects.get_or_create(
            tenant=tenant,
            professional=None,
            service=service,
            defaults={
                'commission_percentage': Decimal('35.00'),
                'is_active': True,
                'priority': 5
            }
        )
        if was_created:
            created.append(rule)
            print(f"  - Regra Premium: 35% para servico {service.name}")
    
    return created

def main():
    print("="*70)
    print("POPULACAO COMPLETA DO BANCO DE DADOS")
    print("="*70)
    
    # Obtem o tenant
    try:
        # Busca o primeiro tenant disponivel (geralmente e o unico)
        tenant = Tenant.objects.first()
        if not tenant:
            print("\nERRO: Nenhum tenant encontrado no banco!")
            return
        print(f"\nTenant encontrado: {tenant.name}")
    except Exception as e:
        print(f"\nERRO ao buscar tenant: {e}")
        return
    
    # Obtem profissionais do tenant
    professionals = list(User.objects.filter(tenant=tenant, is_staff=False))
    print(f"Profissionais disponiveis: {len(professionals)}")
    for pro in professionals:
        print(f"  - {pro.name} ({pro.email})")
    
    # Obtem clientes (ja criados anteriormente)
    customers = list(Customer.objects.filter(tenant=tenant))
    print(f"Clientes existentes: {len(customers)}")
    
    # Popula modulos
    payment_methods = populate_payment_methods(tenant)
    services = populate_services(tenant)
    products = populate_products(tenant)
    appointments = populate_appointments(tenant, customers, services, professionals)
    transactions = populate_transactions(tenant, appointments, products, payment_methods)
    commission_rules = populate_commission_rules(tenant, professionals, services)
    
    # Resumo final
    print("\n" + "="*70)
    print("RESUMO FINAL")
    print("="*70)
    print(f"Metodos de Pagamento: {PaymentMethod.objects.filter(tenant=tenant).count()}")
    print(f"Servicos: {Service.objects.filter(tenant=tenant).count()}")
    print(f"Clientes: {Customer.objects.filter(tenant=tenant).count()}")
    print(f"Produtos: {Product.objects.filter(tenant=tenant).count()}")
    print(f"Agendamentos: {Appointment.objects.filter(tenant=tenant).count()}")
    print(f"Transacoes: {Transaction.objects.filter(tenant=tenant).count()}")
    print(f"Regras de Comissao: {CommissionRule.objects.filter(tenant=tenant).count()}")
    print("\nSUCESSO! Banco de dados populado completamente!")
    print("="*70)

if __name__ == '__main__':
    main()
