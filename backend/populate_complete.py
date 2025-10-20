"""
Script completo para popular TODOS os módulos do sistema
Execute: python manage.py shell < populate_complete.py
"""

from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal
import random

from core.models import Tenant, User
from scheduling.models import Service, Appointment
from customers.models import Customer
from financial.models import PaymentMethod, Transaction
from inventory.models import Product, StockMovement
from commissions.models import CommissionRule, Commission

print("🚀 Populando sistema COMPLETO do My ERP...")
print("")

# ============================================
# 1. LIMPAR DADOS ANTIGOS (se necessário)
# ============================================
print("🧹 Limpando dados antigos...")
Commission.objects.all().delete()
StockMovement.objects.all().delete()
Transaction.objects.all().delete()
Appointment.objects.all().delete()
Product.objects.all().delete()
Customer.objects.all().delete()
Service.objects.all().delete()
PaymentMethod.objects.all().delete()
CommissionRule.objects.all().delete()

# Manter apenas o tenant e usuários
tenant = Tenant.objects.first()
if not tenant:
    print("❌ Nenhum tenant encontrado! Execute populate_db.py primeiro")
    exit(1)

print(f"✅ Usando tenant: {tenant.name}")
print("")

# ============================================
# 2. USUÁRIOS
# ============================================
print("👥 Verificando usuários...")
users = User.objects.filter(tenant=tenant)
if users.count() == 0:
    print("❌ Nenhum usuário encontrado! Execute populate_db.py primeiro")
    exit(1)

joao = users.filter(email="joao@barbearia.com").first()
pedro = users.filter(email="pedro@barbearia.com").first()
carlos = users.filter(email="carlos@barbearia.com").first()

if not joao:
    print("❌ Usuário João não encontrado!")
    exit(1)

print(f"✅ Usuários: {users.count()}")
print("")

# ============================================
# 3. MÉTODOS DE PAGAMENTO
# ============================================
print("💳 Criando métodos de pagamento...")
payment_methods = [
    {"name": "Dinheiro", "type": "DINHEIRO", "fee_percentage": Decimal("0.00"), "is_active": True},
    {"name": "PIX", "type": "PIX", "fee_percentage": Decimal("0.00"), "is_active": True},
    {"name": "Cartão de Crédito", "type": "CREDITO", "fee_percentage": Decimal("3.99"), "is_active": True},
    {"name": "Cartão de Débito", "type": "DEBITO", "fee_percentage": Decimal("1.99"), "is_active": True},
    {"name": "Transferência", "type": "TRANSFERENCIA", "fee_percentage": Decimal("0.00"), "is_active": True},
]

created_payment_methods = {}
for pm_data in payment_methods:
    pm = PaymentMethod.objects.create(tenant=tenant, **pm_data)
    created_payment_methods[pm_data["name"]] = pm
    print(f"  ✅ {pm_data['name']}")

print(f"✅ {len(payment_methods)} métodos de pagamento criados")
print("")

# ============================================
# 4. SERVIÇOS
# ============================================
print("💇 Criando serviços...")
services_data = [
    {"name": "Corte Masculino", "price": Decimal("35.00"), "duration": 30, "description": "Corte de cabelo masculino tradicional"},
    {"name": "Corte + Barba", "price": Decimal("50.00"), "duration": 45, "description": "Corte de cabelo + barba completa"},
    {"name": "Barba", "price": Decimal("25.00"), "duration": 20, "description": "Aparar e fazer barba"},
    {"name": "Sobrancelha", "price": Decimal("15.00"), "duration": 15, "description": "Design de sobrancelha"},
    {"name": "Corte Infantil", "price": Decimal("30.00"), "duration": 25, "description": "Corte para crianças até 12 anos"},
    {"name": "Platinado/Luzes", "price": Decimal("120.00"), "duration": 120, "description": "Descoloração e luzes"},
    {"name": "Hidratação", "price": Decimal("40.00"), "duration": 30, "description": "Tratamento capilar"},
    {"name": "Relaxamento", "price": Decimal("80.00"), "duration": 60, "description": "Alisamento/relaxamento"},
]

created_services = []
for service_data in services_data:
    service = Service.objects.create(
        tenant=tenant,
        category="CORTE" if "Corte" in service_data["name"] else "BARBA" if "Barba" in service_data["name"] else "OUTROS",
        is_active=True,
        **service_data
    )
    created_services.append(service)
    print(f"  ✅ {service_data['name']} - R$ {service_data['price']}")

print(f"✅ {len(created_services)} serviços criados")
print("")

