"""
Views do núcleo Multi-Tenant
Implementa os workflows do BLOCO 2
"""
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from django.core.exceptions import ValidationError as DjangoValidationError

from .models import Tenant, User
from .serializers import (
    TenantSerializer,
    UserSerializer,
    SignUpSerializer,
    InviteUserSerializer,
    ChangePasswordSerializer,
    GoogleOAuthLoginSerializer,
    TenantCertificateSerializer,
)
from .permissions import IsTenantAdmin, IsSameTenant, IsOwnerOrAdmin
from .oauth import get_or_create_google_user
from .certificate import CertificateManager

User = get_user_model()


class SignUpView(generics.CreateAPIView):
    """
    API endpoint para cadastro de novo cliente (Sign Up)
    Implementa: BLOCO 2 - Workflow: Novo Cliente - Sign Up
    
    POST /api/auth/signup/
    {
        "email": "dono@barbearia.com",
        "password": "senha123",
        "name": "João Silva",
        "company_name": "Barbearia do João"
    }
    """
    serializer_class = SignUpSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Cria tenant e usuário
        result = serializer.save()
        user = result['user']
        tenant = result['tenant']

        # AÇÃO 4: Gerar tokens JWT
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'tenant': TenantSerializer(tenant).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciamento de usuários
    Implementa filtros automáticos por tenant
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsSameTenant]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        """
        Retorna apenas usuários do mesmo tenant
        Implementa: BLOCO 3 - Regras de Segurança
        """
        if self.request.user.is_authenticated:
            return User.objects.filter(tenant=self.request.user.tenant)
        return User.objects.none()

    def create(self, request, *args, **kwargs):
        """
        Cria novo usuário no tenant do usuário autenticado
        
        POST /api/core/users/
        {
            "email": "novo@example.com",
            "name": "Novo Usuário",
            "password": "senha123",
            "phone": "11999999999"
        }
        """
        serializer = InviteUserSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        
        return Response({
            'user': UserSerializer(result['user']).data,
            'message': 'Usuário criado com sucesso!'
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsTenantAdmin])
    def invite(self, request):
        """
        Convida um novo membro para a equipe
        Implementa: BLOCO 2 - Workflow: Convidar Membro da Equipe
        
        POST /api/users/invite/
        {
            "email": "barbeiro@example.com",
            "name": "Pedro Santos",
            "role": "barbeiro"
        }
        """
        serializer = InviteUserSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        result = serializer.save()

        return Response({
            'user': UserSerializer(result['user']).data,
            'temporary_password': result['temporary_password'],
            'message': 'Usuário convidado com sucesso! Senha temporária gerada.'
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """
        Retorna os dados do usuário autenticado
        
        GET /api/users/me/
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request):
        """
        Altera a senha do usuário autenticado
        
        POST /api/users/change_password/
        {
            "old_password": "senha_antiga",
            "new_password": "senha_nova"
        }
        """
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            'message': 'Senha alterada com sucesso!'
        }, status=status.HTTP_200_OK)


class TenantViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para visualização de dados do tenant
    Apenas leitura
    """
    serializer_class = TenantSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Retorna apenas o tenant do usuário autenticado"""
        if self.request.user.is_authenticated and self.request.user.tenant:
            return Tenant.objects.filter(id=self.request.user.tenant.id)
        return Tenant.objects.none()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_tenant(self, request):
        """
        Retorna os dados do tenant do usuário autenticado
        
        GET /api/tenants/my_tenant/
        """
        if request.user.tenant:
            serializer = self.get_serializer(request.user.tenant)
            return Response(serializer.data)
        return Response({
            'message': 'Você não está associado a nenhuma empresa.'
        }, status=status.HTTP_404_NOT_FOUND)


class PublicTokenObtainPairView(TokenObtainPairView):
    """
    Permite que qualquer usuário obtenha um par de tokens (access e refresh)
    usando apenas o email e a senha.
    """
    permission_classes = [AllowAny]


class GoogleOAuthLoginView(generics.GenericAPIView):
    """
    API endpoint para login/cadastro com Google OAuth
    
    POST /api/auth/google/
    {
        "token": "google_id_token_aqui"
    }
    """
    serializer_class = GoogleOAuthLoginSerializer
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        google_data = serializer.validated_data
        
        # Obtém ou cria usuário
        user = get_or_create_google_user(google_data)
        
        # Gera tokens JWT
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tenant': TenantSerializer(user.tenant).data if user.tenant else None,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'is_new_user': not user.tenant,  # Se não tem tenant, é novo usuário
        }, status=status.HTTP_200_OK)


class TenantCertificateView(generics.GenericAPIView):
    """
    API endpoint para gerenciamento de certificado digital do tenant
    
    POST /api/tenants/certificate/upload/
    PUT /api/tenants/certificate/update/
    DELETE /api/tenants/certificate/remove/
    GET /api/tenants/certificate/info/
    """
    permission_classes = [IsAuthenticated, IsTenantAdmin]
    serializer_class = TenantCertificateSerializer
    
    def get_queryset(self):
        return Tenant.objects.filter(id=self.request.user.tenant.id)
    
    def post(self, request):
        """Upload de certificado digital"""
        if not request.user.tenant:
            return Response(
                {'error': 'Você não está associado a nenhuma empresa'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        certificate_file = serializer.validated_data['certificate_file']
        password = serializer.validated_data['password']
        
        try:
            cert_manager = CertificateManager(request.user.tenant)
            cert_info = cert_manager.install_certificate(certificate_file, password)
            
            return Response({
                'message': 'Certificado instalado com sucesso',
                'certificate': cert_info,
            }, status=status.HTTP_200_OK)
            
        except DjangoValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def delete(self, request):
        """Remove certificado digital"""
        if not request.user.tenant:
            return Response(
                {'error': 'Você não está associado a nenhuma empresa'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cert_manager = CertificateManager(request.user.tenant)
        cert_manager.remove_certificate()
        
        return Response({
            'message': 'Certificado removido com sucesso'
        }, status=status.HTTP_200_OK)
    
    def get(self, request):
        """Informações do certificado instalado"""
        if not request.user.tenant:
            return Response(
                {'error': 'Você não está associado a nenhuma empresa'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cert_manager = CertificateManager(request.user.tenant)
        cert_info = cert_manager.get_certificate_info()
        
        if not cert_info:
            return Response({
                'message': 'Nenhum certificado instalado'
            }, status=status.HTTP_404_NOT_FOUND)
        
        return Response(cert_info, status=status.HTTP_200_OK)
