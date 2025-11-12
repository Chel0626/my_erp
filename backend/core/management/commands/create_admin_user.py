"""
Management command para criar superusuário no Railway
Execute: railway run python manage.py create_admin_user
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Cria superusuário admin@admin.com se não existir'

    def handle(self, *args, **options):
        email = 'admin@admin.com'
        password = 'admin123'
        name = 'Administrador do Sistema'
        
        if User.objects.filter(email=email).exists():
            user = User.objects.get(email=email)
            self.stdout.write(self.style.WARNING(f'❌ Superusuário {email} já existe!'))
            self.stdout.write(f'   - Email: {user.email}')
            self.stdout.write(f'   - Nome: {user.name}')
            self.stdout.write(f'   - É superuser: {user.is_superuser}')
            self.stdout.write(f'   - É staff: {user.is_staff}')
        else:
            user = User.objects.create_superuser(
                email=email,
                password=password,
                name=name
            )
            self.stdout.write(self.style.SUCCESS(f'✅ Superusuário criado com sucesso!'))
            self.stdout.write(f'   - Email: {user.email}')
            self.stdout.write(f'   - Senha: {password}')
            self.stdout.write(f'   - Nome: {user.name}')
            self.stdout.write(f'   - É superuser: {user.is_superuser}')
            self.stdout.write(f'   - É staff: {user.is_staff}')
