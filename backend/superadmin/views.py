from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.db.models import Count, Sum, Q, F
from django.utils import timezone
from datetime import timedelta, date

from .models import Subscription, PaymentHistory, SystemError, TenantUsageStats
from core.models import Tenant, User
from scheduling.models import Appointment
from .serializers import (
    TenantSerializer,
    SubscriptionSerializer,
    PaymentHistorySerializer,
    SystemErrorSerializer,
    TenantUsageStatsSerializer,
    DashboardStatsSerializer,
    RevenueByPlanSerializer,
)


class IsSuperAdmin(IsAdminUser):
    """Permissão customizada para super admins"""
    
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'superadmin'
        )


class TenantViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar tenants"""
    
    queryset = Tenant.objects.all().order_by('-created_at')
    serializer_class = TenantSerializer
    permission_classes = [IsSuperAdmin]
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Lista apenas tenants ativos"""
        tenants = self.queryset.filter(is_active=True)
        serializer = self.get_serializer(tenants, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        """Suspende um tenant"""
        tenant = self.get_object()
        tenant.is_active = False
        tenant.save()
        
        # Suspender assinatura também
        try:
            subscription = tenant.subscription
            subscription.status = 'suspended'
            subscription.save()
        except:
            pass
        
        return Response({'status': 'Tenant suspenso com sucesso'})
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Ativa um tenant"""
        tenant = self.get_object()
        tenant.is_active = True
        tenant.save()
        
        # Ativar assinatura também
        try:
            subscription = tenant.subscription
            subscription.status = 'active'
            subscription.save()
        except:
            pass
        
        return Response({'status': 'Tenant ativado com sucesso'})


class SubscriptionViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar assinaturas"""
    
    queryset = Subscription.objects.all().select_related('tenant').order_by('-created_at')
    serializer_class = SubscriptionSerializer
    permission_classes = [IsSuperAdmin]
    filterset_fields = ['plan', 'status', 'payment_status']
    
    @action(detail=False, methods=['get'])
    def expiring_soon(self, request):
        """Lista assinaturas que vão expirar em breve (próximos 7 dias)"""
        today = timezone.now().date()
        next_week = today + timedelta(days=7)
        
        subscriptions = self.queryset.filter(
            next_billing_date__range=[today, next_week],
            status='active'
        )
        serializer = self.get_serializer(subscriptions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def trials(self, request):
        """Lista assinaturas em período de teste"""
        subscriptions = self.queryset.filter(status='trial')
        serializer = self.get_serializer(subscriptions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        """Suspende uma assinatura"""
        subscription = self.get_object()
        subscription.status = 'suspended'
        subscription.save()
        
        # Suspender tenant também
        subscription.tenant.is_active = False
        subscription.tenant.save()
        
        return Response({'status': 'Assinatura suspensa'})
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Ativa uma assinatura"""
        subscription = self.get_object()
        subscription.status = 'active'
        subscription.save()
        
        # Ativar tenant também
        subscription.tenant.is_active = True
        subscription.tenant.save()
        
        return Response({'status': 'Assinatura ativada'})
    
    @action(detail=True, methods=['post'])
    def upgrade(self, request, pk=None):
        """Faz upgrade do plano"""
        subscription = self.get_object()
        new_plan = request.data.get('plan')
        
        if new_plan not in dict(Subscription.PLAN_CHOICES):
            return Response(
                {'error': 'Plano inválido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        subscription.plan = new_plan
        subscription.save()
        
        serializer = self.get_serializer(subscription)
        return Response(serializer.data)


class PaymentHistoryViewSet(viewsets.ModelViewSet):
    """ViewSet para histórico de pagamentos"""
    
    queryset = PaymentHistory.objects.all().select_related('subscription__tenant').order_by('-created_at')
    serializer_class = PaymentHistorySerializer
    permission_classes = [IsSuperAdmin]
    filterset_fields = ['payment_method', 'status']
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Lista pagamentos em atraso"""
        payments = self.queryset.filter(status='pending')
        serializer = self.get_serializer(payments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def monthly_revenue(self, request):
        """Receita mensal"""
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        
        if not month or not year:
            today = timezone.now()
            month = today.month
            year = today.year
        
        reference_date = date(int(year), int(month), 1)
        
        revenue = self.queryset.filter(
            reference_month=reference_date,
            status='paid'
        ).aggregate(total=Sum('amount'))
        
        return Response({'total': revenue['total'] or 0})
    
    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Marca pagamento como pago"""
        payment = self.get_object()
        payment.status = 'paid'
        payment.paid_at = timezone.now()
        payment.save()
        
        # Atualizar status da assinatura
        subscription = payment.subscription
        subscription.payment_status = 'paid'
        subscription.save()
        
        return Response({'status': 'Pagamento marcado como pago'})


class SystemErrorViewSet(viewsets.ModelViewSet):
    """ViewSet para erros do sistema"""
    
    queryset = SystemError.objects.all().select_related('tenant').order_by('-last_seen')
    serializer_class = SystemErrorSerializer
    permission_classes = [IsSuperAdmin]
    filterset_fields = ['severity', 'status', 'error_type']
    
    @action(detail=False, methods=['get'])
    def critical(self, request):
        """Lista apenas erros críticos"""
        errors = self.queryset.filter(severity='critical', status__in=['new', 'investigating'])
        serializer = self.get_serializer(errors, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def unresolved(self, request):
        """Lista erros não resolvidos"""
        errors = self.queryset.filter(status__in=['new', 'investigating'])
        serializer = self.get_serializer(errors, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Marca erro como resolvido"""
        error = self.get_object()
        error.status = 'resolved'
        error.resolved_at = timezone.now()
        error.resolved_by = request.user.email
        error.resolution_notes = request.data.get('notes', '')
        error.save()
        
        return Response({'status': 'Erro marcado como resolvido'})
    
    @action(detail=True, methods=['post'])
    def ignore(self, request, pk=None):
        """Ignora um erro"""
        error = self.get_object()
        error.status = 'ignored'
        error.save()
        
        return Response({'status': 'Erro ignorado'})


class TenantUsageStatsViewSet(viewsets.ModelViewSet):
    """ViewSet para estatísticas de uso"""
    
    queryset = TenantUsageStats.objects.all().select_related('tenant').order_by('-month')
    serializer_class = TenantUsageStatsSerializer
    permission_classes = [IsSuperAdmin]
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Resumo de uso de todos os tenants"""
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        
        if not month or not year:
            today = timezone.now()
            month = today.month
            year = today.year
        
        reference_date = date(int(year), int(month), 1)
        
        stats = self.queryset.filter(month=reference_date).aggregate(
            total_users=Sum('total_users'),
            total_active_users=Sum('active_users'),
            total_appointments=Sum('total_appointments'),
            total_revenue=Sum('total_revenue'),
            total_customers=Sum('total_customers'),
            total_api_calls=Sum('api_calls'),
        )
        
        return Response(stats)


class DashboardViewSet(viewsets.ViewSet):
    """ViewSet para dashboard do super admin"""
    
    permission_classes = [IsSuperAdmin]
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Estatísticas gerais do dashboard"""
        today = timezone.now().date()
        first_day_month = today.replace(day=1)
        first_day_year = today.replace(month=1, day=1)
        
        # Estatísticas de tenants
        total_tenants = Tenant.objects.count()
        active_subscriptions = Subscription.objects.filter(status='active').count()
        trial_subscriptions = Subscription.objects.filter(status='trial').count()
        suspended_subscriptions = Subscription.objects.filter(status='suspended').count()
        
        # Receita
        revenue_month = PaymentHistory.objects.filter(
            reference_month__gte=first_day_month,
            status='paid'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        revenue_year = PaymentHistory.objects.filter(
            reference_month__gte=first_day_year,
            status='paid'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Pagamentos
        pending_payments = PaymentHistory.objects.filter(status='pending').count()
        overdue_payments = PaymentHistory.objects.filter(
            status='pending',
            reference_month__lt=today
        ).count()
        
        # Erros
        critical_errors = SystemError.objects.filter(
            severity='critical',
            status__in=['new', 'investigating']
        ).count()
        
        unresolved_errors = SystemError.objects.filter(
            status__in=['new', 'investigating']
        ).count()
        
        # Usuários e agendamentos
        total_users = User.objects.filter(is_active=True).count()
        total_appointments_month = Appointment.objects.filter(
            start_time__gte=first_day_month
        ).count()
        
        data = {
            'total_tenants': total_tenants,
            'active_tenants': active_subscriptions,
            'trial_tenants': trial_subscriptions,
            'suspended_tenants': suspended_subscriptions,
            'total_revenue_month': revenue_month,
            'total_revenue_year': revenue_year,
            'pending_payments': pending_payments,
            'overdue_payments': overdue_payments,
            'critical_errors': critical_errors,
            'unresolved_errors': unresolved_errors,
            'total_users': total_users,
            'total_appointments_month': total_appointments_month,
        }
        
        serializer = DashboardStatsSerializer(data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def revenue_by_plan(self, request):
        """Receita agrupada por plano"""
        revenue = Subscription.objects.filter(
            status='active'
        ).values('plan').annotate(
            count=Count('id'),
            revenue=Sum('monthly_price')
        )
        
        data = []
        for item in revenue:
            data.append({
                'plan': item['plan'],
                'plan_display': dict(Subscription.PLAN_CHOICES).get(item['plan']),
                'count': item['count'],
                'revenue': item['revenue']
            })
        
        serializer = RevenueByPlanSerializer(data, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recent_errors(self, request):
        """Erros recentes (últimas 24h)"""
        yesterday = timezone.now() - timedelta(days=1)
        errors = SystemError.objects.filter(
            last_seen__gte=yesterday
        ).order_by('-last_seen')[:10]
        
        serializer = SystemErrorSerializer(errors, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def sentry_metrics(self, request):
        """
        Métricas do Sentry
        GET /api/superadmin/dashboard/sentry_metrics/
        """
        from core.sentry_integration import sentry_client
        
        summary = sentry_client.get_dashboard_summary()
        return Response(summary)
