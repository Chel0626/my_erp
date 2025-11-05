"""
Script para verificar o role do usuário michelhm91@gmail.com
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import User

try:
    user = User.objects.get(email='michelhm91@gmail.com')
    print(f"\n✅ Usuário encontrado:")
    print(f"   Email: {user.email}")
    print(f"   Nome: {user.name}")
    print(f"   Role: {user.role}")
    print(f"   Is Superuser: {user.is_superuser}")
    print(f"   Is Staff: {user.is_staff}")
    print(f"   Tenant: {user.tenant}")
    print(f"   Tenant ID: {user.tenant_id if user.tenant else 'Nenhum'}")
    
    # Verificar se precisa atualizar
    if user.role != 'superadmin':
        print(f"\n⚠️ PROBLEMA ENCONTRADO: Role atual é '{user.role}', mas deveria ser 'superadmin'")
        print(f"\n🔧 Atualizando role para 'superadmin'...")
        user.role = 'superadmin'
        user.tenant = None  # Superadmin não tem tenant
        user.save()
        print(f"✅ Role atualizado com sucesso!")
    else:
        print(f"\n✅ Role já está correto (superadmin)")
        
except User.DoesNotExist:
    print(f"\n❌ Usuário michelhm91@gmail.com não encontrado no banco de dados")
except Exception as e:
    print(f"\n❌ Erro: {e}")
