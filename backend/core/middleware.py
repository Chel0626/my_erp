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
