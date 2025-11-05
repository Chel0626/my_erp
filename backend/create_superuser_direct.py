#!/usr/bin/env python
"""
Script para criar superuser diretamente no banco de dados.
Uso: python create_superuser_direct.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

email = "superadmin@myerp.com"
password = "SuperAdmin@123"
nome = "Super Admin"

if User.objects.filter(email=email).exists():
    user = User.objects.get(email=email)
    user.is_superuser = True
    user.is_staff = True
    user.nome = nome
    user.set_password(password)
    user.save()
    print(f"✅ Superusuário atualizado: {email}")
else:
    User.objects.create_superuser(
        email=email,
        password=password,
        nome=nome
    )
    print(f"✅ Superusuário criado: {email}")

print(f"Email: {email}")
print(f"Senha: {password}")
