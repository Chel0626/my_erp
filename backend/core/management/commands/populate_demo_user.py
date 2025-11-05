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
from inventory.models import Product
from scheduling.models import Appointment, Service
from financial.models import Transaction, PaymentMethod
from commissions.models import CommissionRule, Commission
from goals.models import Goal


class Command(BaseCommand):
    help = 'Popula dados de demonstração para um usuário específico'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='Email do usuário para popular dados',
            default='gael@barber.com'
        )
        parser.add_argument(
            '--clean',
            action='store_true',
            help='Limpa dados existentes antes de popular'
        )

    def handle(self, *args, **options):
        email = options['email']
        clean = options.get('clean', False)
        
        try:
            user = User.objects.get(email=email)
            tenant = user.tenant
            
            self.stdout.write(self.style.SUCCESS(f'\n{"="*60}'))
            self.stdout.write(self.style.SUCCESS(f'Populando dados para: {user.email}'))
            self.stdout.write(self.style.SUCCESS(f'Tenant: {tenant.name}'))
            self.stdout.write(self.style.SUCCESS(f'{"="*60}\n'))
            
            # Limpar dados se solicitado
            if clean:
                self.stdout.write(self.style.WARNING('Limpando dados existentes...'))
                from goals.models import Goal
                from commissions.models import CommissionRule, Commission
                
                Goal.objects.filter(tenant=tenant).delete()
                Commission.objects.filter(tenant=tenant).delete()
                CommissionRule.objects.filter(tenant=tenant).delete()
                Transaction.objects.filter(tenant=tenant).delete()
                Appointment.objects.filter(tenant=tenant).delete()
                Customer.objects.filter(tenant=tenant).delete()
                Service.objects.filter(tenant=tenant).delete()
                # Não limpar produtos devido a problema com stock_movements
                # Product.objects.filter(tenant=tenant).delete()
                # Não limpar users da equipe para evitar problemas
                self.stdout.write(self.style.SUCCESS('  ✓ Dados limpos'))
            
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Usuário {email} não encontrado!'))
            return
        
        # Popular dados
        team = self.create_team_members(user, tenant)
        customers = self.create_customers(user, tenant)
        services = self.create_services(user, tenant)
        products = self.create_products(user, tenant)
        payment_methods = self.create_payment_methods(tenant)
        commission_rules = self.create_commission_rules(tenant, team, services)
        appointments = self.create_appointments(user, tenant, customers, services, team)
        transactions = self.create_transactions(user, tenant, customers, services, products, payment_methods)
        goals = self.create_goals(tenant, team)
        
        self.stdout.write(self.style.SUCCESS(f'\n{"="*60}'))
        self.stdout.write(self.style.SUCCESS('POPULAÇÃO CONCLUÍDA COM SUCESSO!'))
        self.stdout.write(self.style.SUCCESS(f'{"="*60}'))
        self.stdout.write(self.style.SUCCESS(f'\nRESUMO:'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(team)} membros da equipe'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(customers)} clientes'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(services)} serviços'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(products)} produtos'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(payment_methods)} métodos de pagamento'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(commission_rules)} regras de comissão'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(appointments)} agendamentos'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(transactions)} transações'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(goals)} metas'))
    
    def create_team_members(self, owner, tenant):
        """Cria membros da equipe (barbeiros)"""
        self.stdout.write('Criando equipe...')
        
        team_data = [
            ("Pedro Barbeiro", "pedro@gaelsbarber.com", "barbeiro"),
            ("Carlos Cortes", "carlos@gaelsbarber.com", "barbeiro"),
            ("Ana Estilista", "ana@gaelsbarber.com", "caixa"),
        ]
        
        team = [owner]  # Inclui o dono
        for nome, email, role in team_data:
            member, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'name': nome,
                    'tenant': tenant,
                    'role': role,
                }
            )
            if created:
                member.set_password('barber123')
                member.save()
            team.append(member)
        
        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(team)} membros da equipe'))
        return team
        
    def create_customers(self, user, tenant):
        """Cria clientes de demonstração com variedade de status"""
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
            # Variedade de clientes: novos, VIP, recorrentes
            if i < 5:
                notes = "✨ Cliente NOVO - Primeira visita"
            elif i < 10:
                notes = "⭐ Cliente VIP - Atendimento prioritário"
            else:
                notes = "🔄 Cliente Recorrente"
                
            customer = Customer.objects.create(
                name=nome,
                email=f"cliente{i+1}@email.com",
                phone=f"(11) 9{random.randint(1000,9999)}-{random.randint(1000,9999)}",
                notes=notes,
                tenant=tenant
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
                tenant=tenant
            )
            services.append(service)
        
        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(services)} serviços criados'))
        return services
    
    def create_products(self, user, tenant):
        """Cria produtos de demonstração"""
        self.stdout.write('Criando produtos...')
        
        produtos_data = [
            ("Pomada Modeladora", "pomada", 35.90, 21.54, 50),
            ("Shampoo Anticaspa", "shampoo", 28.50, 17.10, 30),
            ("Cera Finalizadora", "cera", 42.00, 25.20, 25),
            ("Óleo para Barba", "oleo", 55.00, 33.00, 20),
            ("Balm para Barba", "oleo", 48.90, 29.34, 18),
            ("Navalha Profissional", "navalhete", 120.00, 72.00, 10),
            ("Tesoura Corte", "outro", 85.00, 51.00, 8),
            ("Pente Madeira", "outro", 15.00, 9.00, 40),
            ("Escova Profissional", "outro", 65.00, 39.00, 12),
            ("Gel Fixador", "gel", 32.00, 19.20, 35),
            ("Mousse Modelador", "gel", 38.50, 23.10, 22),
            ("Spray Finalizador", "outro", 45.00, 27.00, 28),
            ("Loção Pós-Barba", "outro", 52.00, 31.20, 15),
            ("Kit Barba Completo", "outro", 150.00, 90.00, 5),
            ("Máquina de Corte", "outro", 450.00, 270.00, 3),
        ]
        
        products = []
        for nome, categoria, preco, custo, estoque in produtos_data:
            product, created = Product.objects.get_or_create(
                name=nome,
                tenant=tenant,
                defaults={
                    'description': f"Produto profissional de alta qualidade - {nome}",
                    'category': categoria,
                    'sale_price': Decimal(str(preco)),
                    'cost_price': Decimal(str(custo)),
                    'stock_quantity': estoque,
                    'min_stock': 5,
                }
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
    
    def create_commission_rules(self, tenant, team, services):
        """Cria regras de comissão"""
        self.stdout.write('Criando regras de comissão...')
        
        rules = []
        
        # Regra geral (40% para todos)
        rule_general = CommissionRule.objects.create(
            tenant=tenant,
            commission_percentage=Decimal('40.00'),
            is_active=True,
            priority=1
        )
        rules.append(rule_general)
        
        # Regras específicas por profissional (50% para alguns)
        for i, member in enumerate(team[:2]):
            rule = CommissionRule.objects.create(
                tenant=tenant,
                professional=member,
                commission_percentage=Decimal('50.00'),
                is_active=True,
                priority=10
            )
            rules.append(rule)
        
        # Regra específica por serviço (60% para serviços premium)
        if len(services) > 3:
            for service in services[3:6]:
                rule = CommissionRule.objects.create(
                    tenant=tenant,
                    service=service,
                    commission_percentage=Decimal('60.00'),
                    is_active=True,
                    priority=5
                )
                rules.append(rule)
        
        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(rules)} regras de comissão'))
        return rules
    
    def create_appointments(self, user, tenant, customers, services, team):
        """Cria agendamentos"""
        self.stdout.write('Criando agendamentos...')
        
        appointments = []
        now = timezone.now()
        
        for i in range(30):
            # 60% passados, 40% futuros
            if random.random() < 0.6:
                days_offset = random.randint(-60, -1)
                status = random.choice(['concluido'] * 7 + ['cancelado'] * 2 + ['falta'])
            else:
                days_offset = random.randint(1, 30)
                status = 'marcado'
            
            appointment_date = now + timedelta(days=days_offset)
            appointment_time = appointment_date.replace(
                hour=random.randint(9, 18),
                minute=random.choice([0, 30]),
                second=0,
                microsecond=0
            )
            
            customer = random.choice(customers)
            service = random.choice(services)
            professional = random.choice(team)  # Distribui entre a equipe
            
            appointment = Appointment.objects.create(
                customer=customer,
                customer_name=customer.name,
                customer_phone=customer.phone if customer.phone else "",
                customer_email=customer.email if customer.email else "",
                service=service,
                professional=professional,
                start_time=appointment_time,
                status=status,
                notes="Agendamento via WhatsApp" if i % 3 == 0 else "",
                tenant=tenant,
                created_by=professional
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
                transaction_type = 'receita'
                category_choice = random.choice(['servico', 'produto', 'outro'])
                
                if category_choice == 'servico':
                    service = random.choice(services)
                    amount = service.price
                    description = f"Serviço: {service.name}"
                    category = 'servico'
                elif category_choice == 'produto':
                    product = random.choice(products)
                    quantity = random.randint(1, 3)
                    amount = product.sale_price * quantity
                    description = f"Venda: {product.name} (x{quantity})"
                    category = 'produto'
                else:
                    amount = Decimal(str(round(random.uniform(50, 500), 2)))
                    description = "Outra receita"
                    category = 'outro'
            else:
                transaction_type = 'despesa'
                category = random.choice(['salario', 'aluguel', 'fornecedor', 'imposto', 'outro'])
                amount = Decimal(str(round(random.uniform(100, 2000), 2)))
                description = f"Despesa: {category}"
            
            # Transações financeiras diretas (não relacionadas a agendamentos)
            days_offset = random.randint(-60, 30)
            transaction_date = (now + timedelta(days=days_offset)).date()
            
            transaction = Transaction.objects.create(
                type=transaction_type,
                category=category,
                amount=amount,
                description=description,
                date=transaction_date,
                payment_method=random.choice(payment_methods),
                tenant=tenant,
                created_by=user
            )
            transactions.append(transaction)
        
        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(transactions)} transações criadas'))
        return transactions
    
    def create_goals(self, tenant, team):
        """Cria metas individuais e de equipe"""
        self.stdout.write('Criando metas...')
        
        goals = []
        now = timezone.now()
        
        # Metas individuais para cada membro da equipe
        for member in team:
            # Meta de faturamento mensal
            goal_revenue = Goal.objects.create(
                tenant=tenant,
                user=member,
                name=f"Meta de Faturamento - {member.name}",
                description="Atingir faturamento mensal",
                type='individual',
                target_type='revenue',
                target_value=Decimal('5000.00'),
                current_value=Decimal(str(round(random.uniform(2000, 6000), 2))),
                period='monthly',
                start_date=now.replace(day=1).date(),
                end_date=(now.replace(day=1) + timedelta(days=30)).date(),
                status='active'
            )
            goals.append(goal_revenue)
            
            # Meta de quantidade de serviços
            goal_services = Goal.objects.create(
                tenant=tenant,
                user=member,
                name=f"Meta de Atendimentos - {member.name}",
                description="Realizar número de atendimentos",
                type='individual',
                target_type='services_count',
                target_value=Decimal('50'),
                current_value=Decimal(str(random.randint(20, 60))),
                period='monthly',
                start_date=now.replace(day=1).date(),
                end_date=(now.replace(day=1) + timedelta(days=30)).date(),
                status='active'
            )
            goals.append(goal_services)
        
        # Metas de equipe
        team_goals_data = [
            ("Meta de Novos Clientes", "new_customers", Decimal('30'), Decimal(str(random.randint(10, 40)))),
            ("Meta de Faturamento da Equipe", "revenue", Decimal('15000.00'), Decimal(str(round(random.uniform(10000, 18000), 2)))),
            ("Meta de Produtos Vendidos", "products_sold", Decimal('100'), Decimal(str(random.randint(40, 120)))),
        ]
        
        for name, target_type, target, current in team_goals_data:
            goal = Goal.objects.create(
                tenant=tenant,
                user=None,  # Meta de equipe
                name=name,
                description=f"Meta coletiva da equipe",
                type='team',
                target_type=target_type,
                target_value=target,
                current_value=current,
                period='monthly',
                start_date=now.replace(day=1).date(),
                end_date=(now.replace(day=1) + timedelta(days=30)).date(),
                status='active'
            )
            goals.append(goal)
        
        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(goals)} metas criadas'))
        return goals

