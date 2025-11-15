"""
Sistema de autenticação SSO com Google OAuth 2.0
"""
try:
    import requests as http_requests
    GOOGLE_AUTH_AVAILABLE = True
except ImportError:
    GOOGLE_AUTH_AVAILABLE = False
    http_requests = None
    
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed

User = get_user_model()

# Import Tenant para criar workspace automático em OAuth
def get_tenant_model():
    from .models import Tenant
    return Tenant


class GoogleOAuthSerializer(serializers.Serializer):
    """Serializer para login com Google - aceita access_token"""
    token = serializers.CharField(required=True)
    
    def validate(self, attrs):
        """Valida o token do Google"""
        token = attrs.get('token')
        
        # Valida o token e obtém dados do usuário
        attrs['user_data'] = self.get_user_info_from_token(token)
        
        return attrs
    
    def get_user_info_from_token(self, access_token):
        """Obtém informações do usuário usando access token"""
        if not GOOGLE_AUTH_AVAILABLE:
            raise AuthenticationFailed('Google OAuth não está disponível (dependências não instaladas)')
            
        try:
            response = http_requests.get(
                'https://www.googleapis.com/oauth2/v2/userinfo',
                headers={'Authorization': f'Bearer {access_token}'}
            )
            
            if response.status_code != 200:
                raise AuthenticationFailed('Token inválido ou expirado')
            
            user_info = response.json()
            
            if not user_info.get('email'):
                raise AuthenticationFailed('Email não fornecido pelo Google')
            
            return {
                'google_id': user_info.get('id'),
                'email': user_info.get('email'),
                'name': user_info.get('name', ''),
                'picture': user_info.get('picture', ''),
            }
        except AuthenticationFailed:
            raise
        except Exception as e:
            raise AuthenticationFailed(f'Erro ao obter dados do usuário: {str(e)}')


def get_or_create_google_user(google_data):
    """
    Obtém ou cria um usuário baseado nos dados do Google
    
    Args:
        google_data: Dicionário com google_id, email, name, picture
        
    Returns:
        User: Instância do usuário
    """
    google_id = google_data['google_id']
    email = google_data['email']
    
    # Tenta encontrar usuário existente pelo Google ID
    user = User.objects.filter(google_id=google_id).first()
    
    if user:
        # Atualiza informações se necessário
        if user.google_email != email:
            user.google_email = email
        if user.email != email and not User.objects.filter(email=email).exclude(id=user.id).exists():
            user.email = email
        if google_data.get('picture') and user.profile_picture != google_data['picture']:
            user.profile_picture = google_data['picture']
        user.save()
        return user
    
    # Tenta encontrar usuário pelo email
    user = User.objects.filter(email=email).first()
    
    if user:
        # Vincula conta Google existente
        user.google_id = google_id
        user.google_email = email
        if google_data.get('picture'):
            user.profile_picture = google_data['picture']
        user.save()
        return user
    
    # Cria novo usuário
    # Para Google OAuth, cria automaticamente um tenant pessoal
    from django.db import transaction
    
    Tenant = get_tenant_model()
    
    with transaction.atomic():
        # Cria o tenant primeiro
        tenant = Tenant.objects.create(
            name=f"{google_data.get('name', email.split('@')[0])}'s Workspace",
            plan='basico',
            is_active=True
        )
        
        # Cria o usuário como owner do tenant
        user = User.objects.create_user(
            email=email,
            name=google_data.get('name', email.split('@')[0]),
            google_id=google_id,
            google_email=email,
            profile_picture=google_data.get('picture', ''),
            tenant=tenant,
            role='admin',
            is_active=True,
        )
        
        # Define o usuário como owner do tenant
        tenant.owner = user
        tenant.save()
    
    return user


def unlink_google_account(user):
    """
    Desvincula conta Google de um usuário
    
    Args:
        user: Instância do usuário
    """
    if not user.google_id:
        return
    
    # Verifica se o usuário tem senha definida
    if not user.has_usable_password():
        raise serializers.ValidationError(
            'Não é possível desvincular a conta Google sem definir uma senha primeiro'
        )
    
    user.google_id = None
    user.google_email = None
    user.save()
