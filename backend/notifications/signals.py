"""
Signals para criar notificações automaticamente.
"""
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.db.models import F

from scheduling.models import Appointment
from financial.models import Transaction
from inventory.models import Product
from commissions.models import Commission
from customers.models import Customer
from .models import Notification


@receiver(post_save, sender=Appointment)
def notify_new_appointment(sender, instance, created, **kwargs):
    """
    Cria notificação quando um novo agendamento é criado.
    Notifica o profissional responsável.
    """
    if created:
        Notification.objects.create(
            user=instance.professional,
            notification_type='appointment_new',
            title='Novo Agendamento',
            message=f'Você tem um novo agendamento com {instance.customer.name} em {instance.start_time.strftime("%d/%m/%Y às %H:%M")}',
            reference_type='appointment',
            reference_id=str(instance.id),
        )


@receiver(pre_save, sender=Appointment)
def notify_appointment_status_change(sender, instance, **kwargs):
    """
    Cria notificação quando o status de um agendamento muda.
    Notifica o profissional quando confirmado ou cancelado.
    """
    if instance.pk:  # Apenas para updates, não creates
        try:
            old_instance = Appointment.objects.get(pk=instance.pk)
            
            # Se o status mudou
            if old_instance.status != instance.status:
                # Notificar confirmação
                if instance.status == 'confirmado':
                    Notification.objects.create(
                        user=instance.professional,
                        notification_type='appointment_confirmed',
                        title='Agendamento Confirmado',
                        message=f'Agendamento com {instance.customer.name} foi confirmado para {instance.start_time.strftime("%d/%m/%Y às %H:%M")}',
                        reference_type='appointment',
                        reference_id=str(instance.id),
                    )
                
                # Notificar cancelamento
                elif instance.status == 'cancelado':
                    Notification.objects.create(
                        user=instance.professional,
                        notification_type='appointment_cancelled',
                        title='Agendamento Cancelado',
                        message=f'Agendamento com {instance.customer.name} em {instance.start_time.strftime("%d/%m/%Y às %H:%M")} foi cancelado',
                        reference_type='appointment',
                        reference_id=str(instance.id),
                    )
        except Appointment.DoesNotExist:
            pass


@receiver(post_save, sender=Transaction)
def notify_payment_received(sender, instance, created, **kwargs):
    """
    Cria notificação quando um pagamento é recebido (receita).
    Notifica todos os usuários do tenant.
    """
    if created and instance.type == 'receita':
        # Buscar todos os usuários do tenant
        from core.models import User
        users = User.objects.filter(tenant=instance.tenant)
        
        for user in users:
            Notification.objects.create(
                user=user,
                notification_type='payment_received',
                title='Pagamento Recebido',
                message=f'Pagamento de R$ {instance.amount:.2f} recebido. Descrição: {instance.description}',
                reference_type='transaction',
                reference_id=str(instance.id),
            )


@receiver(post_save, sender=Commission)
def notify_commission_generated(sender, instance, created, **kwargs):
    """
    Cria notificação quando uma comissão é gerada.
    Notifica o profissional que ganhou a comissão.
    """
    if created:
        Notification.objects.create(
            user=instance.professional,
            notification_type='commission_generated',
            title='Nova Comissão',
            message=f'Você ganhou uma comissão de R$ {instance.commission_amount:.2f} pelo serviço {instance.service.name}',
            reference_type='commission',
            reference_id=str(instance.id),
        )


@receiver(pre_save, sender=Product)
def notify_low_stock(sender, instance, **kwargs):
    """
    Cria notificação quando o estoque de um produto fica baixo.
    Notifica todos os usuários do tenant.
    """
    if instance.pk:  # Apenas para updates
        try:
            old_instance = Product.objects.get(pk=instance.pk)
            
            # Se o estoque mudou e agora está baixo
            if (old_instance.stock_quantity != instance.stock_quantity and
                instance.stock_quantity <= instance.min_stock and
                instance.stock_quantity > 0):
                
                # Buscar todos os usuários do tenant
                from core.models import User
                users = User.objects.filter(tenant=instance.tenant)
                
                for user in users:
                    Notification.objects.create(
                        user=user,
                        notification_type='stock_low',
                        title='Estoque Baixo',
                        message=f'O produto "{instance.name}" está com estoque baixo: {instance.stock_quantity} unidades (mínimo: {instance.min_stock})',
                        reference_type='product',
                        reference_id=str(instance.id),
                    )
            
            # Se o estoque zerou
            elif (old_instance.stock_quantity != instance.stock_quantity and
                  instance.stock_quantity == 0):
                
                # Buscar todos os usuários do tenant
                from core.models import User
                users = User.objects.filter(tenant=instance.tenant)
                
                for user in users:
                    Notification.objects.create(
                        user=user,
                        notification_type='stock_out',
                        title='Produto Sem Estoque',
                        message=f'O produto "{instance.name}" está sem estoque!',
                        reference_type='product',
                        reference_id=str(instance.id),
                    )
        except Product.DoesNotExist:
            pass


@receiver(post_save, sender=Customer)
def notify_new_customer(sender, instance, created, **kwargs):
    """
    Cria notificação quando um novo cliente é cadastrado.
    Notifica todos os usuários do tenant.
    """
    if created:
        # Buscar todos os usuários do tenant
        from core.models import User
        users = User.objects.filter(tenant=instance.tenant)
        
        for user in users:
            Notification.objects.create(
                user=user,
                notification_type='customer_new',
                title='Novo Cliente',
                message=f'Novo cliente cadastrado: {instance.name}',
                reference_type='customer',
                reference_id=str(instance.id),
            )
