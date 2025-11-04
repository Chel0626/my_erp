"""
Command para verificar metas próximas do vencimento
Deve ser executado diariamente via cron job ou scheduler
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from goals.models import Goal


class Command(BaseCommand):
    help = 'Verifica metas próximas do vencimento e envia notificações'

    def handle(self, *args, **kwargs):
        today = timezone.now().date()
        three_days_from_now = today + timedelta(days=3)
        
        # Busca metas ativas que vencem em até 3 dias
        expiring_goals = Goal.objects.filter(
            status='active',
            end_date__gte=today,
            end_date__lte=three_days_from_now
        )
        
        notifications_sent = 0
        
        for goal in expiring_goals:
            days_left = (goal.end_date - today).days
            
            # Importa o helper de notificação
            from goals.signals import create_goal_notification
            
            create_goal_notification(
                goal,
                'goal_expiring',
                f'⏰ Meta "{goal.name}" vence em {days_left} dia(s). '
                f'Progresso atual: {goal.percentage:.1f}%',
                'warning' if goal.percentage < 50 else 'info'
            )
            notifications_sent += 1
        
        self.stdout.write(
            self.style.SUCCESS(
                f'✅ {notifications_sent} notificações de metas vencendo enviadas'
            )
        )
