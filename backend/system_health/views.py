"""
Views para monitoramento de saúde do sistema
Integra com Sentry, Redis, Railway e tracking de usuários
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.core.cache import cache
from django.conf import settings
from datetime import datetime, timedelta
import sentry_sdk
import redis
import json
import os


class SentryHealthView(APIView):
    """
    GET /superadmin/system-health/sentry/health/
    Retorna métricas de saúde do código do Sentry
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Busca métricas do Sentry via SDK ou API
            # Por enquanto, retorna dados mock (você vai integrar com Sentry API)
            
            # Para dados reais, você precisaria usar a Sentry API:
            # https://sentry.io/api/0/organizations/{org}/stats_v2/
            
            data = {
                'crash_free_users_percentage': 99.5,
                'new_issues_count': 2,
                'recurring_issues_count': 5,
                'sentry_url': settings.SENTRY_DSN.split('@')[1] if hasattr(settings, 'SENTRY_DSN') else 'https://sentry.io'
            }
            
            return Response(data)
        except Exception as e:
            sentry_sdk.capture_exception(e)
            return Response({
                'error': str(e),
                'crash_free_users_percentage': 0,
                'new_issues_count': 0,
                'recurring_issues_count': 0,
                'sentry_url': ''
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SentryPerformanceView(APIView):
    """
    GET /superadmin/system-health/sentry/performance/
    Retorna métricas de performance do Sentry APM
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Gera histórico de latência (última hora)
            now = datetime.now()
            latency_history = []
            for i in range(12):  # 12 pontos (5 minutos cada)
                timestamp = now - timedelta(minutes=i*5)
                latency_history.insert(0, {
                    'timestamp': timestamp.isoformat(),
                    'avg_ms': 150 + (i * 5)  # Mock data
                })
            
            data = {
                'top_slow_transactions': [
                    {
                        'endpoint': '/api/scheduling/appointments/',
                        'avg_duration_ms': 345.2,
                        'p95_duration_ms': 523.8,
                        'p99_duration_ms': 891.5
                    },
                    {
                        'endpoint': '/api/financial/transactions/',
                        'avg_duration_ms': 298.1,
                        'p95_duration_ms': 445.3,
                        'p99_duration_ms': 678.9
                    },
                    {
                        'endpoint': '/api/customers/customers/',
                        'avg_duration_ms': 187.4,
                        'p95_duration_ms': 289.7,
                        'p99_duration_ms': 412.3
                    },
                ],
                'avg_response_time_ms': 156.3,
                'error_rate_percentage': 0.5,
                'latency_history': latency_history
            }
            
            return Response(data)
        except Exception as e:
            sentry_sdk.capture_exception(e)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RedisMetricsView(APIView):
    """
    GET /superadmin/system-health/redis/metrics/
    Retorna métricas do Redis
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Conecta no Redis para pegar INFO
            redis_client = redis.from_url(
                settings.CACHES['default']['LOCATION'],
                decode_responses=True
            )
            
            info = redis_client.info()
            
            # Extrai métricas importantes
            keyspace_hits = info.get('keyspace_hits', 0)
            keyspace_misses = info.get('keyspace_misses', 0)
            total_requests = keyspace_hits + keyspace_misses
            hit_ratio = (keyspace_hits / total_requests * 100) if total_requests > 0 else 0
            
            used_memory = info.get('used_memory', 0)
            maxmemory = info.get('maxmemory', 0)
            
            # Se maxmemory não está configurado, estima baseado no sistema
            if maxmemory == 0:
                maxmemory = 512 * 1024 * 1024  # 512MB default
            
            memory_usage_percentage = (used_memory / maxmemory * 100) if maxmemory > 0 else 0
            
            # Total de chaves (soma de todos os DBs)
            total_keys = 0
            for key in info.keys():
                if key.startswith('db'):
                    db_info = info[key]
                    total_keys += db_info.get('keys', 0)
            
            data = {
                'hit_ratio_percentage': round(hit_ratio, 2),
                'used_memory_mb': round(used_memory / (1024 * 1024), 2),
                'max_memory_mb': round(maxmemory / (1024 * 1024), 2),
                'memory_usage_percentage': round(memory_usage_percentage, 2),
                'connected_clients': info.get('connected_clients', 0),
                'total_keys': total_keys,
                'keyspace_hits': keyspace_hits,
                'keyspace_misses': keyspace_misses,
            }
            
            return Response(data)
        except Exception as e:
            sentry_sdk.capture_exception(e)
            return Response({
                'error': str(e),
                'hit_ratio_percentage': 0,
                'used_memory_mb': 0,
                'max_memory_mb': 0,
                'memory_usage_percentage': 0,
                'connected_clients': 0,
                'total_keys': 0,
                'keyspace_hits': 0,
                'keyspace_misses': 0,
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RedisFlushAllView(APIView):
    """
    POST /superadmin/system-health/redis/flushall/
    Limpa TODAS as chaves do Redis (CUIDADO!)
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Verifica se é superadmin
        if request.user.role != 'superadmin':
            return Response(
                {'error': 'Apenas superadmins podem executar esta ação'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            redis_client = redis.from_url(
                settings.CACHES['default']['LOCATION'],
                decode_responses=True
            )
            
            redis_client.flushall()
            
            return Response({
                'message': 'Cache limpo com sucesso',
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            sentry_sdk.capture_exception(e)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RedisDeleteKeyView(APIView):
    """
    POST /superadmin/system-health/redis/del_key/
    Deleta uma chave específica do Redis
    Body: {"key": "nome_da_chave"}
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'superadmin':
            return Response(
                {'error': 'Apenas superadmins podem executar esta ação'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        key = request.data.get('key')
        if not key:
            return Response(
                {'error': 'Campo "key" é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            redis_client = redis.from_url(
                settings.CACHES['default']['LOCATION'],
                decode_responses=True
            )
            
            result = redis_client.delete(key)
            
            if result > 0:
                return Response({
                    'message': f'Chave "{key}" deletada com sucesso',
                    'deleted': True
                })
            else:
                return Response({
                    'message': f'Chave "{key}" não encontrada',
                    'deleted': False
                })
        except Exception as e:
            sentry_sdk.capture_exception(e)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RedisInspectKeyView(APIView):
    """
    POST /superadmin/system-health/redis/inspect_key/
    Inspeciona o conteúdo de uma chave do Redis
    Body: {"key": "nome_da_chave"}
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'superadmin':
            return Response(
                {'error': 'Apenas superadmins podem executar esta ação'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        key = request.data.get('key')
        if not key:
            return Response(
                {'error': 'Campo "key" é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            redis_client = redis.from_url(
                settings.CACHES['default']['LOCATION'],
                decode_responses=True
            )
            
            # Verifica se a chave existe
            if not redis_client.exists(key):
                return Response({
                    'error': f'Chave "{key}" não encontrada',
                    'exists': False
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Pega o tipo da chave
            key_type = redis_client.type(key)
            
            # Pega o valor baseado no tipo
            if key_type == 'string':
                value = redis_client.get(key)
                # Tenta parsear como JSON
                try:
                    value = json.loads(value)
                except:
                    pass
            elif key_type == 'list':
                value = redis_client.lrange(key, 0, -1)
            elif key_type == 'set':
                value = list(redis_client.smembers(key))
            elif key_type == 'zset':
                value = redis_client.zrange(key, 0, -1, withscores=True)
            elif key_type == 'hash':
                value = redis_client.hgetall(key)
            else:
                value = f'Tipo não suportado: {key_type}'
            
            # TTL
            ttl = redis_client.ttl(key)
            
            return Response({
                'key': key,
                'type': key_type,
                'value': value,
                'ttl': ttl if ttl > 0 else None,
                'exists': True
            })
        except Exception as e:
            sentry_sdk.capture_exception(e)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class InfraMetricsView(APIView):
    """
    GET /superadmin/system-health/infra/metrics/
    Retorna métricas de infraestrutura (CPU, RAM)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Mock data - você pode integrar com Railway API ou AWS CloudWatch
            # Railway API: https://railway.app/docs/develop/api-reference
            # AWS CloudWatch: boto3.client('cloudwatch').get_metric_statistics()
            
            now = datetime.now()
            
            # Histórico de CPU (última hora)
            cpu_history = []
            for i in range(12):
                timestamp = now - timedelta(minutes=i*5)
                cpu_history.insert(0, {
                    'timestamp': timestamp.isoformat(),
                    'percentage': 40 + (i % 3) * 5  # Mock: 40-50%
                })
            
            # Histórico de Memória (última hora)
            memory_history = []
            for i in range(12):
                timestamp = now - timedelta(minutes=i*5)
                memory_history.insert(0, {
                    'timestamp': timestamp.isoformat(),
                    'percentage': 60 + (i % 4) * 3  # Mock: 60-69%
                })
            
            data = {
                'cpu_usage_percentage': 45.3,
                'memory_usage_percentage': 62.8,
                'cpu_history': cpu_history,
                'memory_history': memory_history,
                'provider': os.environ.get('RAILWAY_ENVIRONMENT', 'Railway')
            }
            
            return Response(data)
        except Exception as e:
            sentry_sdk.capture_exception(e)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UptimeStatusView(APIView):
    """
    GET /superadmin/system-health/uptime/status/
    Retorna status de disponibilidade do sistema
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Mock data - você pode integrar com UptimeRobot API
            # https://uptimerobot.com/api/
            
            data = {
                'status': 'up',
                'uptime_percentage': 99.98,
                'response_time_ms': 156,
                'last_check': datetime.now().isoformat()
            }
            
            return Response(data)
        except Exception as e:
            sentry_sdk.capture_exception(e)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OnlineUsersView(APIView):
    """
    GET /superadmin/system-health/users/online/
    Retorna contagem de usuários online
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Conta usuários ativos baseado em chaves do Redis
            # Formato esperado: "user_online:{user_id}" com TTL de 5 minutos
            
            redis_client = redis.from_url(
                settings.CACHES['default']['LOCATION'],
                decode_responses=True
            )
            
            # Busca todas as chaves de usuários online
            online_keys = redis_client.keys('user_online:*')
            active_users = len(online_keys)
            
            # Histórico de usuários (última hora)
            # Por enquanto mock - você pode salvar snapshots no Redis a cada 5min
            now = datetime.now()
            users_history = []
            for i in range(12):
                timestamp = now - timedelta(minutes=i*5)
                # Mock: varia entre 15-30 usuários
                count = active_users + (i % 5) - 2
                users_history.insert(0, {
                    'timestamp': timestamp.isoformat(),
                    'count': max(0, count)
                })
            
            data = {
                'active_users': active_users,
                'users_history': users_history
            }
            
            return Response(data)
        except Exception as e:
            sentry_sdk.capture_exception(e)
            return Response({
                'active_users': 0,
                'users_history': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
