"""
Script para criar usuário Super Admin e popular dados iniciais do painel
Execute: python create_superadmin_user.py
"""
import os
import django
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import User, Tenant
from superadmin.models import Subscription, PaymentHistory, TenantUsageStats

def create_superadmin():
    """Cria usuário super admin (se não existir)"""
    print("\n🔐 Criando Super Admin...")
    
    email = "superadmin@erp.com"
    
    if User.objects.filter(email=email).exists():
        print(f"   ⚠️  Super admin já existe: {email}")
        return User.objects.get(email=email)
    
    superadmin = User.objects.create_user(
        email=email,
        password="admin123",  # MUDAR EM PRODUÇÃO!
        name="Super Administrador",
        role="superadmin",
        is_staff=True,
        is_superuser=True,
        tenant=None  # Super admin não pertence a nenhum tenant
    )
    
    print(f"   ✅ Super admin criado!")
    print(f"   📧 Email: {email}")
    print(f"   🔑 Senha: admin123")
    print(f"   ⚠️  MUDE A SENHA EM PRODUÇÃO!")
    
    return superadmin


def create_subscriptions():
    """Cria assinaturas para todos os tenants existentes"""
    print("\n💳 Criando assinaturas...")
    
    tenants = Tenant.objects.all()
    
    if not tenants.exists():
        print("   ⚠️  Nenhum tenant encontrado. Execute create_superuser.py primeiro.")
        return
    
    plans = ['free', 'basic', 'professional', 'enterprise']
    statuses = ['trial', 'active', 'active', 'active']
    prices = [0, 49.90, 99.90, 199.90]
    max_users = [5, 10, 25, 100]
    max_appointments = [100, 500, 2000, 10000]
    
    for i, tenant in enumerate(tenants):
        # Verificar se já tem assinatura
        if hasattr(tenant, 'subscription'):
            print(f"   ⚠️  {tenant.name} já tem assinatura")
            continue
        
        # Usar índice cíclico para variar os planos
        idx = i % len(plans)
        
        subscription = Subscription.objects.create(
            tenant=tenant,
            plan=plans[idx],
            status=statuses[idx],
            payment_status='paid' if plans[idx] != 'free' else 'pending',
            start_date=date.today() - timedelta(days=30),
            trial_end_date=date.today() + timedelta(days=7) if statuses[idx] == 'trial' else None,
            next_billing_date=date.today() + timedelta(days=30) if plans[idx] != 'free' else None,
            monthly_price=Decimal(str(prices[idx])),
            max_users=max_users[idx],
            max_appointments_per_month=max_appointments[idx],
            features={
                'sms_notifications': plans[idx] in ['professional', 'enterprise'],
                'whatsapp_integration': plans[idx] == 'enterprise',
                'advanced_reports': plans[idx] in ['professional', 'enterprise'],
                'multi_unit': plans[idx] == 'enterprise',
                'api_access': plans[idx] == 'enterprise',
            }
        )
        
        print(f"   ✅ {tenant.name} - Plano {plans[idx].title()} (R$ {prices[idx]})")


def create_payment_history():
    """Cria histórico de pagamentos de exemplo"""
    print("\n💰 Criando histórico de pagamentos...")
    
    subscriptions = Subscription.objects.exclude(plan='free')
    
    if not subscriptions.exists():
        print("   ⚠️  Nenhuma assinatura paga encontrada")
        return
    
    payment_methods = ['credit_card', 'debit_card', 'pix', 'bank_slip']
    statuses = ['paid', 'paid', 'paid', 'pending']
    
    count = 0
    for subscription in subscriptions:
        # Criar 3 meses de histórico
        for i in range(3):
            month = date.today().replace(day=1) - timedelta(days=30 * i)
            
            payment = PaymentHistory.objects.create(
                subscription=subscription,
                amount=subscription.monthly_price,
                payment_method=payment_methods[i % len(payment_methods)],
                status=statuses[i % len(statuses)],
                reference_month=month,
                paid_at=month + timedelta(days=5) if statuses[i % len(statuses)] == 'paid' else None,
                transaction_id=f"TRX{subscription.id}{i}".upper(),
            )
            count += 1
    
    print(f"   ✅ {count} pagamentos criados")


def create_usage_stats():
    """Cria estatísticas de uso de exemplo"""
    print("\n📊 Criando estatísticas de uso...")
    
    from scheduling.models import Appointment
    from customers.models import Customer
    
    tenants = Tenant.objects.all()
    
    count = 0
    for tenant in tenants:
        # Estatísticas dos últimos 3 meses
        for i in range(3):
            month = date.today().replace(day=1) - timedelta(days=30 * i)
            
            # Verificar se já existe
            if TenantUsageStats.objects.filter(tenant=tenant, month=month).exists():
                continue
            
            total_users = tenant.users.count()
            active_users = tenant.users.filter(is_active=True).count()
            total_appointments = Appointment.objects.filter(tenant=tenant).count()
            completed = Appointment.objects.filter(tenant=tenant, status='completed').count()
            total_customers = Customer.objects.filter(tenant=tenant).count()
            
            stats = TenantUsageStats.objects.create(
                tenant=tenant,
                month=month,
                total_users=total_users,
                active_users=active_users,
                total_appointments=total_appointments,
                completed_appointments=completed,
                total_revenue=Decimal(str(completed * 50)),  # Estimativa
                total_customers=total_customers,
                new_customers=max(0, total_customers - 5),
                api_calls=total_appointments * 10,  # Estimativa
                storage_used_mb=total_customers * 0.5,  # Estimativa
            )
            count += 1
    
    print(f"   ✅ {count} estatísticas criadas")


def main():
    """Executa todos os scripts de setup"""
    print("\n" + "="*60)
    print("🚀 SETUP DO PAINEL SUPER ADMIN")
    print("="*60)
    
    # 1. Criar super admin
    superadmin = create_superadmin()
    
    # 2. Criar assinaturas
    create_subscriptions()
    
    # 3. Criar histórico de pagamentos
    create_payment_history()
    
    # 4. Criar estatísticas de uso
    create_usage_stats()
    
    print("\n" + "="*60)
    print("✅ SETUP COMPLETO!")
    print("="*60)
    
    print("\n📋 RESUMO:")
    print(f"   - Super Admin: superadmin@erp.com / admin123")
    print(f"   - Tenants: {Tenant.objects.count()}")
    print(f"   - Assinaturas: {Subscription.objects.count()}")
    print(f"   - Pagamentos: {PaymentHistory.objects.count()}")
    print(f"   - Estatísticas: {TenantUsageStats.objects.count()}")
    
    print("\n🌐 ACESSO:")
    print("   - Dashboard Super Admin: http://localhost:3000/superadmin")
    print("   - API: http://localhost:8000/api/superadmin/")
    
    print("\n📚 ENDPOINTS DISPONÍVEIS:")
    print("   - GET /api/superadmin/dashboard/stats/ - Estatísticas gerais")
    print("   - GET /api/superadmin/tenants/ - Lista de empresas")
    print("   - GET /api/superadmin/subscriptions/ - Assinaturas")
    print("   - GET /api/superadmin/payments/ - Pagamentos")
    print("   - GET /api/superadmin/errors/ - Erros do sistema")
    print("   - GET /api/superadmin/usage/ - Estatísticas de uso")
    
    print("\n🎉 Pronto para usar!")
    print()

if __name__ == "__main__":
    main()
