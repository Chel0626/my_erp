"""
Script para popular dados de teste de clientes
"""
import os
import sys
import django
from datetime import date, timedelta
from random import choice, randint

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from customers.models import Customer
from core.models import Tenant


def generate_cpf():
    """Gera um CPF fictício formatado"""
    numbers = [randint(0, 9) for _ in range(11)]
    return f"{numbers[0]}{numbers[1]}{numbers[2]}.{numbers[3]}{numbers[4]}{numbers[5]}.{numbers[6]}{numbers[7]}{numbers[8]}-{numbers[9]}{numbers[10]}"


def generate_phone():
    """Gera um telefone fictício"""
    ddd = choice(['11', '21', '31', '41', '51', '61', '71', '81', '85'])
    prefix = choice(['9', '8'])
    return f"({ddd}) {prefix}{randint(1000, 9999)}-{randint(1000, 9999)}"


def generate_birthdate():
    """Gera uma data de nascimento aleatória (18 a 70 anos)"""
    today = date.today()
    years_ago = randint(18, 70)
    days_offset = randint(0, 364)
    return today - timedelta(days=years_ago * 365 + days_offset)


CUSTOMERS_DATA = [
    {
        'name': 'João Silva Santos',
        'gender': 'M',
        'email': 'joao.silva@email.com',
        'preferences': 'Corte degradê, barba desenhada. Prefere atendimento pela manhã.',
        'tag': 'VIP',
        'address_street': 'Rua das Flores',
        'address_number': '123',
        'address_neighborhood': 'Centro',
        'address_city': 'São Paulo',
        'address_state': 'SP',
        'address_zipcode': '01234-567',
    },
    {
        'name': 'Maria Oliveira Costa',
        'gender': 'F',
        'email': 'maria.oliveira@email.com',
        'preferences': 'Corte repicado, luzes. Alérgica a amônia.',
        'tag': 'VIP',
        'address_street': 'Avenida Paulista',
        'address_number': '1500',
        'address_complement': 'Apto 302',
        'address_neighborhood': 'Bela Vista',
        'address_city': 'São Paulo',
        'address_state': 'SP',
        'address_zipcode': '01310-100',
    },
    {
        'name': 'Pedro Henrique Souza',
        'gender': 'M',
        'email': 'pedro.souza@email.com',
        'preferences': 'Corte social, sobrancelha.',
        'tag': 'REGULAR',
        'address_street': 'Rua dos Três',
        'address_number': '456',
        'address_neighborhood': 'Jardins',
        'address_city': 'São Paulo',
        'address_state': 'SP',
        'address_zipcode': '01416-020',
    },
    {
        'name': 'Ana Paula Rodrigues',
        'gender': 'F',
        'email': 'ana.rodrigues@email.com',
        'preferences': 'Escova progressiva, hidratação. Cabelo cacheado.',
        'tag': 'VIP',
        'address_street': 'Rua Augusta',
        'address_number': '2000',
        'address_neighborhood': 'Consolação',
        'address_city': 'São Paulo',
        'address_state': 'SP',
        'address_zipcode': '01304-001',
    },
    {
        'name': 'Carlos Eduardo Lima',
        'gender': 'M',
        'email': 'carlos.lima@email.com',
        'preferences': 'Corte americano, barba por fazer.',
        'tag': 'REGULAR',
        'address_street': 'Alameda Santos',
        'address_number': '800',
        'address_neighborhood': 'Jardim Paulista',
        'address_city': 'São Paulo',
        'address_state': 'SP',
        'address_zipcode': '01418-100',
    },
    {
        'name': 'Juliana Ferreira Alves',
        'gender': 'F',
        'email': 'juliana.alves@email.com',
        'preferences': 'Corte curto moderno, coloração fantasia.',
        'tag': 'NOVO',
        'address_street': 'Rua Oscar Freire',
        'address_number': '300',
        'address_neighborhood': 'Pinheiros',
        'address_city': 'São Paulo',
        'address_state': 'SP',
        'address_zipcode': '05409-010',
    },
    {
        'name': 'Roberto Carlos Mendes',
        'gender': 'M',
        'email': 'roberto.mendes@email.com',
        'preferences': 'Corte militar, platinado.',
        'tag': 'REGULAR',
        'address_street': 'Rua da Consolação',
        'address_number': '1234',
        'address_neighborhood': 'Consolação',
        'address_city': 'São Paulo',
        'address_state': 'SP',
        'address_zipcode': '01301-000',
    },
    {
        'name': 'Fernanda Santos Pereira',
        'gender': 'F',
        'email': 'fernanda.pereira@email.com',
        'preferences': 'Mega hair, ombré hair. Prefere tarde.',
        'tag': 'VIP',
        'address_street': 'Avenida Brigadeiro Faria Lima',
        'address_number': '3000',
        'address_neighborhood': 'Itaim Bibi',
        'address_city': 'São Paulo',
        'address_state': 'SP',
        'address_zipcode': '01451-000',
    },
    {
        'name': 'Lucas Andrade Silva',
        'gender': 'M',
        'email': '',  # Sem email
        'preferences': 'Corte simples, rápido.',
        'tag': 'REGULAR',
        'notes': 'Cliente prefere não receber emails ou SMS de marketing.',
        'address_street': 'Rua Haddock Lobo',
        'address_number': '595',
        'address_neighborhood': 'Cerqueira César',
        'address_city': 'São Paulo',
        'address_state': 'SP',
        'address_zipcode': '01414-001',
    },
    {
        'name': 'Beatriz Costa Martins',
        'gender': 'F',
        'email': 'beatriz.martins@email.com',
        'preferences': 'Cabelo longo, mechas californianas.',
        'tag': 'NOVO',
        'address_street': 'Rua Estados Unidos',
        'address_number': '1500',
        'address_neighborhood': 'Jardim América',
        'address_city': 'São Paulo',
        'address_state': 'SP',
        'address_zipcode': '01427-001',
    },
    {
        'name': 'Gabriel Oliveira Rocha',
        'gender': 'M',
        'email': 'gabriel.rocha@email.com',
        'preferences': 'Corte moderno, sombrancelha desenhada.',
        'tag': 'REGULAR',
        'address_street': 'Rua Bela Cintra',
        'address_number': '1000',
        'address_neighborhood': 'Consolação',
        'address_city': 'São Paulo',
        'address_state': 'SP',
        'address_zipcode': '01415-000',
    },
    {
        'name': 'Camila Rodrigues Lima',
        'gender': 'F',
        'email': 'camila.lima@email.com',
        'preferences': 'Penteados para festa, maquiagem.',
        'tag': 'VIP',
        'address_street': 'Alameda Lorena',
        'address_number': '1234',
        'address_neighborhood': 'Jardim Paulista',
        'address_city': 'São Paulo',
        'address_state': 'SP',
        'address_zipcode': '01424-001',
    },
    {
        'name': 'Ricardo Almeida Santos',
        'gender': 'M',
        'email': 'ricardo.santos@email.com',
        'preferences': '',
        'tag': 'INATIVO',
        'notes': 'Cliente não comparece há 6 meses.',
        'address_street': 'Rua Pamplona',
        'address_number': '145',
        'address_neighborhood': 'Jardim Paulista',
        'address_city': 'São Paulo',
        'address_state': 'SP',
        'address_zipcode': '01405-001',
    },
    {
        'name': 'Patricia Souza Costa',
        'gender': 'F',
        'email': 'patricia.costa@email.com',
        'preferences': 'Alisamento japonês, tratamento capilar.',
        'tag': 'REGULAR',
        'address_street': 'Rua Caconde',
        'address_number': '78',
        'address_neighborhood': 'Jardim Paulista',
        'address_city': 'São Paulo',
        'address_state': 'SP',
        'address_zipcode': '01425-010',
    },
    {
        'name': 'Felipe Martins Oliveira',
        'gender': 'M',
        'email': 'felipe.oliveira@email.com',
        'preferences': 'Corte undercut, barba volumosa.',
        'tag': 'NOVO',
        'address_street': 'Alameda Jaú',
        'address_number': '1000',
        'address_neighborhood': 'Jardim Paulista',
        'address_city': 'São Paulo',
        'address_state': 'SP',
        'address_zipcode': '01420-001',
    },
]