# ============================================
# 5. CLIENTES
# ============================================
print("👨👩 Criando clientes...")
clientes_data = [
    {"name": "Carlos Silva", "phone": "(11) 98765-4321", "email": "carlos.silva@email.com", "cpf": "123.456.789-01", "tag": "VIP"},
    {"name": "Maria Santos", "phone": "(11) 98765-4322", "email": "maria.santos@email.com", "tag": "REGULAR"},
    {"name": "João Pedro", "phone": "(11) 98765-4323", "email": "joao.pedro@email.com", "tag": "REGULAR"},
    {"name": "Ana Paula", "phone": "(11) 98765-4324", "email": "ana.paula@email.com", "tag": "VIP"},
    {"name": "Fernando Lima", "phone": "(11) 98765-4325", "email": "fernando.lima@email.com", "tag": "REGULAR"},
    {"name": "Juliana Costa", "phone": "(11) 98765-4326", "email": "juliana.costa@email.com", "tag": "NOVO"},
    {"name": "Ricardo Alves", "phone": "(11) 98765-4327", "email": "ricardo.alves@email.com", "tag": "REGULAR"},
    {"name": "Patricia Souza", "phone": "(11) 98765-4328", "email": "patricia.souza@email.com", "tag": "VIP"},
    {"name": "Lucas Oliveira", "phone": "(11) 98765-4329", "email": "lucas.oliveira@email.com", "tag": "REGULAR"},
    {"name": "Camila Ribeiro", "phone": "(11) 98765-4330", "email": "camila.ribeiro@email.com", "tag": "NOVO"},
    {"name": "Bruno Martins", "phone": "(11) 98765-4331", "email": "bruno.martins@email.com", "tag": "REGULAR"},
    {"name": "Fernanda Dias", "phone": "(11) 98765-4332", "email": "fernanda.dias@email.com", "tag": "REGULAR"},
    {"name": "Rodrigo Santos", "phone": "(11) 98765-4333", "email": "rodrigo.santos@email.com", "tag": "VIP"},
    {"name": "Amanda Silva", "phone": "(11) 98765-4334", "email": "amanda.silva@email.com", "tag": "NOVO"},
    {"name": "Marcelo Costa", "phone": "(11) 98765-4335", "email": "marcelo.costa@email.com", "tag": "REGULAR"},
]

created_customers = []
for i, cliente_data in enumerate(clientes_data):
    customer = Customer.objects.create(
        tenant=tenant,
        is_active=True,
        gender=random.choice(['M', 'F']),
        address_city="São Paulo",
        address_state="SP",
        **cliente_data
    )
    created_customers.append(customer)
    print(f"  ✅ {cliente_data['name']} ({cliente_data['tag']})")

print(f"✅ {len(created_customers)} clientes criados")
print("")

# ============================================
# 6. PRODUTOS (ESTOQUE)
# ============================================
print("📦 Criando produtos...")
produtos_data = [
    {"name": "Shampoo Profissional", "sku": "SHP-001", "category": "PRODUTO", "cost_price": Decimal("25.00"), "sale_price": Decimal("45.00"), "stock_quantity": 50, "min_stock_level": 10},
    {"name": "Condicionador", "sku": "CND-001", "category": "PRODUTO", "cost_price": Decimal("22.00"), "sale_price": Decimal("40.00"), "stock_quantity": 45, "min_stock_level": 10},
    {"name": "Cera Modeladora", "sku": "CER-001", "category": "PRODUTO", "cost_price": Decimal("15.00"), "sale_price": Decimal("30.00"), "stock_quantity": 30, "min_stock_level": 8},
    {"name": "Pomada Fixadora", "sku": "POM-001", "category": "PRODUTO", "cost_price": Decimal("18.00"), "sale_price": Decimal("35.00"), "stock_quantity": 25, "min_stock_level": 8},
    {"name": "Gel Fixador", "sku": "GEL-001", "category": "PRODUTO", "cost_price": Decimal("12.00"), "sale_price": Decimal("25.00"), "stock_quantity": 40, "min_stock_level": 10},
    {"name": "Óleo para Barba", "sku": "OLE-001", "category": "PRODUTO", "cost_price": Decimal("20.00"), "sale_price": Decimal("45.00"), "stock_quantity": 20, "min_stock_level": 5},
    {"name": "Balm para Barba", "sku": "BAL-001", "category": "PRODUTO", "cost_price": Decimal("22.00"), "sale_price": Decimal("48.00"), "stock_quantity": 18, "min_stock_level": 5},
    {"name": "Navalha Descartável", "sku": "NAV-001", "category": "CONSUMIVEL", "cost_price": Decimal("0.50"), "sale_price": Decimal("1.00"), "stock_quantity": 200, "min_stock_level": 50},
    {"name": "Toalha de Rosto", "sku": "TOA-001", "category": "EQUIPAMENTO", "cost_price": Decimal("8.00"), "sale_price": Decimal("15.00"), "stock_quantity": 30, "min_stock_level": 10},
    {"name": "Capa de Corte", "sku": "CAP-001", "category": "EQUIPAMENTO", "cost_price": Decimal("25.00"), "sale_price": Decimal("50.00"), "stock_quantity": 15, "min_stock_level": 5},
    {"name": "Tesoura Profissional", "sku": "TES-001", "category": "EQUIPAMENTO", "cost_price": Decimal("120.00"), "sale_price": Decimal("250.00"), "stock_quantity": 8, "min_stock_level": 2},
    {"name": "Máquina de Corte", "sku": "MAQ-001", "category": "EQUIPAMENTO", "cost_price": Decimal("300.00"), "sale_price": Decimal("600.00"), "stock_quantity": 5, "min_stock_level": 2},
]

