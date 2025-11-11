"""
Testes para System Health Monitoring
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from core.models import User, Tenant


class SystemHealthTestCase(TestCase):
    """Testes para endpoints de saúde do sistema"""
    
    def setUp(self):
        """Configuração inicial dos testes"""
        self.client = APIClient()
        
        # Cria um tenant para testes
        self.tenant = Tenant.objects.create(
            name='Test Tenant',
            subdomain='test',
            is_active=True
        )
        
        # Cria um superadmin
        self.superadmin = User.objects.create_user(
            username='superadmin',
            email='superadmin@test.com',
            password='test123',
            role='superadmin',
            tenant=self.tenant
        )
        
        # Cria um usuário normal
        self.normal_user = User.objects.create_user(
            username='user',
            email='user@test.com',
            password='test123',
            role='admin',
            tenant=self.tenant
        )
    
    def test_sentry_health_authenticated(self):
        """Testa endpoint de saúde do Sentry com usuário autenticado"""
        self.client.force_authenticate(user=self.superadmin)
        response = self.client.get('/api/superadmin/system-health/sentry/health/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('crash_free_users_percentage', response.data)
        self.assertIn('new_issues_count', response.data)
        self.assertIn('recurring_issues_count', response.data)
    
    def test_sentry_performance_authenticated(self):
        """Testa endpoint de performance do Sentry"""
        self.client.force_authenticate(user=self.superadmin)
        response = self.client.get('/api/superadmin/system-health/sentry/performance/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('top_slow_transactions', response.data)
        self.assertIn('avg_response_time_ms', response.data)
        self.assertIn('latency_history', response.data)
    
    def test_redis_metrics_authenticated(self):
        """Testa endpoint de métricas do Redis"""
        self.client.force_authenticate(user=self.superadmin)
        response = self.client.get('/api/superadmin/system-health/redis/metrics/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('hit_ratio_percentage', response.data)
        self.assertIn('used_memory_mb', response.data)
        self.assertIn('total_keys', response.data)
    
    def test_redis_flush_superadmin_only(self):
        """Testa que apenas superadmin pode limpar o cache"""
        # Tenta com usuário normal
        self.client.force_authenticate(user=self.normal_user)
        response = self.client.post('/api/superadmin/system-health/redis/flushall/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Tenta com superadmin
        self.client.force_authenticate(user=self.superadmin)
        response = self.client.post('/api/superadmin/system-health/redis/flushall/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_redis_delete_key(self):
        """Testa deleção de chave específica"""
        self.client.force_authenticate(user=self.superadmin)
        
        # Sem enviar key
        response = self.client.post('/api/superadmin/system-health/redis/del_key/', {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Com key
        response = self.client.post('/api/superadmin/system-health/redis/del_key/', {
            'key': 'test_key'
        })
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND])
    
    def test_redis_inspect_key(self):
        """Testa inspeção de chave"""
        self.client.force_authenticate(user=self.superadmin)
        
        response = self.client.post('/api/superadmin/system-health/redis/inspect_key/', {
            'key': 'test_key'
        })
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND])
    
    def test_infra_metrics(self):
        """Testa endpoint de métricas de infraestrutura"""
        self.client.force_authenticate(user=self.superadmin)
        response = self.client.get('/api/superadmin/system-health/infra/metrics/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('cpu_usage_percentage', response.data)
        self.assertIn('memory_usage_percentage', response.data)
        self.assertIn('cpu_history', response.data)
        self.assertIn('memory_history', response.data)
    
    def test_uptime_status(self):
        """Testa endpoint de status de uptime"""
        self.client.force_authenticate(user=self.superadmin)
        response = self.client.get('/api/superadmin/system-health/uptime/status/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('status', response.data)
        self.assertIn('uptime_percentage', response.data)
    
    def test_online_users(self):
        """Testa endpoint de usuários online"""
        self.client.force_authenticate(user=self.superadmin)
        response = self.client.get('/api/superadmin/system-health/users/online/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('active_users', response.data)
        self.assertIn('users_history', response.data)
    
    def test_unauthenticated_access(self):
        """Testa que endpoints requerem autenticação"""
        endpoints = [
            '/api/superadmin/system-health/sentry/health/',
            '/api/superadmin/system-health/redis/metrics/',
            '/api/superadmin/system-health/infra/metrics/',
        ]
        
        for endpoint in endpoints:
            response = self.client.get(endpoint)
            self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
