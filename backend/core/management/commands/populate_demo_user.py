"""
Django management command para popular dados de demonstração
Uso: python manage.py populate_demo_user --email gael@barber.com
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random
from decimal import Decimal

from core.models import User, Tenant
from customers.models import Customer
from inventory.models import Product, Service
from scheduling.models import Appointment
from financial.models import Transaction, PaymentMethod


class Command(BaseCommand):
    help = 'Popula dados de demonstração para um usuário específico'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='Email do usuário para popular dados',
            default='gael@barber.com'
        )

    def handle(self, *args, **options):
        email = options['email']
        
        try:
            user = User.objects.get(email=email)
            tenant = user.tenant
            
            self.stdout.write(self.style.SUCCESS(f'\n{"="*60}'))
            self.stdout.write(self.style.SUCCESS(f'Populando dados para: {user.email}'))
            self.stdout.write(self.style.SUCCESS(f'Tenant: {tenant.name}'))
            self.stdout.write(self.style.SUCCESS(f'{"="*60}\n'))
            
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Usuário {email} não encontrado!'))
            return
        
        # Popular dados
        customers = self.create_customers(user, tenant)
        services = self.create_services(user, tenant)
        products = self.create_products(user, tenant)
        payment_methods = self.create_payment_methods(tenant)
        appointments = self.create_appointments(user, tenant, customers, services)
        transactions = self.create_transactions(user, tenant, customers, services, products, payment_methods)
        
        self.stdout.write(self.style.SUCCESS(f'\n{"="*60}'))
        self.stdout.write(self.style.SUCCESS('POPULAÇÃO CONCLUÍDA COM SUCESSO!'))
        self.stdout.write(self.style.SUCCESS(f'{"="*60}'))
        self.stdout.write(self.style.SUCCESS(f'\nRESUMO:'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(customers)} clientes'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(services)} serviços'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(products)} produtos'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(payment_methods)} métodos de pagamento'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(appointments)} agendamentos'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(transactions)} transações'))
        
    def create_customers(self, user, tenant):
        """Cria clientes de demonstração"""
        self.stdout.write('Criando clientes...')
        
        nomes = [
            "João Silva", "Maria Santos", "Pedro Oliveira", "Ana Costa", "Carlos Souza",
            "Juliana Lima", "Roberto Alves", "Fernanda Rodrigues", "Lucas Ferreira", 
            "Patrícia Martins", "Rafael Carvalho", "Camila Ribeiro", "Bruno Araújo", 
            "Larissa Gomes", "Felipe Barbosa", "Beatriz Cardoso", "Thiago Dias", 
            "Amanda Correia", "Gabriel Monteiro", "Mariana Freitas"
        ]
        
        customers = []
        for i, nome in enumerate(nomes):
            customer = Customer.objects.create(
                name=nome,
                email=f"cliente{i+1}@email.com",
                phone=f"(11) 9{random.randint(1000,9999)}-{random.randint(1000,9999)}",
                notes="Cliente VIP" if i % 5 == 0 else "Cliente regular",
                tenant=tenant,
                created_by=user
            )
            customers.append(customer)
        
        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(customers)} clientes criados'))
        return customers
    
    def create_services(self, user, tenant):
        """Cria serviços de demonstração"""
        self.stdout.write('Criando serviços...')
        
        servicos_data = [
            ("Corte Masculino", "Corte profissional com acabamento", 45.00, 30),
            ("Barba Completa", "Barba desenhada e aparada", 35.00, 25),
            ("Corte + Barba", "Combo completo de corte e barba", 70.00, 50),
            ("Platinado", "Descoloração completa", 120.00, 90),
            ("Luzes", "Luzes profissionais", 150.00, 120),
            ("Relaxamento", "Relaxamento capilar", 80.00, 60),
            ("Hidratação", "Tratamento hidratante profundo", 60.00, 40),
            ("Sobrancelha", "Design de sobrancelhas", 20.00, 15),
            ("Pigmentação Barba", "Pigmentação profissional", 100.00, 45),
            ("Spa da Barba", "Tratamento completo para barba", 90.00, 60),
        ]
        
        services = []
        for nome, desc, preco, duracao in servicos_data:
            service = Service.objects.create(
                name=nome,
                description=desc,
                price=Decimal(str(preco)),
                duration_minutes=duracao,
                tenant=tenant,
                created_by=user
            )
            services.append(service)
        
        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(services)} serviços criados'))
        return services
    
    def create_products(self, user, tenant):
        """Cria produtos de demonstração"""
        self.stdout.write('Criando produtos...')
        
        produtos_data = [
            ("Pomada Modeladora", 35.90, 21.54, 50),
            ("Shampoo Anticaspa", 28.50, 17.10, 30),
            ("Cera Finalizadora", 42.00, 25.20, 25),
            ("Óleo para Barba", 55.00, 33.00, 20),
            ("Balm para Barba", 48.90, 29.34, 18),
            ("Navalha Profissional", 120.00, 72.00, 10),
            ("Tesoura Corte", 85.00, 51.00, 8),
            ("Pente Madeira", 15.00, 9.00, 40),
            ("Escova Profissional", 65.00, 39.00, 12),
            ("Gel Fixador", 32.00, 19.20, 35),
            ("Mousse Modelador", 38.50, 23.10, 22),
            ("Spray Finalizador", 45.00, 27.00, 28),
            ("Loção Pós-Barba", 52.00, 31.20, 15),
            ("Kit Barba Completo", 150.00, 90.00, 5),
            ("Máquina de Corte", 450.00, 270.00, 3),
        ]
        
        products = []
        for nome, preco, custo, estoque in produtos_data:
            product = Product.objects.create(
                name=nome,
                description=f"Produto profissional de alta qualidade - {nome}",
                price=Decimal(str(preco)),
                cost=Decimal(str(custo)),
                stock_quantity=estoque,
                min_stock_level=5,
                tenant=tenant,
                created_by=user
            )
            products.append(product)
        
        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(products)} produtos criados'))
        return products
    
    def create_payment_methods(self, tenant):
        """Cria métodos de pagamento"""
        self.stdout.write('Criando métodos de pagamento...')
        
        methods_data = [
            "Dinheiro", "Cartão de Débito", "Cartão de Crédito", "PIX", "Transferência"
        ]
        
        payment_methods = []
        for name in methods_data:
            method, created = PaymentMethod.objects.get_or_create(
                name=name,
                tenant=tenant,
                defaults={'is_active': True}
            )
            payment_methods.append(method)
        
        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(payment_methods)} métodos de pagamento'))
        return payment_methods
    
    def create_appointments(self, user, tenant, customers, services):
        """Cria agendamentos"""
        self.stdout.write('Criando agendamentos...')
        
        appointments = []
        now = timezone.now()
        
        for i in range(30):
            # 60% passados, 40% futuros
            if random.random() < 0.6:
                days_offset = random.randint(-60, -1)
                status = random.choice(['completed'] * 7 + ['cancelled'] * 2 + ['no_show'])
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
            
            appointment = Appointment.objects.create(
                customer=random.choice(customers),
                service=random.choice(services),
                professional=user,
                appointment_datetime=appointment_time,
                status=status,
                notes="Agendamento via WhatsApp" if i % 3 == 0 else "",
                tenant=tenant,
                created_by=user
            )
            appointments.append(appointment)
        
        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(appointments)} agendamentos criados'))
        return appointments
    
    def create_transactions(self, user, tenant, customers, services, products, payment_methods):
        """Cria transações financeiras"""
        self.stdout.write('Criando transações financeiras...')
        
        transactions = []
        now = timezone.now()
        
        for i in range(50):
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
                status = random.choice(['paid'] * 8 + ['overdue'] * 2)
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
                tenant=tenant,
                created_by=user
            )
            transactions.append(transaction)
        
        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(transactions)} transações criadas'))
        return transactions
