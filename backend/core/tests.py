"""
Testes completos do módulo Core (Autenticação, Usuários, Tenants)
"""
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from core.models import User, Tenant

class AuthenticationTestCase(APITestCase):
    """Testa sistema de autenticação"""
    
    def setUp(self):
        """Configura dados de teste"""
        self.client = APIClient()
        self.tenant = Tenant.objects.create(
            company_name="Test Barbershop",
            email="test@barbershop.com",
            phone="11999999999"
        )
        self.user = User.objects.create_user(
            email="testuser@test.com",
            password="testpass123",
            name="Test User",
            tenant=self.tenant,
            role="admin"
        )
    
    def test_user_login(self):
        """Testa login de usuário"""
        url = reverse('login')
        data = {
            'email': 'testuser@test.com',
            'password': 'testpass123'
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
    
    def test_login_invalid_credentials(self):
        """Testa login com credenciais inválidas"""
        url = reverse('login')
        data = {
            'email': 'testuser@test.com',
            'password': 'wrongpassword'
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_get_current_user(self):
        """Testa obtenção de dados do usuário autenticado"""
        # Login
        url = reverse('login')
        data = {
            'email': 'testuser@test.com',
            'password': 'testpass123'
        }
        response = self.client.post(url, data, format='json')
        token = response.data['access']
        
        # Get user info
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        url = reverse('current-user')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'testuser@test.com')
        self.assertEqual(response.data['name'], 'Test User')
    
    def test_unauthorized_access(self):
        """Testa acesso sem autenticação"""
        url = reverse('current-user')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class TenantTestCase(APITestCase):
    """Testa gestão de tenants"""
    
    def setUp(self):
        """Configura dados de teste"""
        self.client = APIClient()
        self.tenant = Tenant.objects.create(
            company_name="Test Barbershop",
            email="test@barbershop.com",
            phone="11999999999"
        )
        self.user = User.objects.create_user(
            email="admin@test.com",
            password="admin123",
            name="Admin User",
            tenant=self.tenant,
            role="admin"
        )
        
        # Login
        url = reverse('login')
        response = self.client.post(url, {
            'email': 'admin@test.com',
            'password': 'admin123'
        }, format='json')
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
    
    def test_get_my_tenant(self):
        """Testa obtenção de dados do tenant"""
        url = reverse('my-tenant')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['company_name'], 'Test Barbershop')
    
    def test_update_tenant(self):
        """Testa atualização de dados do tenant"""
        url = reverse('my-tenant')
        data = {
            'company_name': 'Updated Barbershop',
            'phone': '11888888888'
        }
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['company_name'], 'Updated Barbershop')

class UserManagementTestCase(APITestCase):
    """Testa gestão de usuários"""
    
    def setUp(self):
        """Configura dados de teste"""
        self.client = APIClient()
        self.tenant = Tenant.objects.create(
            company_name="Test Barbershop",
            email="test@barbershop.com",
            phone="11999999999"
        )
        self.admin = User.objects.create_user(
            email="admin@test.com",
            password="admin123",
            name="Admin User",
            tenant=self.tenant,
            role="admin"
        )
        
        # Login
        url = reverse('login')
        response = self.client.post(url, {
            'email': 'admin@test.com',
            'password': 'admin123'
        }, format='json')
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
    
    def test_list_users(self):
        """Testa listagem de usuários"""
        url = reverse('user-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
    
    def test_invite_user(self):
        """Testa convite de novo usuário"""
        url = reverse('invite-user')
        data = {
            'email': 'newuser@test.com',
            'name': 'New User',
            'role': 'professional'
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='newuser@test.com').exists())
    
    def test_multi_tenancy_isolation(self):
        """Testa isolamento entre tenants"""
        # Criar outro tenant
        other_tenant = Tenant.objects.create(
            company_name="Other Barbershop",
            email="other@barbershop.com",
            phone="11777777777"
        )
        other_user = User.objects.create_user(
            email="other@test.com",
            password="other123",
            name="Other User",
            tenant=other_tenant,
            role="admin"
        )
        
        # Tentar listar usuários com outro tenant
        url = reverse('login')
        response = self.client.post(url, {
            'email': 'other@test.com',
            'password': 'other123'
        }, format='json')
        other_token = response.data['access']
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {other_token}')
        url = reverse('user-list')
        response = self.client.get(url)
        
        # Deve retornar apenas usuários do outro tenant
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['email'], 'other@test.com')
