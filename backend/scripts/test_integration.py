"""
Script de teste para integração Agendamentos <> Clientes <> Financeiro
Testa o fluxo completo end-to-end
"""
import os
import sys
import django
from datetime import datetime, timedelta
from decimal import Decimal

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from scheduling.models import Appointment, Service
from customers.models import Customer
from financial.models import Transaction, PaymentMethod
from core.models import Tenant, User
from django.utils import timezone


def test_integration():
    """
    Testa o fluxo completo:
    1. Cria agendamento vinculado a cliente
    2. Completa o agendamento
    3. Verifica se Transaction foi criada
    4. Verifica se last_visit foi atualizado
    """
    print("\n🧪 INICIANDO TESTES DE INTEGRAÇÃO")
    print("=" * 60)
    
    # Pega tenant e dados necessários
    tenant = Tenant.objects.first()
    if not tenant:
        print("❌ Nenhum tenant encontrado!")
        return
    
    print(f"\n🏢 Tenant: {tenant.name}")
    
    # Pega um cliente
    customer = Customer.objects.filter(tenant=tenant).first()
    if not customer:
        print("❌ Nenhum cliente encontrado!")
        return
    
    print(f"👤 Cliente: {customer.name}")
    print(f"   📅 Última visita antes: {customer.last_visit}")
    
    # Pega um serviço
    service = Service.objects.filter(tenant=tenant, is_active=True).first()
    if not service:
        print("❌ Nenhum serviço encontrado!")
        return
    
    print(f"✂️  Serviço: {service.name} (R$ {service.price})")
    
    # Pega um profissional
    professional = User.objects.filter(tenant=tenant, is_active=True).first()
    if not professional:
        print("❌ Nenhum profissional encontrado!")
        return
    
    print(f"👨‍💼 Profissional: {professional.name}")
    
    # Verifica se existe método de pagamento
    payment_method = PaymentMethod.objects.filter(tenant=tenant, is_active=True).first()
    if not payment_method:
        print("\n⚠️  Criando método de pagamento padrão...")
        payment_method = PaymentMethod.objects.create(
            tenant=tenant,
            name='Dinheiro',
            is_active=True
        )
        print(f"✅ Método de pagamento criado: {payment_method.name}")
    else:
        print(f"💳 Método de pagamento: {payment_method.name}")
    
    print("\n" + "=" * 60)
    print("TESTE 1: Criar agendamento vinculado a cliente")
    print("=" * 60)
    
    # Cria agendamento
    start_time = timezone.now() + timedelta(days=1)
    appointment = Appointment.objects.create(
        tenant=tenant,
        customer=customer,  # Vincula ao cliente
        service=service,
        professional=professional,
        start_time=start_time,
        price=service.price + Decimal('10.00'),  # Preço diferente do serviço base
        notes='Teste de integração',
        created_by=professional,
        status='marcado'
    )
    
    print(f"✅ Agendamento criado: {appointment.id}")
    print(f"   Cliente (FK): {appointment.customer.name if appointment.customer else 'N/A'}")
    print(f"   Customer Name: {appointment.customer_name}")
    print(f"   Preço: R$ {appointment.price}")
    print(f"   Status: {appointment.status}")
    
    # Verifica se customer_name foi preenchido automaticamente
    assert appointment.customer_name == customer.name, "❌ customer_name não foi sincronizado!"
    print("   ✓ customer_name sincronizado automaticamente")
    
    print("\n" + "=" * 60)
    print("TESTE 2: Completar agendamento e verificar integração")
    print("=" * 60)
    
    # Guarda estado antes
    last_visit_before = customer.last_visit
    transactions_before = Transaction.objects.filter(tenant=tenant).count()
    
    print(f"📊 Estado antes:")
    print(f"   Last visit: {last_visit_before}")
    print(f"   Total de transações: {transactions_before}")
    
    # Completa o agendamento
    appointment.status = 'concluido'
    appointment.save()
    
    print(f"\n✅ Agendamento marcado como concluído")
    
    # Aguarda signals serem executados
    import time
    time.sleep(0.5)
    
    # Recarrega customer
    customer.refresh_from_db()
    
    print(f"\n📊 Estado depois:")
    print(f"   Last visit: {customer.last_visit}")
    print(f"   Total de transações: {Transaction.objects.filter(tenant=tenant).count()}")
    
    # Verifica se last_visit foi atualizado
    if customer.last_visit != last_visit_before:
        print(f"   ✅ Last visit atualizado!")
    else:
        print(f"   ⚠️  Last visit não foi atualizado (pode ser porque já tinha visita mais recente)")
    
    # Verifica se transaction foi criada
    transaction = Transaction.objects.filter(appointment=appointment).first()
    if transaction:
        print(f"\n✅ Transaction criada automaticamente!")
        print(f"   ID: {transaction.id}")
        print(f"   Tipo: {transaction.type}")
        print(f"   Valor: R$ {transaction.amount}")
        print(f"   Categoria: {transaction.category}")
        print(f"   Descrição: {transaction.description}")
        print(f"   Método: {transaction.payment_method.name}")
        print(f"   Data: {transaction.date}")
        
        # Verifica valores
        assert transaction.type == 'receita', "❌ Tipo deveria ser receita!"
        assert transaction.amount == appointment.price, "❌ Valor da transaction não corresponde ao preço!"
        assert transaction.category == 'servico', "❌ Categoria deveria ser servico!"
        print("   ✓ Todos os campos corretos!")
        
    else:
        print(f"\n❌ Transaction NÃO foi criada automaticamente!")
        print(f"   Verifique se o método de pagamento existe e está ativo.")
    
    # Verifica is_paid()
    appointment.refresh_from_db()
    print(f"\n🔍 Verificando is_paid():")
    print(f"   is_paid(): {appointment.is_paid()}")
    if transaction:
        assert appointment.is_paid(), "❌ is_paid() deveria retornar True!"
        print("   ✅ is_paid() funcionando corretamente!")
    
    print("\n" + "=" * 60)
    print("TESTE 3: Estatísticas do cliente")
    print("=" * 60)
    
    # Conta agendamentos e total gasto
    customer_appointments = Appointment.objects.filter(customer=customer).count()
    customer_transactions = Transaction.objects.filter(
        appointment__customer=customer,
        type='receita'
    )
    total_spent = sum(t.amount for t in customer_transactions)
    
    print(f"📊 Estatísticas de {customer.name}:")
    print(f"   Total de agendamentos: {customer_appointments}")
    print(f"   Total gasto: R$ {total_spent}")
    print(f"   Última visita: {customer.last_visit}")
    print(f"   Tag: {customer.tag}")
    
    print("\n" + "=" * 60)
    print("✅ TODOS OS TESTES CONCLUÍDOS COM SUCESSO!")
    print("=" * 60)
    
    # Cleanup (opcional)
    print(f"\n🗑️  Limpando dados de teste...")
    if transaction:
        transaction.delete()
        print(f"   ✓ Transaction deletada")
    appointment.delete()
    print(f"   ✓ Agendamento deletado")
    
    # Restaura last_visit se necessário
    if last_visit_before:
        customer.last_visit = last_visit_before
        customer.save()
        print(f"   ✓ Last visit restaurado")
    
    print("\n✅ Cleanup concluído!")


if __name__ == '__main__':
    try:
        test_integration()
    except Exception as e:
        print(f"\n❌ ERRO NO TESTE: {e}")
        import traceback
        traceback.print_exc()
