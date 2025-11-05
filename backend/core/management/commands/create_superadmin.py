"""
Management command para criar Super Admin
Execute: python manage.py create_superadmin
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Cria ou atualiza o usuário Super Admin'

    def handle(self, *args, **options):
        email = 'superadmin@myerp.com'
        password = 'SuperAdmin@123'
        name = 'Super Administrador'
        
        self.stdout.write("🚀 Criando/atualizando Super Admin...")
        self.stdout.write(f"📊 Total de usuários: {User.objects.count()}")
        
        # Verifica se já existe
        try:
            user = User.objects.get(email=email)
            self.stdout.write(self.style.WARNING(f"⚠️  Usuário já existe: {user.email}"))
            
            # Atualiza senha e permissões
            user.set_password(password)
            user.role = 'superadmin'
            user.tenant = None
            user.is_staff = True
            user.is_superuser = True
            user.name = name
            user.save()
            
            self.stdout.write(self.style.SUCCESS("✅ Usuário atualizado!"))
            
        except User.DoesNotExist:
            self.stdout.write("📝 Criando novo usuário...")
            
            user = User.objects.create_user(
                email=email,
                password=password,
                name=name,
                role='superadmin',
                tenant=None,
                is_staff=True,
                is_superuser=True
            )
            
            self.stdout.write(self.style.SUCCESS("✅ Super Admin criado!"))
        
        # Verifica
        user.refresh_from_db()
        self.stdout.write("\n🔍 Verificação:")
        self.stdout.write(f"   ID: {user.id}")
        self.stdout.write(f"   Email: {user.email}")
        self.stdout.write(f"   Nome: {user.name}")
        self.stdout.write(f"   Role: {user.role}")
        self.stdout.write(f"   is_staff: {user.is_staff}")
        self.stdout.write(f"   is_superuser: {user.is_superuser}")
        self.stdout.write(f"   Senha OK: {user.check_password(password)}")
        
        self.stdout.write("\n📋 Credenciais:")
        self.stdout.write(f"   Email: {email}")
        self.stdout.write(f"   Senha: {password}")
        
        self.stdout.write(self.style.SUCCESS("\n✅ Concluído!"))
