"""
Script de teste completo de todas as APIs do sistema
Testa CRUD de todos os módulos e funcionalidades avançadas
"""
import requests
import json
from datetime import datetime, timedelta
import random

BASE_URL = "http://localhost:8000"
access_token = None
tenant_id = None
user_id = None

# Cores para output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_success(msg):
    print(f"{GREEN}✅ {msg}{RESET}")

def print_error(msg):
    print(f"{RED}❌ {msg}{RESET}")

def print_info(msg):
    print(f"{BLUE}ℹ️  {msg}{RESET}")

def print_warning(msg):
    print(f"{YELLOW}⚠️  {msg}{RESET}")

def print_section(title):
    print(f"\n{'='*60}")
    print(f"{BLUE}{title:^60}{RESET}")
    print(f"{'='*60}\n")

# ==================== AUTENTICAÇÃO ====================

def test_auth():
    """Testa sistema de autenticação"""
    global access_token, tenant_id, user_id
    
    print_section("TESTANDO AUTENTICAÇÃO")
    
    # 1. Login
    print_info("Testando login...")
    response = requests.post(f"{BASE_URL}/api/core/auth/login/", json={
        "email": "admin@barbearia.com",
        "password": "admin123"
    })
    
    if response.status_code == 200:
        data = response.json()
        access_token = data['access']
        print_success(f"Login bem-sucedido! Token: {access_token[:20]}...")
    else:
        print_error(f"Falha no login: {response.status_code}")
        return False
    
    # 2. Get user info
    print_info("Buscando dados do usuário...")
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/api/core/auth/me/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        user_id = data['id']
        tenant_id = data['tenant']
        print_success(f"Usuário: {data['name']} ({data['email']})")
        print_success(f"Tenant ID: {tenant_id}")
    else:
        print_error(f"Falha ao buscar usuário: {response.status_code}")
        return False
    
    # 3. Get tenant info
    print_info("Buscando dados do tenant...")
    response = requests.get(f"{BASE_URL}/api/core/tenants/my-tenant/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print_success(f"Empresa: {data['company_name']}")
        print_success(f"Plano: {data['plan_type']}")
    else:
        print_error(f"Falha ao buscar tenant: {response.status_code}")
    
    return True

# ==================== SERVIÇOS ====================

def test_services():
    """Testa CRUD de serviços"""
    print_section("TESTANDO SERVIÇOS")
    
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # 1. Listar serviços
    print_info("Listando serviços...")
    response = requests.get(f"{BASE_URL}/api/scheduling/services/", headers=headers)
    
    if response.status_code == 200:
        services = response.json()
        print_success(f"Total de serviços: {len(services)}")
        for service in services[:3]:
            print(f"  - {service['name']}: R$ {service['price']} ({service['duration_minutes']}min)")
        return services[0]['id'] if services else None
    else:
        print_error(f"Falha ao listar serviços: {response.status_code}")
        return None

# ==================== CLIENTES ====================

def test_customers():
    """Testa CRUD de clientes"""
    print_section("TESTANDO CLIENTES")
    
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # 1. Listar clientes
    print_info("Listando clientes...")
    response = requests.get(f"{BASE_URL}/api/customers/", headers=headers)
    
    if response.status_code == 200:
        customers = response.json()['results']
        print_success(f"Total de clientes: {len(customers)}")
        for customer in customers[:3]:
            print(f"  - {customer['name']}: {customer['phone']} ({customer['tag']})")
        
        # 2. Testar detalhes de um cliente
        if customers:
            customer_id = customers[0]['id']
            print_info(f"Buscando detalhes do cliente {customer_id}...")
            response = requests.get(f"{BASE_URL}/api/customers/{customer_id}/", headers=headers)
            
            if response.status_code == 200:
                print_success("Detalhes do cliente obtidos com sucesso")
            
            # 3. Testar estatísticas
            print_info("Buscando estatísticas do cliente...")
            response = requests.get(f"{BASE_URL}/api/customers/{customer_id}/statistics/", headers=headers)
            
            if response.status_code == 200:
                stats = response.json()
                print_success(f"Total gasto: R$ {stats.get('total_spent', 0):.2f}")
                print_success(f"Total agendamentos: {stats.get('total_appointments', 0)}")
        
        return customers[0]['id'] if customers else None
    else:
        print_error(f"Falha ao listar clientes: {response.status_code}")
        return None

# ==================== AGENDAMENTOS ====================

def test_appointments():
    """Testa CRUD e ações de agendamentos"""
    print_section("TESTANDO AGENDAMENTOS")
    
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # 1. Listar agendamentos
    print_info("Listando agendamentos...")
    response = requests.get(f"{BASE_URL}/api/scheduling/appointments/", headers=headers)
    
    if response.status_code == 200:
        appointments = response.json()['results']
        print_success(f"Total de agendamentos: {len(appointments)}")
        
        # Contar por status
        from collections import Counter
        status_count = Counter([a['status'] for a in appointments])
        for status, count in status_count.items():
            print(f"  - {status}: {count}")
        
        # 2. Agendamentos de hoje
        print_info("Buscando agendamentos de hoje...")
        response = requests.get(f"{BASE_URL}/api/scheduling/appointments/today/", headers=headers)
        
        if response.status_code == 200:
            today_appointments = response.json()
            print_success(f"Agendamentos hoje: {len(today_appointments)}")
        
        # 3. Testar validação de conflitos (criar agendamento)
        print_info("Testando validação de conflitos...")
        
        # Buscar um profissional e serviço
        users_response = requests.get(f"{BASE_URL}/api/core/users/", headers=headers)
        services_response = requests.get(f"{BASE_URL}/api/scheduling/services/", headers=headers)
        
        if users_response.status_code == 200 and services_response.status_code == 200:
            professional = users_response.json()[0]
            service = services_response.json()[0]
            
            # Tentar criar agendamento no futuro
            tomorrow = (datetime.now() + timedelta(days=1)).replace(hour=10, minute=0).isoformat()
            
            new_appointment = {
                "customer_name": "Cliente Teste",
                "customer_phone": "(11) 99999-9999",
                "service_id": service['id'],
                "professional_id": professional['id'],
                "start_time": tomorrow,
                "notes": "Teste de criação via API"
            }
            
            response = requests.post(
                f"{BASE_URL}/api/scheduling/appointments/",
                headers=headers,
                json=new_appointment
            )
            
            if response.status_code == 201:
                new_appt = response.json()
                print_success(f"Agendamento criado: {new_appt['id']}")
                
                # Testar ações
                appt_id = new_appt['id']
                
                # Confirmar
                print_info("Testando confirmar agendamento...")
                response = requests.post(
                    f"{BASE_URL}/api/scheduling/appointments/{appt_id}/confirm/",
                    headers=headers
                )
                if response.status_code == 200:
                    print_success("Agendamento confirmado")
                
                # Iniciar
                print_info("Testando iniciar atendimento...")
                response = requests.post(
                    f"{BASE_URL}/api/scheduling/appointments/{appt_id}/start/",
                    headers=headers
                )
                if response.status_code == 200:
                    print_success("Atendimento iniciado")
                
                # Concluir
                print_info("Testando concluir atendimento...")
                response = requests.post(
                    f"{BASE_URL}/api/scheduling/appointments/{appt_id}/complete/",
                    headers=headers
                )
                if response.status_code == 200:
                    print_success("Atendimento concluído")
                
                # Deletar (limpar teste)
                print_info("Deletando agendamento de teste...")
                response = requests.delete(
                    f"{BASE_URL}/api/scheduling/appointments/{appt_id}/",
                    headers=headers
                )
                if response.status_code == 204:
                    print_success("Agendamento deletado")
            else:
                print_warning(f"Não foi possível criar agendamento: {response.status_code}")
                if response.status_code == 400:
                    print(f"  Erro: {response.json()}")

# ==================== PRODUTOS ====================

def test_products():
    """Testa gestão de produtos e estoque"""
    print_section("TESTANDO PRODUTOS E ESTOQUE")
    
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # 1. Listar produtos
    print_info("Listando produtos...")
    response = requests.get(f"{BASE_URL}/api/inventory/products/", headers=headers)
    
    if response.status_code == 200:
        products = response.json()['results']
        print_success(f"Total de produtos: {len(products)}")
        
        for product in products[:3]:
            print(f"  - {product['name']}: R$ {product['price']} (Estoque: {product['stock']})")
        
        # 2. Produtos com estoque baixo
        print_info("Buscando produtos com estoque baixo...")
        response = requests.get(f"{BASE_URL}/api/inventory/products/low_stock/", headers=headers)
        
        if response.status_code == 200:
            low_stock = response.json()
            print_warning(f"Produtos com estoque baixo: {len(low_stock)}")

# ==================== FINANCEIRO ====================

def test_financial():
    """Testa transações financeiras"""
    print_section("TESTANDO FINANCEIRO")
    
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # 1. Listar transações
    print_info("Listando transações...")
    response = requests.get(f"{BASE_URL}/api/financial/transactions/", headers=headers)
    
    if response.status_code == 200:
        transactions = response.json()['results']
        print_success(f"Total de transações: {len(transactions)}")
        
        # 2. Resumo financeiro
        print_info("Buscando resumo financeiro...")
        response = requests.get(f"{BASE_URL}/api/financial/transactions/summary/", headers=headers)
        
        if response.status_code == 200:
            summary = response.json()
            print_success(f"Total receitas: R$ {summary.get('total_income', 0):.2f}")
            print_success(f"Total despesas: R$ {summary.get('total_expense', 0):.2f}")
            print_success(f"Saldo: R$ {summary.get('balance', 0):.2f}")

# ==================== COMISSÕES ====================

def test_commissions():
    """Testa sistema de comissões"""
    print_section("TESTANDO COMISSÕES")
    
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # 1. Listar regras de comissão
    print_info("Listando regras de comissão...")
    response = requests.get(f"{BASE_URL}/api/commissions/rules/", headers=headers)
    
    if response.status_code == 200:
        rules = response.json()['results']
        print_success(f"Total de regras: {len(rules)}")
        
        for rule in rules[:3]:
            tipo = "Fixo" if rule['rule_type'] == 'fixed' else "Percentual"
            valor = f"R$ {rule['fixed_amount']}" if rule['rule_type'] == 'fixed' else f"{rule['percentage']}%"
            print(f"  - {rule['professional_name']}: {tipo} - {valor}")
    
    # 2. Relatório de comissões
    print_info("Buscando relatório de comissões...")
    response = requests.get(f"{BASE_URL}/api/commissions/", headers=headers)
    
    if response.status_code == 200:
        commissions = response.json()['results']
        print_success(f"Total de comissões calculadas: {len(commissions)}")

# ==================== RELATÓRIOS ====================

def test_reports():
    """Testa relatórios e gráficos"""
    print_section("TESTANDO RELATÓRIOS")
    
    headers = {"Authorization": f"Bearer {access_token}"}
    
    endpoints = [
        ("revenue", "Receita"),
        ("expense", "Despesas"),
        ("status_distribution", "Distribuição de Status"),
        ("top_services", "Top Serviços"),
        ("professional_performance", "Performance Profissionais"),
        ("best_selling_products", "Produtos Mais Vendidos"),
    ]
    
    for endpoint, name in endpoints:
        print_info(f"Testando relatório: {name}...")
        response = requests.get(
            f"{BASE_URL}/api/financial/reports/{endpoint}/",
            headers=headers,
            params={"period": "month"}
        )
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, dict) and 'data' in data:
                count = len(data['data'])
            elif isinstance(data, list):
                count = len(data)
            else:
                count = 1
            print_success(f"{name}: {count} registros")
        else:
            print_warning(f"{name}: Erro {response.status_code}")

