"""
Serializers do núcleo Multi-Tenant
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from .models import Tenant, User


class TenantSerializer(serializers.ModelSerializer):
    """Serializer para Tenant"""
    
    class Meta:
        model = Tenant
        fields = ['id', 'name', 'plan', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserSerializer(serializers.ModelSerializer):
    """Serializer para User"""
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'tenant', 'tenant_name', 'role', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {
            'password': {'write_only': True}
        }


class SignUpSerializer(serializers.Serializer):
    """
    Serializer para Sign Up de novo cliente
    Implementa BLOCO 2: Workflow - Novo Cliente - Sign Up
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    name = serializers.CharField(required=True, max_length=255)
    company_name = serializers.CharField(required=True, max_length=255)

    def validate_email(self, value):
        """Valida se o email já está em uso"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email já está cadastrado.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        """
        Cria tenant e usuário em uma transação atômica
        Segue o workflow do Canvas:
        1. Criar Tenant
        2. Criar Usuário
        3. Atualizar Tenant com owner
        4. Retornar dados
        """
        # AÇÃO 1: Criar Tenant
        tenant = Tenant.objects.create(
            name=validated_data['company_name']
        )

        # AÇÃO 2: Criar Usuário
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data['name'],
            tenant=tenant,
            role='admin'
        )

        # AÇÃO 3: Atualizar Tenant com owner
        tenant.owner = user
        tenant.save()

        return {
            'user': user,
            'tenant': tenant
        }


class InviteUserSerializer(serializers.Serializer):
    """
    Serializer para convidar membro da equipe
    Implementa BLOCO 2: Workflow - Convidar Membro da Equipe
    """
    email = serializers.EmailField(required=True)
    name = serializers.CharField(required=True, max_length=255)
    role = serializers.ChoiceField(
        choices=User.ROLE_CHOICES,
        required=True
    )

    def validate_email(self, value):
        """Valida se o email já está em uso"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email já está cadastrado.")
        return value

    def validate_role(self, value):
        """Não permite convidar outro admin"""
        if value == 'admin':
            raise serializers.ValidationError("Não é permitido convidar outro administrador.")
        return value

    def create(self, validated_data):
        """
        Cria usuário convidado vinculado ao tenant do usuário atual
        """
        # Obtém o tenant do contexto (passado pela view)
        request = self.context.get('request')
        tenant = request.user.tenant

        # Gera senha temporária (pode ser melhorado com envio de email)
        import secrets
        temporary_password = secrets.token_urlsafe(12)

        # AÇÃO 1: Criar Usuário Convidado
        user = User.objects.create_user(
            email=validated_data['email'],
            password=temporary_password,
            name=validated_data['name'],
            tenant=tenant,  # LIGAÇÃO AUTOMÁTICA!
            role=validated_data['role']
        )

        # TODO: AÇÃO 2: Enviar email com senha temporária
        # send_invitation_email(user, temporary_password)

        return {
            'user': user,
            'temporary_password': temporary_password
        }


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer para troca de senha"""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password]
    )

    def validate_old_password(self, value):
        """Valida se a senha antiga está correta"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Senha antiga incorreta.")
        return value

    def save(self):
        """Atualiza a senha do usuário"""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
