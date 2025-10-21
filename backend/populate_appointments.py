"""
Script para popular agendamentos e comissoes
Adiciona dados faltantes ao banco
"""
import os
import sys
import django
from datetime import datetime, timedelta
from decimal import Decimal
import random
from zoneinfo import ZoneInfo

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from core.models import Tenant
from customers.models import Customer
from scheduling.models import Service, Appointment
from financial.models import PaymentMethod, Transaction
from commissions.models import CommissionRule, Commission

User = get_user_model()

# Timezone para evitar warnings
TZ = ZoneInfo('America/Sao_Paulo')

def print_status(message):
    print(f"\n>>> {message}")

def populate_commission_rules(tenant, professionals, services):
    """Cria regras de comissao"""
    print_status("Criando regras de comissao...")
    
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
    if len(professionals) > 1:
        pro = professionals[1]  # Pedro ou Maria
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
    
    print(f"  TOTAL: {CommissionRule.objects.filter(tenant=tenant).count()} regras")
    return created

def populate_appointments(tenant, customers, services, professionals):
    """Cria agendamentos passados e futuros"""
    print_status("Criando agendamentos...")
    
    statuses_past = ['concluido', 'concluido', 'concluido', 'cancelado', 'falta']
    statuses_future = ['marcado', 'confirmado']
    
    created = []
    
    # Agendamentos passados (ultimos 60 dias)
    print("  Criando agendamentos passados...")
    for i in range(60):
        date = datetime.now(TZ) - timedelta(days=60-i)
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
                notes=f"Agendamento via sistema"
            )
            created.append(appointment)
    
    print(f"  - {len(created)} agendamentos passados criados")
    
    # Agendamentos futuros (proximos 20 dias)
    print("  Criando agendamentos futuros...")
    future_count = 0
    for i in range(1, 21):
        date = datetime.now(TZ) + timedelta(days=i)
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
                notes=f"Agendamento via sistema"
            )
            created.append(appointment)
            future_count += 1
    
    print(f"  - {future_count} agendamentos futuros criados")
    print(f"  TOTAL: {len(created)} agendamentos criados")
    
    return created

def main():
    print("="*70)
    print("POPULACAO DE AGENDAMENTOS E COMISSOES")
    print("="*70)
    
    # Obtem o tenant
    tenant = Tenant.objects.first()
    if not tenant:
        print("\nERRO: Nenhum tenant encontrado!")
        return
    
    print(f"\nTenant: {tenant.name}")
    
    # Obtem dados necessarios
    professionals = list(User.objects.filter(tenant=tenant, is_staff=False))
    customers = list(Customer.objects.filter(tenant=tenant))
    services = list(Service.objects.filter(tenant=tenant))
    payment_methods = list(PaymentMethod.objects.filter(tenant=tenant))
    
    print(f"Profissionais: {len(professionals)}")
    print(f"Clientes: {len(customers)}")
    print(f"Servicos: {len(services)}")
    print(f"Metodos Pagamento: {len(payment_methods)}")
    
    if not professionals or not customers or not services:
        print("\nERRO: Dados basicos faltando!")
        return
    
    # Popula regras de comissao primeiro
    populate_commission_rules(tenant, professionals, services)
    
    # Popula agendamentos
    appointments = populate_appointments(tenant, customers, services, professionals)
    
    # Resumo final
    print("\n" + "="*70)
    print("RESUMO FINAL")
    print("="*70)
    print(f"Agendamentos: {Appointment.objects.filter(tenant=tenant).count()}")
    print(f"Transacoes: {Transaction.objects.filter(tenant=tenant).count()}")
    print(f"Regras de Comissao: {CommissionRule.objects.filter(tenant=tenant).count()}")
    print(f"Comissoes: {Commission.objects.filter(tenant=tenant).count()}")
    print("\nSUCESSO! Dados populados!")
    print("="*70)

if __name__ == '__main__':
    main()