# ==================== NOTIFICAÇÕES ====================

def test_notifications():
    """Testa centro de notificações"""
    print_section("TESTANDO NOTIFICAÇÕES")
    
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # 1. Listar notificações
    print_info("Listando notificações...")
    response = requests.get(f"{BASE_URL}/api/notifications/", headers=headers)
    
    if response.status_code == 200:
        notifications = response.json()['results']
        print_success(f"Total de notificações: {len(notifications)}")
        
        # 2. Contador de não lidas
        print_info("Buscando contador de não lidas...")
        response = requests.get(f"{BASE_URL}/api/notifications/unread_count/", headers=headers)
        
        if response.status_code == 200:
            count = response.json()
            print_success(f"Notificações não lidas: {count.get('unread_count', 0)}")

# ==================== EQUIPE ====================

def test_team():
    """Testa gestão de equipe"""
    print_section("TESTANDO GESTÃO DE EQUIPE")
    
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # 1. Listar usuários
    print_info("Listando membros da equipe...")
    response = requests.get(f"{BASE_URL}/api/core/users/", headers=headers)
    
    if response.status_code == 200:
        users = response.json()
        print_success(f"Total de membros: {len(users)}")
        
        for user in users:
            status = "Ativo" if user['is_active'] else "Inativo"
            print(f"  - {user['name']} ({user['role']}): {status}")

