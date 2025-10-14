"""
Script para criar superusuário
Execute: python manage.py shell < create_superuser.py
"""
from django.contrib.auth import get_user_model

User = get_user_model()

# Verifica se já existe
if User.objects.filter(email='admin@admin.com').exists():
    print("❌ Superusuário admin@admin.com já existe!")
    user = User.objects.get(email='admin@admin.com')
    print(f"   - Email: {user.email}")
    print(f"   - Nome: {user.name}")
else:
    # Cria superusuário
    user = User.objects.create_superuser(
        email='admin@admin.com',
        password='admin123',
        name='Administrador do Sistema'
    )
    print("✅ Superusuário criado com sucesso!")
    print(f"   - Email: {user.email}")
    print(f"   - Senha: admin123")
    print(f"   - Nome: {user.name}")
    print("\n🔗 Acesse: http://localhost:8000/admin/")
