"""
Sistema de autenticação SSO com Google OAuth 2.0
"""
try:
    from google.oauth2 import id_token
    from google.auth.transport import requests
    GOOGLE_AUTH_AVAILABLE = True
except ImportError:
    GOOGLE_AUTH_AVAILABLE = False
    
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed

User = get_user_model()


class GoogleOAuthSerializer(serializers.Serializer):
    """Serializer para login com Google"""
    token = serializers.CharField(required=True)
    
    def validate_token(self, token):
        """Valida o token do Google e retorna as informações do usuário"""
        if not GOOGLE_AUTH_AVAILABLE:
            raise AuthenticationFailed('Google OAuth não está disponível (dependências não instaladas)')
            
        if not settings.GOOGLE_OAUTH_CLIENT_ID:
            raise AuthenticationFailed('Google OAuth não está configurado')
            
        try:
            # Verifica o token ID com o Google
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                settings.GOOGLE_OAUTH_CLIENT_ID
            )
            
            # Verifica se o token é do nosso app
            if idinfo['aud'] != settings.GOOGLE_OAUTH_CLIENT_ID:
                raise AuthenticationFailed('Token inválido')
            
            # Extrai informações do usuário
            google_id = idinfo['sub']
            email = idinfo.get('email')
            name = idinfo.get('name', '')
            picture = idinfo.get('picture', '')
            
            if not email:
                raise AuthenticationFailed('Email não fornecido pelo Google')
            
            return {
                'google_id': google_id,
                'email': email,
                'name': name,
                'picture': picture,
            }
            
        except ValueError as e:
            raise AuthenticationFailed(f'Token inválido: {str(e)}')


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
    user = User.objects.create_user(
        email=email,
        name=google_data.get('name', email.split('@')[0]),
        google_id=google_id,
        google_email=email,
        profile_picture=google_data.get('picture', ''),
        is_active=True,
    )
    
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
