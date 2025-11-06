#!/usr/bin/env python3
"""
Script para verificar se o backend em produção está atualizado
"""
import requests
import sys

PRODUCTION_URL = "https://myerp-production-4bb9.up.railway.app"

def check_backend_health():
    """Verifica se o backend está respondendo"""
    try:
        response = requests.get(f"{PRODUCTION_URL}/api/health/", timeout=10)
        if response.status_code == 200:
            print("✅ Backend está online")
            return True
        else:
            print(f"⚠️  Backend respondeu com status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro ao conectar: {e}")
        return False

def check_pos_endpoint():
    """Verifica se o endpoint de vendas está acessível"""
    try:
        # Tenta um GET (deve dar 401 ou 403, mas não 500)
        response = requests.get(f"{PRODUCTION_URL}/api/pos/sales/", timeout=10)
        if response.status_code in [401, 403]:
            print("✅ Endpoint de vendas está acessível (precisa autenticação)")
            return True
        elif response.status_code == 500:
            print("❌ Erro 500 no endpoint de vendas - backend pode estar com problemas")
            return False
        else:
            print(f"⚠️  Endpoint respondeu com status {response.status_code}")
            return True
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro ao verificar endpoint: {e}")
        return False

def main():
    print("🔍 Verificando backend em produção...\n")
    
    health_ok = check_backend_health()
    pos_ok = check_pos_endpoint()
    
    print("\n" + "="*50)
    if health_ok and pos_ok:
        print("✅ Backend parece estar funcionando!")
        print("\n⚠️  LEMBRE-SE:")
        print("   - Faça login na aplicação para testar completamente")
        print("   - Teste criar uma venda no PDV")
        print("   - Se ainda houver erro 400, force um redeploy no Railway")
    else:
        print("❌ Há problemas com o backend")
        print("\n📝 PRÓXIMOS PASSOS:")
        print("   1. Verifique logs no Railway Dashboard")
        print("   2. Confirme que o deploy mais recente foi concluído")
        print("   3. Se necessário, force um redeploy manual")
    print("="*50)

if __name__ == "__main__":
    main()
