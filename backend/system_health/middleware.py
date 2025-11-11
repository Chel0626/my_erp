"""
Middleware para rastrear usuários online
Atualiza uma chave no Redis com TTL de 5 minutos para cada usuário autenticado
"""

from django.core.cache import cache
from django.utils.deprecation import MiddlewareMixin


class OnlineUsersMiddleware(MiddlewareMixin):
    """
    Middleware que marca usuários autenticados como online no Redis
    A chave expira automaticamente após 5 minutos de inatividade
    """
    
    def process_request(self, request):
        # Só rastreia usuários autenticados
        if request.user and request.user.is_authenticated:
            # Cria uma chave única para o usuário
            key = f'user_online:{request.user.id}'
            
            # Define a chave no Redis com TTL de 5 minutos (300 segundos)
            # Cada requisição renova o TTL
            cache.set(key, {
                'user_id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'tenant': getattr(request.user, 'tenant_id', None),
                'last_seen': str(request.path),
            }, timeout=300)  # 5 minutos
        
        return None
