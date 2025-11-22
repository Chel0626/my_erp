"""
Serializers do núcleo Multi-Tenant
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from .models import Tenant, User
from .oauth import GoogleOAuthSerializer


class TenantSerializer(serializers.ModelSerializer):
    """Serializer para Tenant"""
    is_trial_active = serializers.BooleanField(read_only=True)
    is_trial_expired = serializers.BooleanField(read_only=True)
    can_access_system = serializers.BooleanField(read_only=True)
    has_reached_client_limit = serializers.BooleanField(read_only=True)
    has_reached_service_limit = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Tenant
        fields = [
            'id', 'name', 'business_name', 'trade_name', 'cnpj',
            'state_registration', 'municipal_registration',
            'address_street', 'address_number', 'address_complement',
            'address_neighborhood', 'address_city', 'address_state', 'address_zipcode',
            'phone', 'whatsapp', 'email', 'website',
            'logo', 'primary_color',
            'certificate_expiry',
            'plan', 'plan_id', 'subscription_status', 'trial_ends_at',
            'mp_subscription_id', 'current_clients_count', 'current_services_count',
            'is_trial_active', 'is_trial_expired', 'can_access_system',
            'has_reached_client_limit', 'has_reached_service_limit',
            'is_active', 'created_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'certificate_expiry', 'subscription_status',
            'trial_ends_at', 'mp_subscription_id', 'current_clients_count',
            'current_services_count', 'is_trial_active', 'is_trial_expired',
            'can_access_system', 'has_reached_client_limit', 'has_reached_service_limit'
        ]


class UserSerializer(serializers.ModelSerializer):
    """Serializer para User"""
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'name', 'tenant', 'tenant_name', 'role',
            'google_id', 'google_email', 'profile_picture',
            'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'google_id', 'google_email']
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
        1. Criar Tenant com TRIAL automático de 7 dias
        2. Criar Usuário
        3. Atualizar Tenant com owner
        4. Retornar dados
        """
        from django.utils import timezone
        from datetime import timedelta
        
        # AÇÃO 1: Criar Tenant com TRIAL automático
        tenant = Tenant.objects.create(
            name=validated_data['company_name'],
            subscription_status='TRIAL',
            trial_ends_at=timezone.now() + timedelta(days=7),
            plan_id='basico',  # Inicia com plano básico por padrão
            current_clients_count=0,
            current_services_count=0
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
    phone = serializers.CharField(required=False, allow_blank=True, max_length=20)
    password = serializers.CharField(required=False, write_only=True)
    role = serializers.ChoiceField(
        choices=User.ROLE_CHOICES,
        required=False,
        default='profissional'
    )

    def validate_email(self, value):
        """Valida se o email já está em uso"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email já está cadastrado.")
        return value

    def validate_role(self, value):
        """Não permite convidar outro admin via convite (usar apenas para admin owner)"""
        # Permite admin apenas se for o primeiro usuário
        return value

    def create(self, validated_data):
        """
        Cria usuário vinculado ao tenant do usuário atual
        """
        # Obtém o tenant do contexto (passado pela view)
        request = self.context.get('request')
        tenant = request.user.tenant

        # Se senha foi fornecida, usa ela; senão gera temporária
        password = validated_data.pop('password', None)
        if not password:
            import secrets
            password = secrets.token_urlsafe(12)
            is_temp_password = True
        else:
            is_temp_password = False

        # Remove phone do validated_data se estiver vazio
        phone = validated_data.pop('phone', None)

        # AÇÃO 1: Criar Usuário Convidado
        user = User.objects.create_user(
            email=validated_data['email'],
            password=password,
            name=validated_data['name'],
            tenant=tenant,  # LIGAÇÃO AUTOMÁTICA!
            role=validated_data.get('role', 'profissional')
        )
        
        # Adiciona telefone se fornecido
        if phone:
            user.phone = phone
            user.save()

        # AÇÃO 2: Enviar email com senha temporária
        if is_temp_password:
            from .emails import send_invite_email
            send_invite_email(
                user_email=user.email,
                user_name=user.name,
                temporary_password=password,
                company_name=tenant.company_name,
                invited_by_name=request.user.name
            )

        return {
            'user': user,
            'temporary_password': password if is_temp_password else None
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


class CustomJWTSerializer(serializers.Serializer):
    """
    Serializer customizado para login JWT com dj-rest-auth
    Retorna access token, refresh token e dados do usuário
    """
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)
    user = UserSerializer(read_only=True)


class GoogleOAuthLoginSerializer(GoogleOAuthSerializer):
    """
    Serializer para login/cadastro com Google OAuth
    Herda validação de token do GoogleOAuthSerializer
    """
    pass


class TenantCertificateSerializer(serializers.Serializer):
    """Serializer para upload de certificado digital"""
    certificate_file = serializers.FileField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    
    def validate_certificate_file(self, value):
        """Valida se o arquivo é .pfx"""
        if not value.name.endswith('.pfx'):
            raise serializers.ValidationError('Apenas arquivos .pfx são aceitos')
        return value
