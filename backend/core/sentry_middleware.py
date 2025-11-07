"""
Middleware para adicionar contexto ao Sentry
"""
from sentry_sdk import set_tag, set_context, set_user


class SentryContextMiddleware:
    """
    Adiciona contexto útil para cada requisição no Sentry
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Adiciona tags para filtrar no Sentry
        if hasattr(request, 'user') and request.user.is_authenticated:
            # Informações do usuário
            set_user({
                'id': str(request.user.id),
                'email': request.user.email,
                'username': request.user.username,
            })
            
            # Tenant do usuário
            if hasattr(request.user, 'tenant'):
                set_tag('tenant_id', str(request.user.tenant.id))
                set_tag('tenant_name', request.user.tenant.name)
                
                set_context('tenant', {
                    'id': str(request.user.tenant.id),
                    'name': request.user.tenant.name,
                    'plan': request.user.tenant.plan,
                })
        
        # Informações da requisição
        set_tag('http_method', request.method)
        set_tag('endpoint', request.path)
        
        # API vs Admin
        if request.path.startswith('/api/'):
            set_tag('request_type', 'api')
        elif request.path.startswith('/admin/'):
            set_tag('request_type', 'admin')
        else:
            set_tag('request_type', 'other')
        
        # Módulo da API
        if request.path.startswith('/api/'):
            module = request.path.split('/')[2] if len(request.path.split('/')) > 2 else 'unknown'
            set_tag('api_module', module)
        
        response = self.get_response(request)
        
        # Adiciona status code
        set_tag('http_status', response.status_code)
        
        return response
