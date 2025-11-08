"""
Script para popular dados de demonstração do SuperAdmin
Cria múltiplos tenants com assinaturas, pagamentos e usuários
"""
import os
import sys

# Configura encoding UTF-8 para Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

import django
from datetime import datetime, timedelta
from decimal import Decimal

# Configura Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.utils import timezone
from django.contrib.auth import get_user_model
from core.models import Tenant
from superadmin.models import Subscription, PaymentHistory, TenantUsageStats

User = get_user_model()


def populate_superadmin_data():
    """Popula dados de demonstração para o SuperAdmin"""
    
    print("🚀 Iniciando população de dados do SuperAdmin...")
    
    # ==================== TENANTS ====================
    print("\n📦 Criando Tenants...")
    
    tenants_data = [
        {
            'name': 'Clínica São Lucas',
            'plan': 'premium',
            'is_active': True,
            'subscription_status': 'active',
            'users_count': 12,
        },
        {
            'name': 'Estética Bella Vita',
            'plan': 'pro',
            'is_active': True,
            'subscription_status': 'active',
            'users_count': 8,
        },
        {
            'name': 'Salão de Beleza Maria',
            'plan': 'basic',
            'is_active': True,
            'subscription_status': 'trial',
            'users_count': 3,
        },
        {
            'name': 'Spa Relaxar',
            'plan': 'pro',
            'is_active': True,
            'subscription_status': 'active',
            'users_count': 6,
        },
        {
            'name': 'Clínica Odontológica Sorrir',
            'plan': 'premium',
            'is_active': False,
            'subscription_status': 'suspended',
            'users_count': 15,
        },
        {
            'name': 'Academia FitLife',
            'plan': 'basic',
            'is_active': True,
            'subscription_status': 'active',
            'users_count': 5,
        },
        {
            'name': 'Pet Shop Amigo Fiel',
            'plan': 'pro',
            'is_active': True,
            'subscription_status': 'trial',
            'users_count': 4,
        },
        {
            'name': 'Barbearia do João',
            'plan': 'basic',
            'is_active': True,
            'subscription_status': 'active',
            'users_count': 2,
        },
    ]
    
    tenants = []
    for tenant_data in tenants_data:
        tenant, created = Tenant.objects.get_or_create(
            name=tenant_data['name'],
            defaults={
                'plan': tenant_data['plan'],
                'is_active': tenant_data['is_active'],
            }
        )
        
        if created:
            print(f"  ✅ Tenant criado: {tenant.name} ({tenant.plan})")
        else:
            print(f"  ℹ️  Tenant já existe: {tenant.name}")
        
        tenants.append((tenant, tenant_data))
    
    # ==================== USUÁRIOS PARA CADA TENANT ====================
    print("\n👥 Criando usuários para cada tenant...")
    
    for tenant, tenant_data in tenants:
        # Cria superadmin para o tenant (se não existir)
        admin_email = f"admin@{tenant.name.lower().replace(' ', '')}.com"
        
        admin, created = User.objects.get_or_create(
            email=admin_email,
            defaults={
                'name': f'Admin {tenant.name.split()[0]}',
                'role': 'admin',
                'tenant': tenant,
                'is_active': tenant.is_active,
            }
        )
        
        if created:
            admin.set_password('admin123')
            admin.save()
            print(f"  ✅ Admin criado: {admin.email}")
        
        # Cria usuários adicionais (funcionários)
        users_to_create = tenant_data['users_count'] - 1  # -1 porque já criamos o admin
        
        for i in range(1, users_to_create + 1):
            user_email = f"user{i}@{tenant.name.lower().replace(' ', '')}.com"
            
            user, created = User.objects.get_or_create(
                email=user_email,
                defaults={
                    'name': f'Usuário {i} {tenant.name.split()[0]}',
                    'role': 'atendente',
                    'tenant': tenant,
                    'is_active': True,
                }
            )
            
            if created:
                user.set_password('user123')
                user.save()
    
    print(f"\n  Total de usuários criados/verificados")
    
    # ==================== ASSINATURAS ====================
    print("\n💳 Criando Assinaturas...")
    
    plan_prices = {
        'basic': Decimal('99.90'),
        'pro': Decimal('199.90'),
        'premium': Decimal('399.90'),
    }
    
    # Mapeia plan names para os choices do modelo
    plan_mapping = {
        'basic': 'basic',
        'pro': 'professional',
        'premium': 'enterprise',
    }
    
    for tenant, tenant_data in tenants:
        subscription_status = tenant_data['subscription_status']
        
        # Calcula datas baseadas no status
        if subscription_status == 'trial':
            start_date = timezone.now() - timedelta(days=7)
            next_billing = timezone.now() + timedelta(days=7)  # Trial de 14 dias
            trial_end = next_billing
        elif subscription_status == 'suspended':
            start_date = timezone.now() - timedelta(days=180)
            next_billing = timezone.now() - timedelta(days=30)
            trial_end = None
        else:  # active
            start_date = timezone.now() - timedelta(days=90)
            next_billing = timezone.now() + timedelta(days=30)
            trial_end = None
        
        subscription, created = Subscription.objects.get_or_create(
            tenant=tenant,
            defaults={
                'plan': plan_mapping[tenant.plan],
                'status': subscription_status,
                'payment_status': 'paid' if subscription_status == 'active' else 'pending',
                'start_date': start_date,
                'next_billing_date': next_billing,
                'trial_end_date': trial_end,
                'monthly_price': plan_prices[tenant.plan],
            }
        )
        
        if created:
            print(f"  ✅ Assinatura criada: {tenant.name} - {subscription.get_status_display()}")
        else:
            print(f"  ℹ️  Assinatura já existe: {tenant.name}")
    
    # ==================== HISTÓRICO DE PAGAMENTOS ====================
    print("\n💰 Criando histórico de pagamentos...")
    
    payment_methods = ['credit_card', 'boleto', 'pix']
    payment_count = 0
    
    for tenant, tenant_data in tenants:
        subscription = Subscription.objects.get(tenant=tenant)
        
        # Não cria pagamentos para trials ou suspensos
        if tenant_data['subscription_status'] in ['trial', 'suspended']:
            continue
        
        # Cria 3-6 pagamentos históricos
        num_payments = 3 if tenant.plan == 'basic' else 6 if tenant.plan == 'premium' else 4
        
        for i in range(num_payments):
            payment_date = timezone.now() - timedelta(days=30 * (num_payments - i))
            
            payment, created = PaymentHistory.objects.get_or_create(
                subscription=subscription,
                reference_month=payment_date.date(),
                defaults={
                    'amount': subscription.monthly_price,
                    'payment_method': payment_methods[i % len(payment_methods)],
                    'status': 'paid',
                    'paid_at': payment_date,
                    'transaction_id': f'TXN{tenant.id}{i:03d}',
                }
            )
            
            if created:
                payment_count += 1
    
    print(f"  ✅ {payment_count} pagamentos criados")
    
    # ==================== ESTATÍSTICAS DE USO ====================
    print("\n📊 Criando estatísticas de uso...")
    
    stats_count = 0
    for tenant, tenant_data in tenants:
        # Cria estatísticas para os últimos 6 meses
        for months_ago in range(6):
            stat_month = (timezone.now().date().replace(day=1) - timedelta(days=30 * months_ago))
            
            # Varia os valores baseado no plano
            if tenant.plan == 'basic':
                api_calls = 100 + (months_ago * 5)
                storage = 50 + (months_ago * 2)
                appointments = 50 + (months_ago * 3)
            elif tenant.plan == 'professional':
                api_calls = 500 + (months_ago * 20)
                storage = 200 + (months_ago * 8)
                appointments = 150 + (months_ago * 10)
            else:  # enterprise
                api_calls = 1500 + (months_ago * 50)
                storage = 1000 + (months_ago * 30)
                appointments = 500 + (months_ago * 20)
            
            stat, created = TenantUsageStats.objects.get_or_create(
                tenant=tenant,
                month=stat_month,
                defaults={
                    'api_calls': api_calls,
                    'storage_used_mb': storage,
                    'active_users': tenant_data['users_count'],
                    'total_appointments': appointments,
                }
            )
            
            if created:
                stats_count += 1
    
    print(f"  ✅ {stats_count} registros de estatísticas criados")
    
    # ==================== RESUMO ====================
    print("\n" + "="*60)
    print("✨ RESUMO DA POPULAÇÃO")
    print("="*60)
    
    total_tenants = Tenant.objects.count()
    active_tenants = Tenant.objects.filter(is_active=True).count()
    trial_tenants = Subscription.objects.filter(status='trial').count()
    total_users = User.objects.exclude(role='superadmin').count()
    total_subscriptions = Subscription.objects.count()
    total_payments = PaymentHistory.objects.count()
    
    print(f"\n📦 Tenants: {total_tenants} total ({active_tenants} ativos, {trial_tenants} em trial)")
    print(f"👥 Usuários: {total_users} (excluindo superadmins)")
    print(f"💳 Assinaturas: {total_subscriptions}")
    print(f"💰 Pagamentos: {total_payments}")
    print(f"📊 Estatísticas: {stats_count} meses de dados")
    
    # Receita total
    total_revenue = PaymentHistory.objects.filter(status='paid').aggregate(
        total=django.db.models.Sum('amount')
    )['total'] or Decimal('0')
    
    print(f"\n💵 Receita Total: R$ {total_revenue:,.2f}")
    
    print("\n✅ População concluída com sucesso!")
    print("\n📝 Credenciais de acesso:")
    print("   Admin: admin@[nometenant].com / admin123")
    print("   User: user1@[nometenant].com / user123")


if __name__ == '__main__':
    import django.db.models
    populate_superadmin_data()
