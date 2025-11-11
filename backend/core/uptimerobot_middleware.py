"""
Middleware para whitelist de IPs do UptimeRobot
Útil se você quiser restringir acesso a endpoints específicos apenas para UptimeRobot
"""

from django.http import HttpResponseForbidden
from django.conf import settings
from .uptimerobot_ips import UPTIMEROBOT_IPV4


class UptimeRobotWhitelistMiddleware:
    """
    Middleware que permite apenas IPs do UptimeRobot acessarem o sistema
    
    ⚠️ ATENÇÃO: Use com MUITO CUIDADO!
    - Isso bloqueará TODOS os acessos que não sejam do UptimeRobot
    - Incluindo você, seus usuários, o frontend, etc.
    
    USO RECOMENDADO:
    - Não use este middleware globalmente
    - Use apenas em endpoints específicos via decorator
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Pega o IP real do cliente (considerando proxies/load balancers)
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            client_ip = x_forwarded_for.split(',')[0].strip()
        else:
            client_ip = request.META.get('REMOTE_ADDR')
        
        # Lista de paths que devem ser acessíveis apenas pelo UptimeRobot
        # Customize conforme necessário
        protected_paths = [
            '/api/health/',  # Exemplo: endpoint de health check
            '/api/monitoring/uptimerobot/',  # Exemplo: endpoint específico para monitoring
        ]
        
        # Verifica se o path atual precisa de whitelist
        needs_whitelist = any(request.path.startswith(path) for path in protected_paths)
        
        if needs_whitelist:
            # Verifica se o IP está na whitelist
            if client_ip not in UPTIMEROBOT_IPV4:
                # Em desenvolvimento, pode permitir localhost
                if settings.DEBUG and client_ip in ['127.0.0.1', 'localhost', '::1']:
                    pass  # Permite em desenvolvimento
                else:
                    return HttpResponseForbidden(
                        f"Access denied. Your IP ({client_ip}) is not authorized to access this endpoint."
                    )
        
        response = self.get_response(request)
        return response


def require_uptimerobot_ip(view_func):
    """
    Decorator para proteger views específicas, permitindo apenas IPs do UptimeRobot
    
    Uso:
    ```python
    from core.uptimerobot_middleware import require_uptimerobot_ip
    
    @require_uptimerobot_ip
    def health_check(request):
        return JsonResponse({'status': 'ok'})
    ```
    """
    from functools import wraps
    
    @wraps(view_func)
    def wrapped_view(request, *args, **kwargs):
        # Pega o IP real
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            client_ip = x_forwarded_for.split(',')[0].strip()
        else:
            client_ip = request.META.get('REMOTE_ADDR')
        
        # Em desenvolvimento, permite localhost
        if settings.DEBUG and client_ip in ['127.0.0.1', 'localhost', '::1']:
            return view_func(request, *args, **kwargs)
        
        # Verifica whitelist
        if client_ip not in UPTIMEROBOT_IPV4:
            return HttpResponseForbidden(
                f"Access denied. Your IP ({client_ip}) is not authorized."
            )
        
        return view_func(request, *args, **kwargs)
    
    return wrapped_view