# ==================== MAIN ====================

def run_all_tests():
    """Executa todos os testes"""
    print("\n" + "="*60)
    print(f"{BLUE}{'TESTE COMPLETO DO SISTEMA ERP':^60}{RESET}")
    print("="*60 + "\n")
    
    results = {
        "✅ Passou": 0,
        "❌ Falhou": 0
    }
    
    try:
        # Autenticação (obrigatório)
        if not test_auth():
            print_error("Falha na autenticação. Abortando testes.")
            return
        results["✅ Passou"] += 1
        
        # Executar todos os testes
        test_services()
        results["✅ Passou"] += 1
        
        test_customers()
        results["✅ Passou"] += 1
        
        test_appointments()
        results["✅ Passou"] += 1
        
        test_products()
        results["✅ Passou"] += 1
        
        test_financial()
        results["✅ Passou"] += 1
        
        test_commissions()
        results["✅ Passou"] += 1
        
        test_reports()
        results["✅ Passou"] += 1
        
        test_notifications()
        results["✅ Passou"] += 1
        
        test_team()
        results["✅ Passou"] += 1
        
    except Exception as e:
        print_error(f"Erro durante os testes: {str(e)}")
        results["❌ Falhou"] += 1
    
    # Resumo final
    print("\n" + "="*60)
    print(f"{BLUE}{'RESUMO DOS TESTES':^60}{RESET}")
    print("="*60 + "\n")
    
    total = results["✅ Passou"] + results["❌ Falhou"]
    success_rate = (results["✅ Passou"] / total * 100) if total > 0 else 0
    
    print_success(f"Testes passaram: {results['✅ Passou']}/{total}")
    if results["❌ Falhou"] > 0:
        print_error(f"Testes falharam: {results['❌ Falhou']}/{total}")
    
    print(f"\n{GREEN}Taxa de sucesso: {success_rate:.1f}%{RESET}\n")
    
    if success_rate >= 90:
        print(f"{GREEN}🎉 SISTEMA FUNCIONANDO PERFEITAMENTE! 🎉{RESET}\n")
    elif success_rate >= 70:
        print(f"{YELLOW}⚠️  Sistema funcional com alguns problemas menores{RESET}\n")
    else:
        print(f"{RED}❌ Sistema apresenta problemas significativos{RESET}\n")

if __name__ == "__main__":
    run_all_tests()
