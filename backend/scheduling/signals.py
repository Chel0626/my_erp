"""
Signals do módulo de Agendamentos
Integração com Clientes e Financeiro
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Appointment


@receiver(post_save, sender=Appointment)
def update_customer_last_visit(sender, instance, created, **kwargs):
    """
    Atualiza a data da última visita do cliente quando agendamento é concluído
    """
    if instance.status == 'concluido' and instance.customer:
        # Atualiza last_visit com a data do agendamento
        instance.customer.last_visit = instance.start_time.date()
        instance.customer.save(update_fields=['last_visit'])


@receiver(post_save, sender=Appointment)
def create_transaction_on_completion(sender, instance, created, **kwargs):
    """
    Cria transação financeira automaticamente quando agendamento é concluído
    """
    # Só cria transação se:
    # 1. Status é concluído
    # 2. Tem preço definido e > 0
    # 3. Ainda não existe transação vinculada
    if (instance.status == 'concluido' and 
        instance.get_final_price() > 0 and 
        not instance.is_paid()):
        
        # Import aqui para evitar circular import
        from financial.models import Transaction, PaymentMethod
        
        # Tenta obter o método de pagamento padrão
        default_payment = PaymentMethod.objects.filter(
            tenant=instance.tenant,
            is_active=True
        ).first()
        
        if default_payment:
            # Cria a transação
            transaction = Transaction.objects.create(
                tenant=instance.tenant,
                type='receita',
                amount=instance.get_final_price(),
                description=f"Agendamento: {instance.service.name} - {instance.customer_name}",
                category='servico',
                payment_method=default_payment,
                date=instance.start_time.date(),
                appointment=instance,
                created_by=instance.professional  # Profissional que realizou o serviço
            )
            
            print(f"✅ Transação criada automaticamente: {transaction.id}")
