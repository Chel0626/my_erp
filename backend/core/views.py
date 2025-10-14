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

from .models import Tenant, User
from .serializers import (
    TenantSerializer,
    UserSerializer,
    SignUpSerializer,
    InviteUserSerializer,
    ChangePasswordSerializer
)
from .permissions import IsTenantAdmin, IsSameTenant, IsOwnerOrAdmin

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

    def get_queryset(self):
        """
        Retorna apenas usuários do mesmo tenant
        Implementa: BLOCO 3 - Regras de Segurança
        """
        if self.request.user.is_authenticated:
            return User.objects.filter(tenant=self.request.user.tenant)
        return User.objects.none()

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
