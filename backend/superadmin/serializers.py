from rest_framework import serializers
from .models import Subscription, PaymentHistory, SystemError, TenantUsageStats
from core.models import Tenant


class TenantSerializer(serializers.ModelSerializer):
    """Serializer básico para Tenant"""
    
    user_count = serializers.SerializerMethodField()
    subscription_status = serializers.SerializerMethodField()
    subscription_plan = serializers.SerializerMethodField()
    
    class Meta:
        model = Tenant
        fields = [
            'id', 'name', 'plan', 'is_active', 'user_count', 
            'subscription_status', 'subscription_plan', 'created_at'
        ]
    
    def get_user_count(self, obj):
        return obj.users.filter(is_active=True).count()
    
    def get_subscription_status(self, obj):
        if hasattr(obj, 'subscription'):
            return obj.subscription.get_status_display()
        return 'Sem assinatura'
    
    def get_subscription_plan(self, obj):
        if hasattr(obj, 'subscription'):
            return obj.subscription.get_plan_display()
        return obj.plan  # Fallback para o plano legacy do tenant


class SubscriptionSerializer(serializers.ModelSerializer):
    """Serializer para Subscription"""
    
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    plan_display = serializers.CharField(source='get_plan_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    days_until_expiration = serializers.IntegerField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    is_trial = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Subscription
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class PaymentHistorySerializer(serializers.ModelSerializer):
    """Serializer para PaymentHistory"""
    
    tenant_name = serializers.CharField(source='subscription.tenant.name', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = PaymentHistory
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class SystemErrorSerializer(serializers.ModelSerializer):
    """Serializer para SystemError"""
    
    tenant_name = serializers.CharField(source='tenant.name', read_only=True, allow_null=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = SystemError
        fields = '__all__'
        read_only_fields = ['first_seen', 'last_seen']


class TenantUsageStatsSerializer(serializers.ModelSerializer):
    """Serializer para TenantUsageStats"""
    
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    month_display = serializers.SerializerMethodField()
    
    class Meta:
        model = TenantUsageStats
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def get_month_display(self, obj):
        return obj.month.strftime('%B %Y')


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer para estatísticas do dashboard"""
    
    total_tenants = serializers.IntegerField()
    active_tenants = serializers.IntegerField()
    trial_tenants = serializers.IntegerField()
    suspended_tenants = serializers.IntegerField()
    
    total_revenue_month = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_revenue_year = serializers.DecimalField(max_digits=12, decimal_places=2)
    
    pending_payments = serializers.IntegerField()
    overdue_payments = serializers.IntegerField()
    
    critical_errors = serializers.IntegerField()
    unresolved_errors = serializers.IntegerField()
    
    total_users = serializers.IntegerField()
    total_appointments_month = serializers.IntegerField()


class RevenueByPlanSerializer(serializers.Serializer):
    """Serializer para receita por plano"""
    
    plan = serializers.CharField()
    plan_display = serializers.CharField()
    count = serializers.IntegerField()
    revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
