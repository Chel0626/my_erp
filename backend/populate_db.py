"""
Script para popular o banco de dados com dados de teste
Execute: python manage.py shell < populate_db.py
"""
from core.models import Tenant, User
from scheduling.models import Service, Appointment
from datetime import datetime, timedelta
from django.utils import timezone

print("🗑️  Limpando banco de dados...")
Appointment.objects.all().delete()
Service.objects.all().delete()
User.objects.all().delete()
Tenant.objects.all().delete()

print("\n📦 Criando Tenant...")
tenant1 = Tenant.objects.create(
    name="Barbearia do João"
)

print("👤 Criando usuários...")
# Admin
admin = User.objects.create_user(
    email="joao@barbearia.com",
    password="senha123",
    name="João Silva",
    tenant=tenant1,
    role="admin"
)

# Atualiza owner do tenant
tenant1.owner = admin
tenant1.save()

# Barbeiros
barbeiro1 = User.objects.create_user(
    email="pedro@barbearia.com",
    password="senha123",
    name="Pedro Santos",
    tenant=tenant1,
    role="barbeiro"
)

barbeiro2 = User.objects.create_user(
    email="carlos@barbearia.com",
    password="senha123",
    name="Carlos Oliveira",
    tenant=tenant1,
    role="barbeiro"
)

# Caixa
caixa = User.objects.create_user(
    email="maria@barbearia.com",
    password="senha123",
    name="Maria Costa",
    tenant=tenant1,
    role="caixa"
)

print("💈 Criando serviços...")
corte_masculino = Service.objects.create(
    tenant=tenant1,
    name="Corte Masculino",
    description="Corte tradicional com máquina e tesoura",
    price=50.00,
    duration_minutes=30
)

barba = Service.objects.create(
    tenant=tenant1,
    name="Barba",
    description="Barba completa com navalha",
    price=40.00,
    duration_minutes=20
)

corte_barba = Service.objects.create(
    tenant=tenant1,
    name="Corte + Barba",
    description="Combo econômico",
    price=80.00,
    duration_minutes=45
)

corte_infantil = Service.objects.create(
    tenant=tenant1,
    name="Corte Infantil",
    description="Corte para crianças até 12 anos",
    price=35.00,
    duration_minutes=25
)

print("📅 Criando agendamentos...")
# Agendamentos para hoje
now = timezone.now()
today = now.replace(hour=9, minute=0, second=0, microsecond=0)

appointments_data = [
    {
        "customer_name": "Carlos Mendes",
        "customer_phone": "(11) 98765-4321",
        "service": corte_masculino,
        "professional": barbeiro1,
        "start_time": today + timedelta(hours=0),
        "status": "concluido"
    },
    {
        "customer_name": "Roberto Alves",
        "customer_phone": "(11) 97654-3210",
        "service": barba,
        "professional": barbeiro1,
        "start_time": today + timedelta(hours=0, minutes=30),
        "status": "concluido"
    },
    {
        "customer_name": "Fernando Costa",
        "customer_phone": "(11) 96543-2109",
        "service": corte_barba,
        "professional": barbeiro2,
        "start_time": today + timedelta(hours=1),
        "status": "confirmado"
    },
    {
        "customer_name": "Miguel Silva",
        "customer_phone": "(11) 95432-1098",
        "service": corte_infantil,
        "professional": barbeiro1,
        "start_time": today + timedelta(hours=2),
        "status": "marcado"
    },
    {
        "customer_name": "Paulo Santos",
        "customer_phone": "(11) 94321-0987",
        "service": corte_masculino,
        "professional": barbeiro2,
        "start_time": today + timedelta(hours=2, minutes=30),
        "status": "marcado"
    },
    {
        "customer_name": "André Oliveira",
        "customer_phone": "(11) 93210-9876",
        "service": barba,
        "professional": barbeiro1,
        "start_time": today + timedelta(hours=3),
        "status": "marcado"
    },
]

for data in appointments_data:
    Appointment.objects.create(
        tenant=tenant1,
        created_by=admin,
        **data
    )

# Agendamentos para amanhã
tomorrow = today + timedelta(days=1)

tomorrow_appointments = [
    {
        "customer_name": "Lucas Fernandes",
        "customer_phone": "(11) 92109-8765",
        "service": corte_barba,
        "professional": barbeiro1,
        "start_time": tomorrow + timedelta(hours=1),
        "status": "marcado"
    },
    {
        "customer_name": "Gabriel Martins",
        "customer_phone": "(11) 91098-7654",
        "service": corte_masculino,
        "professional": barbeiro2,
        "start_time": tomorrow + timedelta(hours=2),
        "status": "marcado"
    },
]

for data in tomorrow_appointments:
    Appointment.objects.create(
        tenant=tenant1,
        created_by=admin,
        **data
    )

print("\n✅ Banco de dados populado com sucesso!")
print("\n📊 Resumo:")
print(f"   - Tenants: {Tenant.objects.count()}")
print(f"   - Usuários: {User.objects.count()}")
print(f"   - Serviços: {Service.objects.count()}")
print(f"   - Agendamentos: {Appointment.objects.count()}")
print("\n🔑 Credenciais de teste:")
print("   Admin:")
print("   - Email: joao@barbearia.com")
print("   - Senha: senha123")
print("\n   Barbeiro 1:")
print("   - Email: pedro@barbearia.com")
print("   - Senha: senha123")
print("\n   Barbeiro 2:")
print("   - Email: carlos@barbearia.com")
print("   - Senha: senha123")
