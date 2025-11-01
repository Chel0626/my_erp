"""
Script para criar superusuário no banco Railway
"""
import os
import django
import sys

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Dados do superusuário
email = "michelhm1@gmail.com"
full_name = "Michel Genrique Macedo"
password = input("Digite a senha para o superusuário: ")

# Verificar se já existe
if User.objects.filter(email=email).exists():
    print(f"✅ Usuário com email {email} já existe!")
    user = User.objects.get(email=email)
    print(f"   Email: {user.email}")
    print(f"   É superusuário: {user.is_superuser}")
    print(f"   É staff: {user.is_staff}")
    
    # Atualizar para garantir que é superusuário
    user.is_superuser = True
    user.is_staff = True
    user.save()
    print("✅ Permissões de superusuário confirmadas!")
    print("\nO superusuário está pronto para uso!")
else:
    # Criar superusuário
    user = User.objects.create_superuser(
        email=email,
        full_name=full_name,
        password=password
    )
    print(f"✅ Superusuário criado com sucesso!")
    print(f"   Email: {email}")
    print(f"   Nome: {full_name}")
