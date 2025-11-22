"""
Middleware Multi-Tenant
Implementa BLOCO 3: Regras de Segurança (Isolamento de Dados)
"""
from threading import local

# Thread-local storage para armazenar o tenant atual
_thread_locals = local()


def get_current_tenant():
    """Retorna o tenant atual armazenado no thread-local"""
    return getattr(_thread_locals, 'tenant', None)


def set_current_tenant(tenant):
    """Define o tenant atual no thread-local"""
    _thread_locals.tenant = tenant


def clear_current_tenant():
    """Limpa o tenant atual do thread-local"""
    if hasattr(_thread_locals, 'tenant'):
        delattr(_thread_locals, 'tenant')


class TenantMiddleware:
    """
    Middleware que captura o tenant do usuário autenticado
    e disponibiliza para toda a aplicação
    
    Implementa a Regra Universal de Acesso a Dados:
    "Um usuário só pode ver/editar dados que pertencem ao seu próprio Tenant."
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Limpa o tenant antes de processar a requisição
        clear_current_tenant()

        # Se o usuário está autenticado e tem tenant, define no thread-local
        if hasattr(request, 'user') and request.user.is_authenticated:
            if hasattr(request.user, 'tenant') and request.user.tenant:
                set_current_tenant(request.user.tenant)
                # Também adiciona ao request para fácil acesso
                request.tenant = request.user.tenant

        response = self.get_response(request)

        # Limpa o tenant após processar a requisição
        clear_current_tenant()

        return response

    def process_exception(self, request, exception):
        """Limpa o tenant em caso de exceção"""
        clear_current_tenant()
        return None


class SubscriptionMiddleware:
    """
    Middleware que verifica o status da assinatura do tenant
    e bloqueia acesso se trial expirado ou pagamento atrasado
    
    Implementa o Trial Guard conforme Blueprint v2:
    - ACTIVE: Acesso liberado
    - TRIAL: Verifica se não expirou (trial_ends_at)
    - PAST_DUE: Bloqueia acesso
    - CANCELED: Bloqueia acesso
    
    Retorna 402 Payment Required quando bloqueado
    """
    
    # Rotas que NÃO precisam de verificação (públicas ou de pagamento)
    EXEMPT_PATHS = [
        '/api/auth/signup/',
        '/api/auth/login/',
        '/api/auth/google/',
        '/api/auth/token/',
        '/api/auth/token/refresh/',
        '/api/payments/',
        '/api/webhooks/',
        '/admin/',
        '/static/',
        '/media/',
    ]
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Verifica se a rota está isenta
        if any(request.path.startswith(path) for path in self.EXEMPT_PATHS):
            return self.get_response(request)
        
        # Verifica se usuário está autenticado e tem tenant
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            return self.get_response(request)
        
        if not hasattr(request.user, 'tenant') or not request.user.tenant:
            return self.get_response(request)
        
        tenant = request.user.tenant
        
        # Verifica status da assinatura
        if tenant.subscription_status == 'ACTIVE':
            # Assinatura ativa - acesso liberado
            return self.get_response(request)
        
        elif tenant.subscription_status == 'TRIAL':
            # Trial - verifica se não expirou
            if tenant.is_trial_active():
                return self.get_response(request)
            else:
                # Trial expirado
                from rest_framework.response import Response
                from rest_framework import status
                return Response({
                    'error': 'trial_expired',
                    'message': 'Seu período de teste acabou! Para continuar usando o sistema, assine um de nossos planos.',
                    'trial_ends_at': tenant.trial_ends_at,
                    'subscription_status': tenant.subscription_status
                }, status=status.HTTP_402_PAYMENT_REQUIRED)
        
        elif tenant.subscription_status in ['PAST_DUE', 'CANCELED']:
            # Pagamento atrasado ou cancelado - bloqueia acesso
            from rest_framework.response import Response
            from rest_framework import status
            
            message = 'Pagamento em atraso. Atualize seus dados de pagamento para continuar.'
            if tenant.subscription_status == 'CANCELED':
                message = 'Sua assinatura foi cancelada. Reative para continuar usando o sistema.'
            
            return Response({
                'error': 'subscription_blocked',
                'message': message,
                'subscription_status': tenant.subscription_status
            }, status=status.HTTP_402_PAYMENT_REQUIRED)
        
        # Fallback - permite acesso se status desconhecido
        return self.get_response(request)
