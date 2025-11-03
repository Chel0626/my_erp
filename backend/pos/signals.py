from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Sale


@receiver(post_save, sender=Sale)
def handle_sale_payment(sender, instance, created, **kwargs):
    """
    Signal para gerar comissões quando venda é paga
    """
    if not created:  # Apenas em updates
        if instance.payment_status == 'paid':
            # Verifica se já tem comissões geradas
            from commissions.models import Commission
            existing_commissions = Commission.objects.filter(sale=instance).exists()
            
            if not existing_commissions:
                instance.generate_commissions()
