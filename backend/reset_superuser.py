#!/usr/bin/env python
"""
Script para resetar superuser no Supabase.
Remove todos exceto michelhm91@gmail.com e reseta sua senha.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Email e senha do superuser que vamos manter
SUPERUSER_EMAIL = "michelhm91@gmail.com"
SUPERUSER_PASSWORD = "Admin@123"
SUPERUSER_NOME = "Michel Henrique"

print("🔍 Verificando usuários no banco...")

# Listar todos os superusers
all_superusers = User.objects.filter(is_superuser=True)
print(f"📊 Total de superusers encontrados: {all_superusers.count()}")

for user in all_superusers:
    print(f"  - {user.email} (ID: {user.id})")

print("\n🗑️  Deletando superusers desnecessários...")

# Deletar todos os superusers EXCETO o michelhm91
deleted_count = User.objects.filter(is_superuser=True).exclude(email=SUPERUSER_EMAIL).delete()
print(f"✅ Deletados: {deleted_count[0]} usuários")

print(f"\n🔄 Atualizando/criando superuser: {SUPERUSER_EMAIL}")

# Criar ou atualizar o superuser principal
user, created = User.objects.update_or_create(
    email=SUPERUSER_EMAIL,
    defaults={
        'is_superuser': True,
        'is_staff': True,
        'nome': SUPERUSER_NOME,
    }
)

# Resetar senha
user.set_password(SUPERUSER_PASSWORD)
user.save()

if created:
    print(f"✅ Superuser CRIADO: {SUPERUSER_EMAIL}")
else:
    print(f"✅ Superuser ATUALIZADO: {SUPERUSER_EMAIL}")

print("\n" + "="*60)
print("🎉 CONFIGURAÇÃO COMPLETA!")
print("="*60)
print(f"📧 Email: {SUPERUSER_EMAIL}")
print(f"🔑 Senha: {SUPERUSER_PASSWORD}")
print(f"🌐 URL Admin: https://myerp-production-4bb9.up.railway.app/admin/")
print("="*60)
