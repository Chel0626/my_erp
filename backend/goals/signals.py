from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta


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


@receiver(pre_save, sender='goals.Goal')
def check_goal_status_change(sender, instance, **kwargs):
    """Detecta mudanças no status da meta e cria notificações"""
    if not instance.pk:
        return
    
    try:
        old_goal = sender.objects.get(pk=instance.pk)
        
        # Meta foi concluída
        if old_goal.status != 'completed' and instance.status == 'completed':
            create_goal_notification(
                instance,
                'goal_completed',
                f'🎉 Meta "{instance.name}" foi concluída com sucesso!',
                'success'
            )
        
        # Meta falhou
        elif old_goal.status != 'failed' and instance.status == 'failed':
            create_goal_notification(
                instance,
                'goal_failed',
                f'❌ Meta "{instance.name}" não foi atingida.',
                'warning'
            )
    except sender.DoesNotExist:
        pass


@receiver(post_save, sender='goals.Goal')
def check_goal_expiring_soon(sender, instance, created, **kwargs):
    """Verifica se a meta está próxima do vencimento e cria notificação"""
    if instance.status != 'active':
        return
    
    today = timezone.now().date()
    days_until_end = (instance.end_date - today).days
    
    # Notifica se faltam 3 dias ou menos
    if 0 < days_until_end <= 3:
        create_goal_notification(
            instance,
            'goal_expiring',
            f'⏰ Meta "{instance.name}" vence em {days_until_end} dia(s). Progresso: {instance.percentage:.1f}%',
            'info'
        )


def create_goal_notification(goal, notification_type, message, level='info'):
    """Helper para criar notificações de metas"""
    try:
        from core.models import Notification
        
        # Para metas individuais, notifica o usuário
        if goal.user:
            Notification.objects.create(
                tenant=goal.tenant,
                user=goal.user,
                title=f'Meta: {goal.name}',
                message=message,
                type=notification_type,
                level=level,
                related_object_type='goal',
                related_object_id=goal.id
            )
        # Para metas de equipe, notifica todos os usuários do tenant
        else:
            from core.models import User
            users = User.objects.filter(tenant=goal.tenant, is_active=True)
            for user in users:
                Notification.objects.create(
                    tenant=goal.tenant,
                    user=user,
                    title=f'Meta de Equipe: {goal.name}',
                    message=message,
                    type=notification_type,
                    level=level,
                    related_object_type='goal',
                    related_object_id=goal.id
                )
    except Exception as e:
        # Silenciosamente ignora erros de notificação para não quebrar o fluxo
        pass
