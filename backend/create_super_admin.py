"""
Script para criar usuário Super Admin
Execute: python create_super_admin.py
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from core.models import Tenant

User = get_user_model()

def create_super_admin():
    email = 'superadmin@myerp.com'
    password = 'SuperAdmin@123'
    name = 'Super Administrador'
    
    # Verifica se já existe
    if User.objects.filter(email=email).exists():
        user = User.objects.get(email=email)
        print(f"⚠️  Usuário Super Admin já existe!")
        print(f"   📧 Email: {user.email}")
        print(f"   👤 Nome: {user.name}")
        print(f"   🎭 Role: {user.role}")
        print(f"   🏢 Tenant: {user.tenant.name if user.tenant else 'N/A'}")
        
        # Atualiza para garantir que é superadmin
        if user.role != 'superadmin':
            user.role = 'superadmin'
            user.tenant = None  # Super admin não pertence a nenhum tenant
            user.is_staff = True
            user.is_superuser = True
            user.save()
            print("\n✅ Atualizado para Super Admin!")
    else:
        # Cria o usuário Super Admin
        user = User.objects.create_user(
            email=email,
            password=password,
            name=name,
            role='superadmin',
            tenant=None,  # Super admin não pertence a nenhum tenant
            is_staff=True,
            is_superuser=True
        )
        
        print("✅ Super Admin criado com sucesso!")
        print(f"\n📋 Credenciais:")
        print(f"   📧 Email: {email}")
        print(f"   🔑 Senha: {password}")
        print(f"   👤 Nome: {name}")
        print(f"   🎭 Role: superadmin")
    
    print(f"\n🌐 URLs de Acesso:")
    print(f"   Frontend (Produção): https://vrb-erp-frontend.vercel.app/superadmin")
    print(f"   Backend API: https://myerp-production-4bb9.up.railway.app/api/superadmin/")
    print(f"\n🔐 Faça login com:")
    print(f"   Email: {email}")
    print(f"   Senha: {password}")

if __name__ == '__main__':
    create_super_admin()
