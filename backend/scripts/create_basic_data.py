"""
Script simplificado para criar dados básicos de demonstração
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from core.models import Tenant

User = get_user_model()

def main():
    """Cria tenant e superusuário"""
    print("="*60)
    print("🚀 CRIANDO DADOS BÁSICOS")
    print("="*60)
    
    # Criar tenant
    tenant, created = Tenant.objects.get_or_create(
        name="Salão Demo Local",
        defaults={
            'plan': 'premium',
            'is_active': True
        }
    )
    if created:
        print(f"✅ Tenant criado: {tenant.name}")
    else:
        print(f"✅ Tenant existente: {tenant.name}")
    
    # Criar superusuário admin@teste.com
    admin_email = 'admin@teste.com'
    if not User.objects.filter(email=admin_email).exists():
        admin = User.objects.create_superuser(
            email=admin_email,
            password='Admin@123',
            name='Admin Sistema',
            tenant=tenant
        )
        print(f"✅ Superusuário criado: {admin.email}")
        print(f"   Senha: Admin@123")
    else:
        print(f"✅ Superusuário já existe: {admin_email}")
    
    # Criar profissionais
    users_data = [
        {'email': 'ana.silva@demo.com', 'name': 'Ana Silva'},
        {'email': 'carlos.souza@demo.com', 'name': 'Carlos Souza'},
        {'email': 'maria.santos@demo.com', 'name': 'Maria Santos'},
    ]
    
    for data in users_data:
        user, created = User.objects.get_or_create(
            email=data['email'],
            defaults={
                'tenant': tenant,
                'name': data['name'],
            }
        )
        if created:
            user.set_password('Demo@123')
            user.save()
            print(f"✅ Profissional criado: {user.name}")
        else:
            print(f"✅ Profissional já existe: {user.name}")
    
    print("\n" + "="*60)
    print("✅ DADOS BÁSICOS CRIADOS!")
    print("="*60)
    print("\n📋 CREDENCIAIS DE ACESSO:")
    print(f"  Email: admin@teste.com")
    print(f"  Senha: Admin@123")
    print("\n🌐 Acesse: http://localhost:3000/login")
    print("="*60)

if __name__ == '__main__':
    main()
