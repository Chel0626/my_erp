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

# Force unbuffered output para ver logs no Railway
sys.stdout = os.fdopen(sys.stdout.fileno(), 'w', buffering=1)
sys.stderr = os.fdopen(sys.stderr.fileno(), 'w', buffering=1)

print("🚀 Iniciando criação do Super Admin...", flush=True)

try:
    django.setup()
    print("✅ Django configurado com sucesso", flush=True)
except Exception as e:
    print(f"❌ Erro ao configurar Django: {e}", flush=True)
    sys.exit(1)

from django.contrib.auth import get_user_model
from core.models import Tenant

User = get_user_model()

def create_super_admin():
    email = 'superadmin@myerp.com'
    password = 'SuperAdmin@123'
    name = 'Super Administrador'
    
    print(f"📧 Verificando usuário: {email}", flush=True)
    
    # Verifica se já existe
    if User.objects.filter(email=email).exists():
        user = User.objects.get(email=email)
        print(f"⚠️  Usuário Super Admin já existe!", flush=True)
        print(f"   📧 Email: {user.email}", flush=True)
        print(f"   👤 Nome: {user.name}", flush=True)
        print(f"   🎭 Role: {user.role}", flush=True)
        print(f"   🏢 Tenant: {user.tenant.name if user.tenant else 'N/A'}", flush=True)
        
        # Atualiza para garantir que é superadmin
        if user.role != 'superadmin':
            user.role = 'superadmin'
            user.tenant = None  # Super admin não pertence a nenhum tenant
            user.is_staff = True
            user.is_superuser = True
            user.save()
            print("\n✅ Atualizado para Super Admin!", flush=True)
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
        
        print("✅ Super Admin criado com sucesso!", flush=True)
        print(f"\n📋 Credenciais:", flush=True)
        print(f"   📧 Email: {email}", flush=True)
        print(f"   🔑 Senha: {password}", flush=True)
        print(f"   👤 Nome: {name}", flush=True)
        print(f"   🎭 Role: superadmin", flush=True)
    
    print(f"\n🌐 URLs de Acesso:", flush=True)
    print(f"   Frontend (Produção): https://vrb-erp-frontend.vercel.app/superadmin", flush=True)
    print(f"   Backend API: https://myerp-production-4bb9.up.railway.app/api/superadmin/", flush=True)
    print(f"\n🔐 Faça login com:", flush=True)
    print(f"   Email: {email}", flush=True)
    print(f"   Senha: {password}", flush=True)
    
    return user

if __name__ == '__main__':
    try:
        user = create_super_admin()
        print(f"\n✅ Script concluído com sucesso! Usuário ID: {user.id}", flush=True)
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ ERRO CRÍTICO: {e}", flush=True)
        import traceback
        traceback.print_exc()
        sys.exit(1)
