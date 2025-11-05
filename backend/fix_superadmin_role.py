"""
Script para atualizar o role do usuário michelhm91@gmail.com para superadmin
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import User

try:
    user = User.objects.get(email='michelhm91@gmail.com')
    print(f"\n📋 Dados atuais do usuário:")
    print(f"   Email: {user.email}")
    print(f"   Role atual: {user.role}")
    print(f"   Is Superuser: {user.is_superuser}")
    print(f"   Is Staff: {user.is_staff}")
    print(f"   Tenant: {user.tenant}")
    
    # Atualizar para superadmin
    print(f"\n🔧 Atualizando role de '{user.role}' para 'superadmin'...")
    user.role = 'superadmin'
    user.save()
    
    # Verificar atualização
    user.refresh_from_db()
    print(f"\n✅ Role atualizado com sucesso!")
    print(f"   Novo role: {user.role}")
    
except User.DoesNotExist:
    print(f"\n❌ Usuário michelhm91@gmail.com não encontrado")
except Exception as e:
    print(f"\n❌ Erro ao atualizar: {e}")
    import traceback
    traceback.print_exc()