created_products = []
for produto_data in produtos_data:
    product = Product.objects.create(
        tenant=tenant,
        is_active=True,
        track_stock=True,
        **produto_data
    )
    created_products.append(product)
    print(f"  ✅ {produto_data['name']} - Estoque: {produto_data['stock_quantity']}")

print(f"✅ {len(created_products)} produtos criados")
print("")

# ============================================
# 7. REGRAS DE COMISSÃO
# ============================================
print("💰 Criando regras de comissão...")
if pedro:
    rule1 = CommissionRule.objects.create(
        tenant=tenant,
        professional=pedro,
        service=None,  # Para todos os serviços
        commission_type="PERCENTAGE",
        value=Decimal("40.00"),
        priority=1,
        is_active=True
    )
    print(f"  ✅ Pedro: 40% em todos os serviços")

if carlos:
    rule2 = CommissionRule.objects.create(
        tenant=tenant,
        professional=carlos,
        service=None,
        commission_type="PERCENTAGE",
        value=Decimal("35.00"),
        priority=1,
        is_active=True
    )
    print(f"  ✅ Carlos: 35% em todos os serviços")

print("✅ Regras de comissão criadas")
print("")

# ============================================
# 8. AGENDAMENTOS (últimos 30 dias + próximos 7 dias)
# ============================================
print("📅 Criando agendamentos...")
hoje = timezone.now()
professionals = [pedro, carlos] if pedro and carlos else [joao]

# Agendamentos passados (últimos 30 dias)
agendamentos_criados = 0
for i in range(60):  # 60 agendamentos nos últimos 30 dias
    dias_atras = random.randint(1, 30)
    data_agendamento = hoje - timedelta(days=dias_atras)
    hora = random.randint(9, 18)
    
    customer = random.choice(created_customers)
    service = random.choice(created_services)
    professional = random.choice(professionals)
    
    start_time = data_agendamento.replace(hour=hora, minute=random.choice([0, 30]), second=0)
    end_time = start_time + timedelta(minutes=service.duration)
    
    # Agendamentos passados estão concluídos
    appointment = Appointment.objects.create(
        tenant=tenant,
        customer=customer,
        service=service,
        professional=professional,
        start_time=start_time,
        end_time=end_time,
        status="CONCLUIDO",
        notes=f"Atendimento realizado"
    )
    agendamentos_criados += 1

# Agendamentos futuros (próximos 7 dias)
for i in range(20):  # 20 agendamentos futuros
    dias_frente = random.randint(0, 7)
    data_agendamento = hoje + timedelta(days=dias_frente)
    hora = random.randint(9, 18)
    
    customer = random.choice(created_customers)
    service = random.choice(created_services)
    professional = random.choice(professionals)
    
    start_time = data_agendamento.replace(hour=hora, minute=random.choice([0, 30]), second=0)
    end_time = start_time + timedelta(minutes=service.duration)
    
    # Agendamentos futuros estão confirmados ou pendentes
    status = random.choice(["CONFIRMADO", "PENDENTE", "PENDENTE"])
    
    appointment = Appointment.objects.create(
        tenant=tenant,
        customer=customer,
        service=service,
        professional=professional,
        start_time=start_time,
        end_time=end_time,
        status=status,
        notes=f"Cliente aguardando atendimento"
    )
    agendamentos_criados += 1

print(f"✅ {agendamentos_criados} agendamentos criados (60 passados + 20 futuros)")
print("")

# ============================================
# 9. TRANSAÇÕES FINANCEIRAS
# ============================================
print("💵 Criando transações financeiras...")

# Receitas dos agendamentos concluídos
appointments_concluidos = Appointment.objects.filter(tenant=tenant, status="CONCLUIDO")
transacoes_criadas = 0

