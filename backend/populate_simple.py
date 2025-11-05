"""
Script simples para popular dados via API
"""
import requests
import json
from datetime import datetime, timedelta
import random

# Configurações
BASE_URL = "https://myerp-production-4bb9.up.railway.app/api"
TENANT_NAME = "Gael's Barber"
EMAIL = "gael@barber.com"
PASSWORD = "barber123"

def register():
    """Registra um novo usuário"""
    print(f"📝 Registrando usuário {EMAIL}...")
    response = requests.post(f"{BASE_URL}/auth/signup/", json={
        "email": EMAIL,
        "password": PASSWORD,
        "tenant_name": TENANT_NAME,
        "name": "Gael Macedo"
    })
    
    if response.status_code in [200, 201]:
        print(f"✅ Usuário registrado com sucesso!")
        return True
    else:
        print(f"⚠️ Erro no registro: {response.status_code} - {response.text}")
        return False

def login():
    """Faz login e retorna o token"""
    print("🔐 Fazendo login...")
    response = requests.post(f"{BASE_URL}/auth/login/", json={
        "email": EMAIL,
        "password": PASSWORD
    })
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Login bem-sucedido!")
        return data['access']
    else:
        print(f"❌ Erro no login: {response.text}")
        return None

def create_customers(token, count=20):
    """Cria clientes"""
    print(f"\n📋 Criando {count} clientes...")
    
    nomes = ["João Silva", "Maria Santos", "Pedro Oliveira", "Ana Costa", "Carlos Souza",
             "Juliana Lima", "Roberto Alves", "Fernanda Rodrigues", "Lucas Ferreira", "Patrícia Martins",
             "Rafael Carvalho", "Camila Ribeiro", "Bruno Araújo", "Larissa Gomes", "Felipe Barbosa",
             "Beatriz Cardoso", "Thiago Dias", "Amanda Correia", "Gabriel Monteiro", "Mariana Freitas"]
    
    headers = {"Authorization": f"Bearer {token}"}
    created = 0
    
    for i in range(count):
        customer_data = {
            "name": nomes[i],
            "email": f"cliente{i+1}@email.com",
            "phone": f"(11) 9{random.randint(1000,9999)}-{random.randint(1000,9999)}",
            "notes": "Cliente VIP" if i % 5 == 0 else "Cliente regular"
        }
        
        response = requests.post(f"{BASE_URL}/customers/", json=customer_data, headers=headers)
        if response.status_code in [200, 201]:
            created += 1
    
    print(f"✅ {created} clientes criados")
    return created

def create_services(token, count=10):
    """Cria serviços"""
    print(f"\n✂️ Criando {count} serviços...")
    
    servicos = [
        ("Corte Masculino", "45.00", 30, "Corte profissional com acabamento"),
        ("Barba Completa", "35.00", 25, "Barba desenhada e aparada"),
        ("Corte + Barba", "70.00", 50, "Combo completo de corte e barba"),
        ("Platinado", "120.00", 90, "Descoloração completa"),
        ("Luzes", "150.00", 120, "Luzes profissionais"),
        ("Relaxamento", "80.00", 60, "Relaxamento capilar"),
        ("Hidratação", "60.00", 40, "Tratamento hidratante profundo"),
        ("Sobrancelha", "20.00", 15, "Design de sobrancelhas"),
        ("Pigmentação Barba", "100.00", 45, "Pigmentação profissional"),
        ("Spa da Barba", "90.00", 60, "Tratamento completo para barba"),
    ]
    
    headers = {"Authorization": f"Bearer {token}"}
    created = 0
    
    for nome, preco, duracao, descricao in servicos:
        service_data = {
            "name": nome,
            "description": descricao,
            "price": preco,
            "duration_minutes": duracao
        }
        
        response = requests.post(f"{BASE_URL}/services/", json=service_data, headers=headers)
        if response.status_code in [200, 201]:
            created += 1
    
    print(f"✅ {created} serviços criados")
    return created

def create_products(token, count=15):
    """Cria produtos"""
    print(f"\n🛍️ Criando {count} produtos...")
    
    produtos = [
        ("Pomada Modeladora", "35.90", "21.54", 50),
        ("Shampoo Anticaspa", "28.50", "17.10", 30),
        ("Cera Finalizadora", "42.00", "25.20", 25),
        ("Óleo para Barba", "55.00", "33.00", 20),
        ("Balm para Barba", "48.90", "29.34", 18),
        ("Navalha Profissional", "120.00", "72.00", 10),
        ("Tesoura Corte", "85.00", "51.00", 8),
        ("Pente Madeira", "15.00", "9.00", 40),
        ("Escova Profissional", "65.00", "39.00", 12),
        ("Gel Fixador", "32.00", "19.20", 35),
        ("Mousse Modelador", "38.50", "23.10", 22),
        ("Spray Finalizador", "45.00", "27.00", 28),
        ("Loção Pós-Barba", "52.00", "31.20", 15),
        ("Kit Barba Completo", "150.00", "90.00", 5),
        ("Máquina de Corte", "450.00", "270.00", 3),
    ]
    
    headers = {"Authorization": f"Bearer {token}"}
    created = 0
    
    for nome, preco, custo, estoque in produtos:
        product_data = {
            "name": nome,
            "description": f"Produto profissional de alta qualidade - {nome}",
            "price": preco,
            "cost": custo,
            "stock_quantity": estoque,
            "min_stock_level": 5
        }
        
        response = requests.post(f"{BASE_URL}/products/", json=product_data, headers=headers)
        if response.status_code in [200, 201]:
            created += 1
    
    print(f"✅ {created} produtos criados")
    return created

