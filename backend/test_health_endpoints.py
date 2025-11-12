"""
Script de diagnóstico para testar todos os endpoints do sistema de health
Execute: python backend/test_health_endpoints.py
"""
import requests
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')

BASE_URL = "https://myerp-production-4bb9.up.railway.app/api"

# Credenciais de teste (substitua com suas reais)
EMAIL = "admin@admin.com"
PASSWORD = "admin123"

def get_token():
    """Obtém token JWT"""
    print("🔐 Obtendo token JWT...")
    response = requests.post(f"{BASE_URL}/core/auth/login/", json={
        "email": EMAIL,
        "password": PASSWORD
    })
    
    if response.status_code == 200:
        token = response.json()['access']
        print(f"✅ Token obtido: {token[:20]}...")
        return token
    else:
        print(f"❌ Erro ao obter token: {response.status_code}")
        print(response.text)
        return None

def test_endpoint(name, url, headers=None):
    """Testa um endpoint específico"""
    print(f"\n📡 Testando: {name}")
    print(f"   URL: {url}")
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Sucesso!")
            print(f"   Dados: {str(data)[:200]}...")
            return True
        else:
            print(f"   ❌ Erro: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"   ❌ Exceção: {str(e)}")
        return False

def main():
    print("="*60)
    print("🏥 DIAGNÓSTICO DO SISTEMA DE HEALTH")
    print("="*60)
    
    # 1. Health check público
    test_endpoint(
        "Health Check (público)",
        f"{BASE_URL}/health/"
    )
    
    # 2. Obter token
    token = get_token()
    if not token:
        print("\n❌ Não foi possível obter token. Verifique credenciais.")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Testar todos os endpoints protegidos
    endpoints = [
        ("Sentry Health", "/superadmin/system-health/sentry/"),
        ("Sentry Performance", "/superadmin/system-health/sentry/performance/"),
        ("Redis Metrics", "/superadmin/system-health/redis/metrics/"),
        ("Infra Metrics", "/superadmin/system-health/infra/metrics/"),
        ("Uptime Status", "/superadmin/system-health/uptime/"),
        ("Online Users", "/superadmin/system-health/online-users/"),
    ]
    
    results = {}
    for name, endpoint in endpoints:
        results[name] = test_endpoint(name, f"{BASE_URL}{endpoint}", headers)
    
    # Resumo
    print("\n" + "="*60)
    print("📊 RESUMO")
    print("="*60)
    for name, success in results.items():
        status = "✅" if success else "❌"
        print(f"{status} {name}")
    
    # Verificar variáveis de ambiente
    print("\n" + "="*60)
    print("🔧 VARIÁVEIS DE AMBIENTE")
    print("="*60)
    env_vars = [
        "SENTRY_AUTH_TOKEN",
        "SENTRY_ORG_SLUG",
        "SENTRY_PROJECT_SLUG",
        "RAILWAY_API_TOKEN",
        "UPTIMEROBOT_API_KEY",
        "REDIS_URL",
    ]
    
    for var in env_vars:
        value = os.getenv(var)
        if value:
            print(f"✅ {var}: {value[:20]}...")
        else:
            print(f"❌ {var}: NÃO DEFINIDA")

if __name__ == "__main__":
    main()
