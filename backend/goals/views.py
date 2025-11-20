from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q, Avg
from django.utils import timezone
from datetime import timedelta

from .models import Goal, GoalProgress
from .serializers import (
    GoalSerializer, GoalCreateSerializer, GoalUpdateSerializer,
    GoalProgressSerializer
)
from core.permissions import IsTenantUser


class GoalViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciamento de metas"""
    
    permission_classes = [IsAuthenticated, IsTenantUser]
    
    def get_queryset(self):
        queryset = Goal.objects.filter(
            tenant=self.request.user.tenant
        ).select_related('user').prefetch_related('progress_history')
        
        # Filtros
        user_id = self.request.query_params.get('user')
        goal_type = self.request.query_params.get('type')
        target_type = self.request.query_params.get('target_type')
        goal_status = self.request.query_params.get('status')
        period = self.request.query_params.get('period')
        
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        if goal_type:
            queryset = queryset.filter(type=goal_type)
        
        if target_type:
            queryset = queryset.filter(target_type=target_type)
        
        if goal_status:
            queryset = queryset.filter(status=goal_status)
        
        if period:
            queryset = queryset.filter(period=period)
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'create':
            return GoalCreateSerializer
        elif self.action == 'update_progress':
            return GoalUpdateSerializer
        return GoalSerializer
    
    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        """Atualiza progresso manualmente"""
        goal = self.get_object()
        
        serializer = GoalUpdateSerializer(
            goal,
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(GoalSerializer(goal).data)
    
    @action(detail=True, methods=['post'])
    def recalculate(self, request, pk=None):
        """Recalcula valor atual da meta"""
        goal = self.get_object()
        goal.calculate_current_value()
        
        # Registra progresso
        GoalProgress.objects.create(
            tenant=goal.tenant,
            goal=goal,
            date=timezone.now().date(),
            value=goal.current_value,
            notes='Recalculado automaticamente'
        )
        
        serializer = self.get_serializer(goal)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancela meta"""
        goal = self.get_object()
        goal.status = 'cancelled'
        goal.save()
        
        serializer = self.get_serializer(goal)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Dashboard de metas - Otimizado para evitar múltiplas queries"""
        try:
            queryset = self.get_queryset()
            
            # Usa aggregate e annotate para fazer tudo em uma query
            from django.db.models import Case, When, IntegerField
            
            summary_data = queryset.aggregate(
                total=Count('id'),
                active=Count('id', filter=Q(status='active')),
                completed=Count('id', filter=Q(status='completed')),
                failed=Count('id', filter=Q(status='failed')),
                individual=Count('id', filter=Q(type='individual')),
                team=Count('id', filter=Q(type='team'))
            )
            
            # Média de progresso das metas ativas (calculado em Python por causa da função percentage)
            active_goals = queryset.filter(status='active').only('target_value', 'current_value')
            avg_progress = 0
            if active_goals.exists():
                try:
                    total_progress = sum(
                        (float(g.current_value) / float(g.target_value) * 100) if g.target_value > 0 else 0 
                        for g in active_goals
                    )
                    avg_progress = total_progress / active_goals.count()
                except (ValueError, ZeroDivisionError, TypeError) as e:
                    # Se houver erro no cálculo, mantém avg_progress = 0
                    pass
            
            # Metas por tipo de objetivo - uma query com group by
            by_target_type = {}
            target_type_counts = queryset.values('target_type').annotate(count=Count('id'))
            target_types_dict = dict(Goal.TARGET_TYPE_CHOICES)
            for item in target_type_counts:
                key = item['target_type']
                by_target_type[key] = {
                    'label': target_types_dict.get(key, key),
                    'count': item['count']
                }
            
            # Metas próximas do vencimento (próximos 7 dias)
            today = timezone.now().date()
            week_ahead = today + timedelta(days=7)
            expiring_soon = queryset.filter(
                status='active',
                end_date__gte=today,
                end_date__lte=week_ahead
            ).select_related('user').values(
                'id', 'name', 'end_date', 'user__name'
            )[:10]  # Limita a 10 para performance
            
            # Top performers (metas individuais completadas) - otimizado
            top_performers = queryset.filter(
                type='individual',
                status='completed',
                user__isnull=False
            ).values(
                'user__name'
            ).annotate(
                completed_count=Count('id')
            ).order_by('-completed_count')[:5]
            
            return Response({
                'summary': {
                    'total': summary_data['total'] or 0,
                    'active': summary_data['active'] or 0,
                    'completed': summary_data['completed'] or 0,
                    'failed': summary_data['failed'] or 0,
                    'avg_progress': round(avg_progress, 2),
                },
                'by_type': {
                    'individual': summary_data['individual'] or 0,
                    'team': summary_data['team'] or 0,
                },
                'by_target_type': by_target_type,
                'expiring_soon': list(expiring_soon),
                'top_performers': [
                    {
                        'name': p['user__name'] or 'Sem nome',
                        'completed': p['completed_count']
                    }
                    for p in top_performers
                ]
            })
        except Exception as e:
            # Log do erro para debug
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Erro no dashboard de metas: {str(e)}", exc_info=True)
            
            # Retorna estrutura vazia mas válida
            return Response({
                'summary': {
                    'total': 0,
                    'active': 0,
                    'completed': 0,
                    'failed': 0,
                    'avg_progress': 0,
                },
                'by_type': {
                    'individual': 0,
                    'team': 0,
                },
                'by_target_type': {},
                'expiring_soon': [],
                'top_performers': []
            })
    
    @action(detail=False, methods=['get'])
    def ranking(self, request):
        """Ranking de profissionais por metas"""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Apenas metas individuais ativas ou completadas
        goals = self.get_queryset().filter(
            type='individual',
            status__in=['active', 'completed'],
            user__isnull=False
        )
        
        # Agrupa por profissional
        users = User.objects.filter(
            tenant=request.user.tenant,
            role__in=['admin', 'profissional']
        )
        
        ranking_data = []
        for user in users:
            user_goals = goals.filter(user=user)
            
            if not user_goals.exists():
                continue
            
            total_goals = user_goals.count()
            completed = user_goals.filter(status='completed').count()
            active = user_goals.filter(status='active').count()
            
            # Média de progresso das metas ativas
            active_goals_list = user_goals.filter(status='active')
            avg_progress = 0
            if active_goals_list.exists():
                progress_sum = sum([g.percentage() for g in active_goals_list])
                avg_progress = progress_sum / active_goals_list.count()
            
            # Taxa de sucesso
            success_rate = (completed / total_goals * 100) if total_goals > 0 else 0
            
            ranking_data.append({
                'user_id': user.id,
                'name': user.get_full_name(),
                'email': user.email,
                'total_goals': total_goals,
                'completed': completed,
                'active': active,
                'avg_progress': round(avg_progress, 2),
                'success_rate': round(success_rate, 2),
                'score': round(avg_progress + success_rate, 2)  # Pontuação combinada
            })
        
        # Ordena por pontuação
        ranking_data.sort(key=lambda x: x['score'], reverse=True)
        
        # Adiciona posição
        for idx, item in enumerate(ranking_data, start=1):
            item['position'] = idx
        
        return Response(ranking_data)
    
    @action(detail=False, methods=['post'])
    def recalculate_all(self, request):
        """Recalcula todas as metas ativas (admin only)"""
        if request.user.role != 'admin':
            return Response(
                {'error': 'Apenas administradores podem executar esta ação.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        active_goals = self.get_queryset().filter(status='active')
        count = 0
        
        for goal in active_goals:
            goal.calculate_current_value()
            
            # Registra progresso
            GoalProgress.objects.create(
                tenant=goal.tenant,
                goal=goal,
                date=timezone.now().date(),
                value=goal.current_value,
                notes='Recalculado em lote'
            )
            count += 1
        
        return Response({
            'message': f'{count} metas foram recalculadas com sucesso.',
            'count': count
        })
    
    @action(detail=False, methods=['get'])
    def compare_periods(self, request):
        """Compara metas entre períodos"""
        from datetime import datetime, timedelta
        from calendar import monthrange
        
        # Período atual (mês atual por padrão)
        today = timezone.now().date()
        current_start = today.replace(day=1)
        
        # Último dia do mês atual
        last_day = monthrange(today.year, today.month)[1]
        current_end = today.replace(day=last_day)
        
        # Período anterior
        if today.month == 1:
            previous_month = 12
            previous_year = today.year - 1
        else:
            previous_month = today.month - 1
            previous_year = today.year
        
        previous_start = datetime(previous_year, previous_month, 1).date()
        previous_last_day = monthrange(previous_year, previous_month)[1]
        previous_end = datetime(previous_year, previous_month, previous_last_day).date()
        
        # Busca metas do período atual
        current_goals = Goal.objects.filter(
            tenant=request.user.tenant,
            start_date__lte=current_end,
            end_date__gte=current_start
        )
        
        # Busca metas do período anterior
        previous_goals = Goal.objects.filter(
            tenant=request.user.tenant,
            start_date__lte=previous_end,
            end_date__gte=previous_start
        )
        
        def calculate_period_stats(goals):
            total = goals.count()
            active = goals.filter(status='active').count()
            completed = goals.filter(status='completed').count()
            failed = goals.filter(status='failed').count()
            
            avg_progress = 0
            if goals.exists():
                progress_sum = sum([g.percentage() for g in goals])
                avg_progress = progress_sum / total
            
            total_revenue = sum([
                float(g.current_value) for g in goals.filter(target_type='revenue')
            ])
            
            return {
                'total': total,
                'active': active,
                'completed': completed,
                'failed': failed,
                'avg_progress': round(avg_progress, 2),
                'total_revenue': round(total_revenue, 2),
                'success_rate': round((completed / total * 100) if total > 0 else 0, 2)
            }
        
        current_stats = calculate_period_stats(current_goals)
        previous_stats = calculate_period_stats(previous_goals)
        
        # Calcula variações
        def calculate_change(current, previous):
            if previous == 0:
                return 100 if current > 0 else 0
            return round(((current - previous) / previous) * 100, 2)
        
        return Response({
            'current_period': {
                'start': current_start,
                'end': current_end,
                'stats': current_stats
            },
            'previous_period': {
                'start': previous_start,
                'end': previous_end,
                'stats': previous_stats
            },
            'changes': {
                'total_goals': calculate_change(current_stats['total'], previous_stats['total']),
                'completed_goals': calculate_change(current_stats['completed'], previous_stats['completed']),
                'avg_progress': calculate_change(current_stats['avg_progress'], previous_stats['avg_progress']),
                'total_revenue': calculate_change(current_stats['total_revenue'], previous_stats['total_revenue']),
                'success_rate': calculate_change(current_stats['success_rate'], previous_stats['success_rate'])
            }
        })


class GoalProgressViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para visualizar progresso das metas"""
    
    permission_classes = [IsAuthenticated, IsTenantUser]
    serializer_class = GoalProgressSerializer
    
    def get_queryset(self):
        queryset = GoalProgress.objects.filter(
            tenant=self.request.user.tenant
        ).select_related('goal')
        
        # Filtro por meta
        goal_id = self.request.query_params.get('goal')
        if goal_id:
            queryset = queryset.filter(goal_id=goal_id)
        
        return queryset
