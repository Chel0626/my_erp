from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = "Cria ou atualiza o superusuário padrão para o painel do ERP."

    def handle(self, *args, **options):
        User = get_user_model()
        email = "superadmin@myerp.com"
        password = "SuperAdmin@123"
        nome = "Super Admin"
        if not User.objects.filter(email=email).exists():
            User.objects.create_superuser(email=email, password=password, nome=nome)
            self.stdout.write(self.style.SUCCESS(f"✅ Superusuário criado: {email}"))
        else:
            user = User.objects.get(email=email)
            user.is_superuser = True
            user.is_staff = True
            user.nome = nome
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.WARNING(f"⚠️ Superusuário já existia, senha e permissões atualizadas: {email}"))
