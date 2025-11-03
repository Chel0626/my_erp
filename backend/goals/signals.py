from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from decimal import Decimal


@receiver(post_save, sender='pos.Sale')
def update_goals_on_sale(sender, instance, created, **kwargs):
    """Atualiza metas quando uma venda é concluída"""
    from .models import Goal
    
    if instance.payment_status != 'paid':
        return
    
    # Busca metas ativas que devem ser atualizadas
    today = timezone.now().date()
    
    # Metas do vendedor
    if instance.user:
        user_goals = Goal.objects.filter(
            tenant=instance.tenant,
            user=instance.user,
            status='active',
            start_date__lte=today,
            end_date__gte=today
        )
        
        for goal in user_goals:
            if goal.target_type in ['revenue', 'sales_count', 'products_sold']:
                goal.calculate_current_value()
    
    # Metas de equipe
    team_goals = Goal.objects.filter(
        tenant=instance.tenant,
        type='team',
        status='active',
        start_date__lte=today,
        end_date__gte=today
    )
    
    for goal in team_goals:
        if goal.target_type in ['revenue', 'sales_count', 'products_sold']:
            goal.calculate_current_value()


@receiver(post_save, sender='scheduling.Appointment')
def update_goals_on_appointment(sender, instance, created, **kwargs):
    """Atualiza metas quando um agendamento é concluído"""
    from .models import Goal
    
    if instance.status != 'completed':
        return
    
    today = timezone.now().date()
    
    # Metas do profissional
    if instance.professional:
        user_goals = Goal.objects.filter(
            tenant=instance.tenant,
            user=instance.professional,
            status='active',
            start_date__lte=today,
            end_date__gte=today,
            target_type='services_count'
        )
        
        for goal in user_goals:
            goal.calculate_current_value()
    
    # Metas de equipe
    team_goals = Goal.objects.filter(
        tenant=instance.tenant,
        type='team',
        status='active',
        start_date__lte=today,
        end_date__gte=today,
        target_type='services_count'
    )
    
    for goal in team_goals:
        goal.calculate_current_value()


@receiver(post_save, sender='customers.Customer')
def update_goals_on_new_customer(sender, instance, created, **kwargs):
    """Atualiza metas quando um novo cliente é cadastrado"""
    from .models import Goal
    
    if not created:
        return
    
    today = timezone.now().date()
    
    # Metas de novos clientes (apenas equipe, pois não tem profissional específico)
    team_goals = Goal.objects.filter(
        tenant=instance.tenant,
        type='team',
        status='active',
        start_date__lte=today,
        end_date__gte=today,
        target_type='new_customers'
    )
    
    for goal in team_goals:
        goal.calculate_current_value()
