"""
Health Check e Sentry Test Views
Endpoints para monitoramento do sistema
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db import connection
from django.core.cache import cache
from django.conf import settings
import time
import sentry_sdk


@api_view(['GET'])
@permission_classes([AllowAny])  # Público para monitoring externo (Uptime Robot, etc)
def health_check(request):
    """
    Verifica a saúde de todos os serviços do sistema
    Retorna status 200 se tudo OK, 503 se houver problemas críticos
    """
    health = {
        'status': 'healthy',
        'timestamp': time.time(),
        'services': {},
        'environment': settings.SENTRY_ENVIRONMENT if hasattr(settings, 'SENTRY_ENVIRONMENT') else 'unknown',
    }
    
    all_healthy = True
    
    # 1. Database Check
    try:
        start = time.time()
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        response_time = (time.time() - start) * 1000
        
        health['services']['database'] = {
            'status': 'healthy',
            'response_time_ms': round(response_time, 2),
            'type': 'PostgreSQL'
        }
    except Exception as e:
        all_healthy = False
        health['status'] = 'unhealthy'
        health['services']['database'] = {
            'status': 'unhealthy',
            'error': str(e),
            'type': 'PostgreSQL'
        }
        # Reporta ao Sentry
        sentry_sdk.capture_exception(e)
    
    # 2. Cache/Redis Check
    try:
        start = time.time()
        test_key = 'health_check_test'
        test_value = f'test_{int(time.time())}'
        
        cache.set(test_key, test_value, timeout=10)
        cached_value = cache.get(test_key)
        response_time = (time.time() - start) * 1000
        
        if cached_value == test_value:
            health['services']['cache'] = {
                'status': 'healthy',
                'response_time_ms': round(response_time, 2),
                'type': 'Redis/LocMem'
            }
        else:
            health['services']['cache'] = {
                'status': 'degraded',
                'error': 'Cache read/write mismatch',
                'type': 'Redis/LocMem'
            }
    except Exception as e:
        # Cache não é crítico, então não marca como unhealthy
        health['services']['cache'] = {
            'status': 'not_configured',
            'note': 'Cache not available (not critical for operation)',
            'error': str(e)
        }
    
    # 3. Sentry Check
    sentry_configured = bool(settings.SENTRY_DSN) if hasattr(settings, 'SENTRY_DSN') else False
    health['services']['sentry'] = {
        'status': 'configured' if sentry_configured else 'not_configured',
        'dsn_set': sentry_configured,
        'environment': settings.SENTRY_ENVIRONMENT if hasattr(settings, 'SENTRY_ENVIRONMENT') else 'unknown'
    }
    
    # 4. Email Check (apenas verifica se está configurado)
    email_configured = bool(settings.EMAIL_HOST) if hasattr(settings, 'EMAIL_HOST') else False
    health['services']['email'] = {
        'status': 'configured' if email_configured else 'not_configured',
        'host': settings.EMAIL_HOST if email_configured else None,
    }
    
    # Status HTTP baseado na saúde
    status_code = 200 if all_healthy else 503
    
    return Response(health, status=status_code)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sentry_test_error(request):
    """
    Endpoint para testar se o Sentry está capturando erros
    Acesse: /api/core/sentry-test/
    """
    # Captura informações do usuário para contexto
    sentry_sdk.set_user({
        "id": request.user.id,
        "email": request.user.email,
        "username": request.user.name,
    })
    
    # Adiciona contexto extra
    sentry_sdk.set_context("test_info", {
        "test_type": "manual",
        "endpoint": "/api/core/sentry-test/",
        "method": request.method,
    })
    
    # Gera erro proposital
    raise Exception('🧪 Teste de Sentry - Este erro foi gerado propositalmente para testar o monitoramento!')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sentry_test_warning(request):
    """
    Endpoint para testar captura de mensagens (não-erros)
    Acesse: /api/core/sentry-test-warning/
    """
    sentry_sdk.capture_message(
        '⚠️ Teste de Warning - Esta é uma mensagem de aviso para testar o Sentry',
        level='warning'
    )
    
    return Response({
        'message': 'Warning enviado ao Sentry! Verifique o dashboard.',
        'user': request.user.email,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sentry_test_custom_event(request):
    """
    Endpoint para testar evento customizado
    Acesse: POST /api/core/sentry-test-event/
    Body: {"event_name": "test", "data": {...}}
    """
    event_name = request.data.get('event_name', 'custom_test_event')
    event_data = request.data.get('data', {})
    
    # Envia evento customizado
    with sentry_sdk.push_scope() as scope:
        scope.set_context("custom_event", {
            "name": event_name,
            "data": event_data,
            "user": request.user.email,
        })
        sentry_sdk.capture_message(
            f'📊 Evento customizado: {event_name}',
            level='info'
        )
    
    return Response({
        'message': f'Evento "{event_name}" enviado ao Sentry!',
        'data': event_data,
    })
