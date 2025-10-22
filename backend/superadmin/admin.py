from django.contrib import admin
from .models import Subscription, PaymentHistory, SystemError, TenantUsageStats


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = [
        'tenant', 'plan', 'status', 'payment_status',
        'monthly_price', 'next_billing_date', 'created_at'
    ]
    list_filter = ['plan', 'status', 'payment_status', 'created_at']
    search_fields = ['tenant__company_name', 'tenant__email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('tenant', 'plan', 'status', 'payment_status')
        }),
        ('Datas', {
            'fields': ('start_date', 'trial_end_date', 'next_billing_date')
        }),
        ('Valores e Limites', {
            'fields': ('monthly_price', 'max_users', 'max_appointments_per_month')
        }),
        ('Recursos', {
            'fields': ('features',)
        }),
        ('Observações', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
        ('Metadados', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PaymentHistory)
class PaymentHistoryAdmin(admin.ModelAdmin):
    list_display = [
        'subscription', 'amount', 'payment_method', 'status',
        'reference_month', 'paid_at', 'created_at'
    ]
    list_filter = ['payment_method', 'status', 'reference_month', 'created_at']
    search_fields = ['subscription__tenant__company_name', 'transaction_id']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'reference_month'


@admin.register(SystemError)
class SystemErrorAdmin(admin.ModelAdmin):
    list_display = [
        'tenant', 'error_type', 'severity', 'status',
        'occurrences', 'last_seen', 'resolved_at'
    ]
    list_filter = ['severity', 'status', 'error_type', 'last_seen']
    search_fields = ['tenant__company_name', 'message', 'endpoint', 'user_email']
    readonly_fields = ['first_seen', 'last_seen', 'occurrences']
    date_hierarchy = 'last_seen'
    
    fieldsets = (
        ('Informações do Erro', {
            'fields': ('tenant', 'error_type', 'severity', 'status', 'message')
        }),
        ('Detalhes Técnicos', {
            'fields': ('stack_trace', 'endpoint', 'user_email', 'ip_address', 'user_agent'),
            'classes': ('collapse',)
        }),
        ('Estatísticas', {
            'fields': ('occurrences', 'first_seen', 'last_seen')
        }),
        ('Resolução', {
            'fields': ('resolved_at', 'resolved_by', 'resolution_notes'),
            'classes': ('collapse',)
        }),
    )


@admin.register(TenantUsageStats)
class TenantUsageStatsAdmin(admin.ModelAdmin):
    list_display = [
        'tenant', 'month', 'total_users', 'active_users',
        'total_appointments', 'total_revenue', 'api_calls'
    ]
    list_filter = ['month']
    search_fields = ['tenant__company_name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'month'
