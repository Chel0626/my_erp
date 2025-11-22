"""
Views para Payments (Mercado Pago Integration)
Implementa endpoints de assinatura e webhook
"""
import mercadopago
import logging
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone

from .serializers import SubscribeSerializer, WebhookSerializer
from core.models import Tenant

logger = logging.getLogger(__name__)


# Configuração dos planos conforme imagem fornecida
PLANS = {
    'basico': {
        'title': 'Plano Básico',
        'description': 'Para o Barbeiro Solo',
        'price': 19.90,
        'features': [
            '1 Profissional',
            'Agenda Online',
            'Controle Financeiro',
            'Link de Agendamento'
        ]
    },
    'profissional': {
        'title': 'Plano Profissional',
        'description': 'Para Equipes que Querem Crescer',
        'price': 59.90,
        'features': [
            'Profissionais ILIMITADOS',
            'Clientes ILIMITADOS',
            'Tudo do Básico +',
            'Gestão de Comissões',
            'Relatórios Avançados',
            'Lembretes WhatsApp'
        ],
        'popular': True
    },
    'premium': {
        'title': 'Plano Premium',
        'description': 'Para quem tem Múltiplas Filiais',
        'price': 109.90,
        'features': [
            'Tudo do Profissional +',
            'Gestão de Múltiplas Lojas',
            'Dashboard Consolidado',
            'Suporte Prioritário'
        ]
    }
}


class SubscribeView(APIView):
    """
    POST /api/payments/subscribe/
    Cria preferência de pagamento no Mercado Pago
    
    Body:
    {
        "plan_id": "basico" | "profissional" | "premium"
    }
    
    Response:
    {
        "init_point": "https://www.mercadopago.com.br/checkout/v1/redirect?...",
        "preference_id": "123456789",
        "plan": {...}
    }
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = SubscribeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        plan_id = serializer.validated_data['plan_id']
        plan = PLANS.get(plan_id)
        
        if not plan:
            return Response(
                {'error': 'Plano inválido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Inicializa SDK do Mercado Pago
            sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
            
            # Dados do usuário e tenant
            user = request.user
            tenant = user.tenant
            
            # Cria preferência de pagamento
            preference_data = {
                "items": [
                    {
                        "title": plan['title'],
                        "description": plan['description'],
                        "quantity": 1,
                        "currency_id": "BRL",
                        "unit_price": plan['price']
                    }
                ],
                "payer": {
                    "name": user.name,
                    "email": user.email
                },
                "back_urls": {
                    "success": f"{settings.FRONTEND_URL}/dashboard?payment=success",
                    "failure": f"{settings.FRONTEND_URL}/plans?payment=failure",
                    "pending": f"{settings.FRONTEND_URL}/dashboard?payment=pending"
                },
                "auto_return": "approved",
                "external_reference": str(tenant.id),  # Referência ao tenant
                "metadata": {
                    "tenant_id": str(tenant.id),
                    "plan_id": plan_id,
                    "user_id": str(user.id),
                    "user_email": user.email
                },
                "notification_url": f"{settings.BACKEND_URL}/api/webhooks/mercadopago/",
                "statement_descriptor": "MYERP - Sistema de Gestão"
            }
            
            # Cria a preferência no MP
            preference_response = sdk.preference().create(preference_data)
            preference = preference_response["response"]
            
            logger.info(f"Preferência criada: {preference['id']} para tenant {tenant.id} - plano {plan_id}")
            
            return Response({
                'init_point': preference['init_point'],  # URL para redirecionar
                'preference_id': preference['id'],
                'plan': {
                    'id': plan_id,
                    'title': plan['title'],
                    'price': plan['price'],
                    'features': plan['features']
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Erro ao criar preferência MP: {str(e)}")
            return Response(
                {'error': 'Erro ao processar pagamento. Tente novamente.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MercadoPagoWebhookView(APIView):
    """
    POST /api/webhooks/mercadopago/
    Recebe notificações de pagamento do Mercado Pago
    
    Ao receber pagamento aprovado:
    1. Atualiza subscription_status para ACTIVE
    2. Registra mp_subscription_id
    3. Limpa trial_ends_at
    4. Define plan_id
    """
    permission_classes = [AllowAny]  # Webhook é público
    
    def post(self, request):
        try:
            # Log da notificação recebida
            logger.info(f"Webhook MP recebido: {request.data}")
            
            # Mercado Pago envia o ID do pagamento
            notification_type = request.query_params.get('type')
            data_id = request.query_params.get('data.id') or request.data.get('data', {}).get('id')
            
            if not data_id:
                logger.warning("Webhook sem data.id")
                return Response({'status': 'ignored'}, status=status.HTTP_200_OK)
            
            # Inicializa SDK
            sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
            
            # Busca informações do pagamento
            payment_info = sdk.payment().get(data_id)
            payment = payment_info["response"]
            
            logger.info(f"Payment info: {payment}")
            
            # Verifica se o pagamento foi aprovado
            if payment['status'] != 'approved':
                logger.info(f"Pagamento {data_id} ainda não aprovado: {payment['status']}")
                return Response({'status': 'pending'}, status=status.HTTP_200_OK)
            
            # Extrai tenant_id e plan_id dos metadata
            metadata = payment.get('metadata', {})
            tenant_id = metadata.get('tenant_id') or payment.get('external_reference')
            plan_id = metadata.get('plan_id')
            
            if not tenant_id or not plan_id:
                logger.error(f"Webhook sem tenant_id ou plan_id: {metadata}")
                return Response({'error': 'missing_data'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Busca o tenant
            try:
                tenant = Tenant.objects.get(id=tenant_id)
            except Tenant.DoesNotExist:
                logger.error(f"Tenant {tenant_id} não encontrado")
                return Response({'error': 'tenant_not_found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Atualiza o tenant com assinatura ativa
            tenant.subscription_status = 'ACTIVE'
            tenant.plan_id = plan_id
            tenant.mp_subscription_id = str(payment['id'])
            tenant.trial_ends_at = None  # Limpa o trial
            tenant.save(update_fields=[
                'subscription_status',
                'plan_id',
                'mp_subscription_id',
                'trial_ends_at'
            ])
            
            logger.info(f"✅ Tenant {tenant_id} atualizado para ACTIVE - plano {plan_id}")
            
            return Response({
                'status': 'success',
                'tenant_id': str(tenant_id),
                'plan_id': plan_id
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Erro no webhook MP: {str(e)}", exc_info=True)
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get(self, request):
        """Health check para o webhook"""
        return Response({'status': 'webhook_active'}, status=status.HTTP_200_OK)