def create_appointments(token, count=30):
    """Cria agendamentos"""
    print(f"\n📅 Criando {count} agendamentos...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Buscar clientes e serviços existentes
    customers = requests.get(f"{BASE_URL}/customers/", headers=headers).json()
    services = requests.get(f"{BASE_URL}/services/", headers=headers).json()
    
    if not customers or not services:
        print("⚠️ Não há clientes ou serviços para criar agendamentos")
        return 0
    
    created = 0
    now = datetime.now()
    
    for i in range(count):
        # 60% passados, 40% futuros
        if random.random() < 0.6:
            days_offset = random.randint(-60, -1)
            status = random.choice(['completed', 'completed', 'completed', 'cancelled', 'no_show'])
        else:
            days_offset = random.randint(1, 30)
            status = 'scheduled'
        
        appointment_date = now + timedelta(days=days_offset)
        appointment_time = appointment_date.replace(
            hour=random.randint(9, 18),
            minute=random.choice([0, 30]),
            second=0,
            microsecond=0
        )
        
        appointment_data = {
            "customer": random.choice(customers)['id'],
            "service": random.choice(services)['id'],
            "appointment_datetime": appointment_time.strftime("%Y-%m-%dT%H:%M:%S"),
            "status": status,
            "notes": "Agendamento via WhatsApp" if i % 3 == 0 else ""
        }
        
        response = requests.post(f"{BASE_URL}/appointments/", json=appointment_data, headers=headers)
        if response.status_code in [200, 201]:
            created += 1
    
    print(f"✅ {created} agendamentos criados")
    return created

def create_transactions(token, count=50):
    """Cria transações financeiras"""
    print(f"\n💰 Criando {count} transações...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Buscar métodos de pagamento
    payment_methods_response = requests.get(f"{BASE_URL}/payment-methods/", headers=headers)
    payment_methods = payment_methods_response.json() if payment_methods_response.status_code == 200 else []
    
    created = 0
    now = datetime.now()
    
    categories_income = ['service', 'product', 'other']
    categories_expense = ['supplies', 'salary', 'rent', 'utilities', 'other']
    
    for i in range(count):
        # 70% receitas, 30% despesas
        is_income = random.random() < 0.7
        
        if is_income:
            transaction_type = 'income'
            category = random.choice(categories_income)
            amount = str(round(random.uniform(50, 500), 2))
            description = f"Receita de {category}"
        else:
            transaction_type = 'expense'
            category = random.choice(categories_expense)
            amount = str(round(random.uniform(100, 2000), 2))
            description = f"Despesa: {category}"
        
        # 80% passadas, 20% futuras
        if random.random() < 0.8:
            days_offset = random.randint(-60, 0)
            status = random.choice(['paid', 'paid', 'paid', 'overdue'])
        else:
            days_offset = random.randint(1, 30)
            status = 'pending'
        
        transaction_date = (now + timedelta(days=days_offset)).date()
        
        transaction_data = {
            "type": transaction_type,
            "category": category,
            "amount": amount,
            "description": description,
            "date": transaction_date.strftime("%Y-%m-%d"),
            "status": status
        }
        
        if status == 'paid' and payment_methods:
            transaction_data["payment_method"] = random.choice(payment_methods)['id']
        
        response = requests.post(f"{BASE_URL}/transactions/", json=transaction_data, headers=headers)
        if response.status_code in [200, 201]:
            created += 1
    
    print(f"✅ {created} transações criadas")
    return created

def main():
    """Função principal"""
    print("=" * 60)
    print("🚀 POPULANDO DADOS DE DEMONSTRAÇÃO")
    print("=" * 60)
    
    # Registrar usuário
    register()
    
    # Login
    token = login()
    if not token:
        return
    
    try:
        # Popular dados
        customers_count = create_customers(token, 20)
        services_count = create_services(token, 10)
        products_count = create_products(token, 15)
        appointments_count = create_appointments(token, 30)
        transactions_count = create_transactions(token, 50)
        
        print("\n" + "=" * 60)
        print("✅ POPULAÇÃO CONCLUÍDA COM SUCESSO!")
        print("=" * 60)
        print(f"\n📊 RESUMO:")
        print(f"  • {customers_count} clientes")
        print(f"  • {services_count} serviços")
        print(f"  • {products_count} produtos")
        print(f"  • {appointments_count} agendamentos")
        print(f"  • {transactions_count} transações financeiras")
        
        print(f"\n🎉 O usuário {EMAIL} agora tem dados completos para apresentação!")
        
    except Exception as e:
        print(f"\n❌ Erro ao popular dados: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