def populate_customers():
    """Popula banco com clientes de teste"""
    
    # Pega o primeiro tenant (assumindo que já existe pelo menos um)
    try:
        tenant = Tenant.objects.first()
        if not tenant:
            print("❌ Nenhum tenant encontrado. Crie um tenant primeiro.")
            return
    except Exception as e:
        print(f"❌ Erro ao buscar tenant: {e}")
        return
    
    print(f"\n🏢 Usando tenant: {tenant.name}")
    print("=" * 60)
    
    # Limpa clientes existentes (apenas para desenvolvimento)
    Customer.objects.filter(tenant=tenant).delete()
    print("🗑️  Clientes anteriores removidos\n")
    
    created_count = 0
    
    for customer_data in CUSTOMERS_DATA:
        try:
            # Adiciona dados gerados automaticamente
            customer_data['tenant'] = tenant
            customer_data['cpf'] = generate_cpf()
            customer_data['phone'] = generate_phone()
            customer_data['birth_date'] = generate_birthdate()
            
            # Define phone_secondary para alguns clientes
            if randint(1, 3) == 1:  # 33% chance
                customer_data['phone_secondary'] = generate_phone()
            
            # Define last_visit para clientes não novos
            if customer_data['tag'] != 'NOVO':
                days_ago = randint(1, 90)
                customer_data['last_visit'] = date.today() - timedelta(days=days_ago)
            
            # Define is_active como False para inativos
            if customer_data['tag'] == 'INATIVO':
                customer_data['is_active'] = False
            
            customer = Customer.objects.create(**customer_data)
            created_count += 1
            
            # Emoji por tag
            tag_emoji = {
                'VIP': '⭐',
                'REGULAR': '👤',
                'NOVO': '✨',
                'INATIVO': '💤'
            }
            
            emoji = tag_emoji.get(customer.tag, '👤')
            print(f"{emoji} {customer.name}")
            print(f"   📱 {customer.phone}")
            if customer.email:
                print(f"   📧 {customer.email}")
            print(f"   🎂 {customer.birth_date.strftime('%d/%m/%Y')} ({customer.get_age()} anos)")
            if customer.last_visit:
                print(f"   🕐 Última visita: {customer.last_visit.strftime('%d/%m/%Y')}")
            print()
            
        except Exception as e:
            print(f"❌ Erro ao criar {customer_data['name']}: {e}\n")
    
    print("=" * 60)
    print(f"✅ {created_count} clientes criados com sucesso!")
    
    # Estatísticas
    vip_count = Customer.objects.filter(tenant=tenant, tag='VIP').count()
    regular_count = Customer.objects.filter(tenant=tenant, tag='REGULAR').count()
    new_count = Customer.objects.filter(tenant=tenant, tag='NOVO').count()
    inactive_count = Customer.objects.filter(tenant=tenant, tag='INATIVO').count()
    
    print(f"\n📊 Estatísticas:")
    print(f"   ⭐ VIP: {vip_count}")
    print(f"   👤 Regulares: {regular_count}")
    print(f"   ✨ Novos: {new_count}")
    print(f"   💤 Inativos: {inactive_count}")
    
    # Aniversariantes do mês
    birthday_customers = [c for c in Customer.objects.filter(tenant=tenant) if c.is_birthday_this_month()]
    if birthday_customers:
        print(f"\n🎉 Aniversariantes este mês: {len(birthday_customers)}")
        for customer in birthday_customers:
            print(f"   🎂 {customer.name} - {customer.birth_date.strftime('%d/%m')}")


if __name__ == '__main__':
    print("\n🚀 Iniciando população de clientes...")
    populate_customers()
    print("\n✅ Processo concluído!\n")