for appointment in appointments_concluidos[:50]:  # Primeiros 50 agendamentos
    payment_method = random.choice(list(created_payment_methods.values()))
    
    transaction = Transaction.objects.create(
        tenant=tenant,
        type="RECEITA",
        category="SERVICO",
        amount=appointment.service.price,
        payment_method=payment_method,
        description=f"{appointment.service.name} - {appointment.customer.name}",
        date=appointment.start_time.date(),
        appointment=appointment,
        is_paid=True,
        paid_at=appointment.start_time
    )
    transacoes_criadas += 1

# Despesas variadas
despesas_data = [
    {"description": "Aluguel", "amount": Decimal("2500.00"), "category": "ALUGUEL"},
    {"description": "Energia Elétrica", "amount": Decimal("350.00"), "category": "CONTA"},
    {"description": "Água", "amount": Decimal("120.00"), "category": "CONTA"},
    {"description": "Internet", "amount": Decimal("150.00"), "category": "CONTA"},
    {"description": "Compra de produtos", "amount": Decimal("800.00"), "category": "FORNECEDOR"},
    {"description": "Salário Pedro", "amount": Decimal("2200.00"), "category": "SALARIO"},
    {"description": "Salário Carlos", "amount": Decimal("2200.00"), "category": "SALARIO"},
    {"description": "Material de limpeza", "amount": Decimal("180.00"), "category": "FORNECEDOR"},
    {"description": "Manutenção equipamentos", "amount": Decimal("300.00"), "category": "MANUTENCAO"},
    {"description": "Marketing / Redes Sociais", "amount": Decimal("400.00"), "category": "MARKETING"},
]

for despesa in despesas_data:
    dias_atras = random.randint(1, 20)
    data_despesa = hoje - timedelta(days=dias_atras)
    
    transaction = Transaction.objects.create(
        tenant=tenant,
        type="DESPESA",
        category=despesa["category"],
        amount=despesa["amount"],
        payment_method=created_payment_methods["Dinheiro"],
        description=despesa["description"],
        date=data_despesa.date(),
        is_paid=True,
        paid_at=data_despesa
    )
    transacoes_criadas += 1

print(f"✅ {transacoes_criadas} transações criadas ({transacoes_criadas - len(despesas_data)} receitas + {len(despesas_data)} despesas)")
print("")

# ============================================
# 10. MOVIMENTAÇÕES DE ESTOQUE
# ============================================
print("📊 Criando movimentações de estoque...")
movimentacoes = 0

for produto in created_products[:6]:  # Primeiros 6 produtos
    # Entrada inicial
    StockMovement.objects.create(
        tenant=tenant,
        product=produto,
        type="ENTRADA",
        quantity=produto.stock_quantity,
        unit_cost=produto.cost_price,
        notes="Estoque inicial",
        date=hoje - timedelta(days=30)
    )
    movimentacoes += 1
    
    # Algumas saídas (vendas)
    for _ in range(random.randint(2, 5)):
        quantidade = random.randint(1, 5)
        dias = random.randint(1, 25)
        
        StockMovement.objects.create(
            tenant=tenant,
            product=produto,
            type="SAIDA",
            quantity=quantidade,
            unit_cost=produto.cost_price,
            notes="Venda para cliente",
            date=hoje - timedelta(days=dias)
        )
        movimentacoes += 1

print(f"✅ {movimentacoes} movimentações de estoque criadas")
print("")

# ============================================
# RESUMO FINAL
# ============================================
print("")
print("=" * 50)
print("✅ POPULAÇÃO COMPLETA FINALIZADA!")
print("=" * 50)
print("")
print("📊 RESUMO:")
print(f"   - Tenant: {tenant.name}")
print(f"   - Usuários: {User.objects.filter(tenant=tenant).count()}")
print(f"   - Métodos de Pagamento: {PaymentMethod.objects.filter(tenant=tenant).count()}")
print(f"   - Serviços: {Service.objects.filter(tenant=tenant).count()}")
print(f"   - Clientes: {Customer.objects.filter(tenant=tenant).count()}")
print(f"   - Produtos: {Product.objects.filter(tenant=tenant).count()}")
print(f"   - Agendamentos: {Appointment.objects.filter(tenant=tenant).count()}")
print(f"   - Transações: {Transaction.objects.filter(tenant=tenant).count()}")
print(f"   - Movimentações Estoque: {StockMovement.objects.filter(tenant=tenant).count()}")
print(f"   - Regras de Comissão: {CommissionRule.objects.filter(tenant=tenant).count()}")
print("")
print("🔐 CREDENCIAIS:")
print("   - Email: joao@barbearia.com")
print("   - Senha: senha123")
print("")
print("🌐 Acesse: http://localhost:3000")
print("")
