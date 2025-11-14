"""
Performance optimization middleware
"""
from django.core.cache import cache
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_headers
import hashlib
import json


class CacheMiddleware:
    """
    Middleware para cache inteligente de responses GET
    """
    
    # Endpoints que devem ter cache (em segundos)
    CACHE_ENDPOINTS = {
        '/api/products/': 300,  # 5 minutos
        '/api/services/': 300,  # 5 minutos
        '/api/customers/': 180,  # 3 minutos
        '/api/pos/sales/': 60,  # 1 minuto
        '/api/financial/transactions/': 120,  # 2 minutos
    }
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Só faz cache de GET requests
        if request.method != 'GET':
            return self.get_response(request)
        
        # Verifica se é um endpoint cacheável
        cache_timeout = None
        for endpoint, timeout in self.CACHE_ENDPOINTS.items():
            if request.path.startswith(endpoint):
                cache_timeout = timeout
                break
        
        if not cache_timeout:
            return self.get_response(request)
        
        # Gera chave de cache baseada no path e query params
        cache_key = self._get_cache_key(request)
        
        # Tenta buscar do cache
        cached_response = cache.get(cache_key)
        if cached_response:
            return cached_response
        
        # Se não tem cache, executa request normal
        response = self.get_response(request)
        
        # Só faz cache de respostas 200 OK
        if response.status_code == 200:
            cache.set(cache_key, response, cache_timeout)
        
        return response
    
    def _get_cache_key(self, request):
        """Gera chave única para o cache"""
        # Inclui usuário, path e query params
        user_id = request.user.id if request.user.is_authenticated else 'anon'
        tenant_id = getattr(request.user, 'tenant_id', 'no_tenant')
        
        key_data = f"{user_id}:{tenant_id}:{request.path}:{request.GET.urlencode()}"
        return f"api_cache:{hashlib.md5(key_data.encode()).hexdigest()}"
