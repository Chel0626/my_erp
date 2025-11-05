"""
Script para criar Super Admin diretamente no Railway via CLI
Execute: railway run python create_superadmin_railway.py
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

print("🚀 Conectando ao banco Railway...", flush=True)
django.setup()
print("✅ Django configurado", flush=True)

from django.contrib.auth import get_user_model

User = get_user_model()

def main():
    email = 'superadmin@myerp.com'
    password = 'SuperAdmin@123'
    name = 'Super Administrador'
    
    print(f"\n📧 Procurando usuário: {email}", flush=True)
    print(f"📊 Total de usuários no banco: {User.objects.count()}", flush=True)
    
    # Lista todos os usuários existentes
    all_users = User.objects.all()
    if all_users.exists():
        print(f"\n👥 Usuários existentes:", flush=True)
        for u in all_users[:10]:  # Mostra até 10 usuários
            print(f"   - {u.email} | Role: {u.role} | Staff: {u.is_staff} | Super: {u.is_superuser}", flush=True)
    
    # Verifica se já existe
    try:
        user = User.objects.get(email=email)
        print(f"\n⚠️  Usuário já existe!", flush=True)
        print(f"   📧 Email: {user.email}", flush=True)
        print(f"   👤 Nome: {user.name}", flush=True)
        print(f"   🎭 Role: {user.role}", flush=True)
        print(f"   🏢 Tenant ID: {user.tenant_id}", flush=True)
        print(f"   👔 is_staff: {user.is_staff}", flush=True)
        print(f"   ⭐ is_superuser: {user.is_superuser}", flush=True)
        
        # Atualiza senha e permissões
        user.set_password(password)
        user.role = 'superadmin'
        user.tenant = None
        user.is_staff = True
        user.is_superuser = True
        user.name = name
        user.save()
        
        print("\n✅ Usuário atualizado com sucesso!", flush=True)
        
    except User.DoesNotExist:
        print(f"\n📝 Criando novo usuário...", flush=True)
        
        user = User.objects.create_user(
            email=email,
            password=password,
            name=name,
            role='superadmin',
            tenant=None,
            is_staff=True,
            is_superuser=True
        )
        
        print("✅ Super Admin criado com sucesso!", flush=True)
    
    # Verifica se foi salvo
    user.refresh_from_db()
    print(f"\n🔍 Verificação final:", flush=True)
    print(f"   ID: {user.id}", flush=True)
    print(f"   Email: {user.email}", flush=True)
    print(f"   Nome: {user.name}", flush=True)
    print(f"   Role: {user.role}", flush=True)
    print(f"   is_staff: {user.is_staff}", flush=True)
    print(f"   is_superuser: {user.is_superuser}", flush=True)
    print(f"   Senha válida: {user.check_password(password)}", flush=True)
    
    print(f"\n📋 Credenciais de acesso:", flush=True)
    print(f"   📧 Email: {email}", flush=True)
    print(f"   🔑 Senha: {password}", flush=True)
    
    print(f"\n🌐 URLs:", flush=True)
    print(f"   Django Admin: https://myerp-production-4bb9.up.railway.app/admin/", flush=True)
    print(f"   Frontend: https://vrb-erp-frontend.vercel.app/login", flush=True)

if __name__ == '__main__':
    try:
        main()
        print(f"\n✅ Script concluído!", flush=True)
    except Exception as e:
        print(f"\n❌ ERRO: {e}", flush=True)
        import traceback
        traceback.print_exc()
        sys.exit(1)
