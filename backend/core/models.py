"""
Models do núcleo Multi-Tenant
Implementa a base de dados conforme BLOCO 1 do Canvas de Implementação
"""
import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class Tenant(models.Model):
    """
    Representa cada empresa cliente (Barbearia, Padaria, etc.)
    Tabela central do sistema Multi-Tenant
    """
    PLAN_CHOICES = [
        ('basico', 'Básico'),
        ('premium', 'Premium'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField('Nome da Empresa', max_length=255)
    owner = models.ForeignKey(
        'User',
        on_delete=models.PROTECT,
        related_name='owned_tenants',
        null=True,
        blank=True,
        verbose_name='Proprietário'
    )
    plan = models.CharField(
        'Plano',
        max_length=20,
        choices=PLAN_CHOICES,
        default='basico'
    )
    is_active = models.BooleanField('Ativo', default=True)
    created_at = models.DateTimeField('Criado em', auto_now_add=True)
    updated_at = models.DateTimeField('Atualizado em', auto_now=True)

    class Meta:
        verbose_name = 'Tenant'
        verbose_name_plural = 'Tenants'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class UserManager(BaseUserManager):
    """Manager personalizado para o modelo User"""

    def create_user(self, email, password=None, **extra_fields):
        """Cria e retorna um usuário com email e senha"""
        if not email:
            raise ValueError('O email é obrigatório')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Cria e retorna um superusuário"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser deve ter is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser deve ter is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Modelo de usuário personalizado
    Cada usuário pertence a um Tenant (CAMPO MAIS IMPORTANTE!)
    """
    ROLE_CHOICES = [
        ('admin', 'Administrador'),
        ('barbeiro', 'Barbeiro'),
        ('caixa', 'Caixa'),
        ('atendente', 'Atendente'),
        ('superadmin', 'Super Administrador'),  # Super admin para gerenciar todos os tenants
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField('Email', unique=True)
    name = models.CharField('Nome Completo', max_length=255)
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='users',
        verbose_name='Empresa',
        null=True,
        blank=True
    )
    role = models.CharField(
        'Função',
        max_length=20,
        choices=ROLE_CHOICES,
        default='atendente'
    )
    is_active = models.BooleanField('Ativo', default=True)
    is_staff = models.BooleanField('Staff', default=False)
    created_at = models.DateTimeField('Criado em', auto_now_add=True)
    updated_at = models.DateTimeField('Atualizado em', auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.email})"

    def is_admin(self):
        """Verifica se o usuário é admin do seu tenant"""
        return self.role == 'admin'


class TenantAwareModel(models.Model):
    """
    Classe abstrata que adiciona tenant_id a qualquer modelo
    Todos os modelos de negócio devem herdar desta classe
    """
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        verbose_name='Empresa',
        related_name='%(class)s_set'
    )

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        """Valida que o tenant está definido antes de salvar"""
        if not self.tenant_id:
            raise ValueError('Tenant é obrigatório para este modelo')
        super().save(*args, **kwargs)
