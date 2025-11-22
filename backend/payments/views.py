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
    Cria assinatura recorrente no Mercado Pago
    
    Body:
    {
        "plan_id": "basico" | "profissional" | "premium"
    }
    
    Response:
    {
        "init_point": "https://www.mercadopago.com.br/checkout/v1/redirect?...",
        "subscription_id": "2c9380848b9c0e8e018ba1b6e4b50f0d",
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
        
        # Busca o Plan ID do Mercado Pago
        mp_plan_id = settings.MERCADOPAGO_PLAN_IDS.get(plan_id)
        if not mp_plan_id:
            logger.error(f"Plan ID do MP não configurado para: {plan_id}")
            return Response(
                {'error': f'Plano {plan_id} não configurado no Mercado Pago. Configure a variável MP_PLAN_{plan_id.upper()} no ambiente.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        try:
            # Inicializa SDK do Mercado Pago
            sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
            
            # Dados do usuário e tenant
            user = request.user
            tenant = user.tenant
            
            # Cria assinatura recorrente (subscription)
            subscription_data = {
                "plan_id": mp_plan_id,
                "payer": {
                    "name": user.name,
                    "email": user.email
                },
                "back_url": f"{settings.FRONTEND_URL}/dashboard?payment=success",
                "external_reference": str(tenant.id),
                "metadata": {
                    "tenant_id": str(tenant.id),
                    "plan_id": plan_id,
                    "user_id": str(user.id),
                    "user_email": user.email
                },
                "auto_recurring": {
                    "frequency": 1,
                    "frequency_type": "months",
                    "transaction_amount": plan['price'],
                    "currency_id": "BRL"
                },
                "status": "authorized"
            }
            
            # Cria a assinatura no MP
            subscription_response = sdk.subscription().create(subscription_data)
            subscription = subscription_response["response"]
            
            # URL para checkout
            init_point = subscription.get('init_point') or f"https://www.mercadopago.com.br/subscriptions/checkout?preapproval_id={subscription['id']}"
            
            logger.info(f"Assinatura criada: {subscription['id']} para tenant {tenant.id} - plano {plan_id}")
            
            return Response({
                'init_point': init_point,
                'subscription_id': subscription['id'],
                'plan': {
                    'id': plan_id,
                    'title': plan['title'],
                    'price': plan['price'],
                    'features': plan['features']
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Erro ao criar assinatura MP: {str(e)}")
            return Response(
                {'error': 'Erro ao processar pagamento. Tente novamente.', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MercadoPagoWebhookView(APIView):
    """
    POST /api/webhooks/mercadopago/
    Recebe notificações de assinatura recorrente do Mercado Pago
    
    Tipos de notificação:
    - subscription_preapproval: Assinatura criada/atualizada
    - subscription_authorized_payment: Cobrança aprovada
    - subscription_preapproval_plan: Plano atualizado
    
    Ao receber pagamento aprovado:
    1. Atualiza subscription_status para ACTIVE
    2. Registra mp_subscription_id
    3. Limpa trial_ends_at
    4. Define plan_id
    
    Ao receber falha de pagamento:
    1. Atualiza subscription_status para PAST_DUE
    """
    permission_classes = [AllowAny]  # Webhook é público
    
    def post(self, request):
        try:
            # Log da notificação recebida
            logger.info(f"Webhook MP recebido: {request.data}")
            logger.info(f"Query params: {request.query_params}")
            
            # Mercado Pago envia type e data.id
            notification_type = request.query_params.get('type')
            data_id = request.query_params.get('data.id') or request.data.get('data', {}).get('id')
            
            if not data_id:
                logger.warning("Webhook sem data.id")
                return Response({'status': 'ignored'}, status=status.HTTP_200_OK)
            
            # Inicializa SDK
            sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
            
            # Processa baseado no tipo de notificação
            if notification_type == 'subscription_preapproval':
                # Assinatura criada/atualizada
                subscription_info = sdk.subscription().get(data_id)
                subscription = subscription_info["response"]
                
                logger.info(f"Subscription info: {subscription}")
                
                # Extrai dados
                external_reference = subscription.get('external_reference')
                status_sub = subscription.get('status')
                
                if not external_reference:
                    logger.error(f"Webhook sem external_reference")
                    return Response({'error': 'missing_reference'}, status=status.HTTP_400_BAD_REQUEST)
                
                # Busca o tenant
                try:
                    tenant = Tenant.objects.get(id=external_reference)
                except Tenant.DoesNotExist:
                    logger.error(f"Tenant {external_reference} não encontrado")
                    return Response({'error': 'tenant_not_found'}, status=status.HTTP_404_NOT_FOUND)
                
                # Atualiza status baseado no status da assinatura MP
                if status_sub == 'authorized':
                    tenant.subscription_status = 'ACTIVE'
                    tenant.mp_subscription_id = str(data_id)
                    tenant.trial_ends_at = None
                    logger.info(f"✅ Assinatura ATIVADA para tenant {external_reference}")
                elif status_sub == 'paused':
                    tenant.subscription_status = 'PAST_DUE'
                    logger.info(f"⚠️ Assinatura PAUSADA para tenant {external_reference}")
                elif status_sub == 'cancelled':
                    tenant.subscription_status = 'CANCELED'
                    logger.info(f"❌ Assinatura CANCELADA para tenant {external_reference}")
                
                tenant.save(update_fields=['subscription_status', 'mp_subscription_id', 'trial_ends_at'])
                
                return Response({
                    'status': 'success',
                    'tenant_id': str(external_reference),
                    'subscription_status': tenant.subscription_status
                }, status=status.HTTP_200_OK)
                
            elif notification_type == 'subscription_authorized_payment':
                # Cobrança recorrente aprovada
                payment_info = sdk.payment().get(data_id)
                payment = payment_info["response"]
                
                logger.info(f"Payment info: {payment}")
                
                # Verifica se o pagamento foi aprovado
                if payment['status'] == 'approved':
                    # Busca subscription_id do pagamento
                    preapproval_id = payment.get('preapproval_id')
                    external_reference = payment.get('external_reference')
                    
                    if external_reference:
                        try:
                            tenant = Tenant.objects.get(id=external_reference)
                            # Garante que está ACTIVE após pagamento bem-sucedido
                            if tenant.subscription_status != 'ACTIVE':
                                tenant.subscription_status = 'ACTIVE'
                                tenant.save(update_fields=['subscription_status'])
                                logger.info(f"✅ Pagamento aprovado - tenant {external_reference} reativado")
                        except Tenant.DoesNotExist:
                            logger.error(f"Tenant {external_reference} não encontrado")
                    
                    return Response({'status': 'payment_approved'}, status=status.HTTP_200_OK)
                else:
                    logger.info(f"Pagamento {data_id} status: {payment['status']}")
                    return Response({'status': 'payment_pending'}, status=status.HTTP_200_OK)
            
            else:
                # Outros tipos de notificação
                logger.info(f"Tipo de notificação não processado: {notification_type}")
                return Response({'status': 'ignored'}, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Erro no webhook MP: {str(e)}", exc_info=True)
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get(self, request):
        """Health check para o webhook"""
        return Response({'status': 'webhook_active'}, status=status.HTTP_200_OK)
