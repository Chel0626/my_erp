"""
Admin do módulo Financeiro
"""
from django.contrib import admin
from .models import PaymentMethod, Transaction, CashFlow


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ['name', 'tenant', 'is_active', 'created_at']
    list_filter = ['is_active', 'tenant']
    search_fields = ['name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['description', 'type', 'amount', 'date', 'payment_method', 'tenant', 'created_at']
    list_filter = ['type', 'date', 'payment_method', 'tenant']
    search_fields = ['description', 'notes']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'date'


@admin.register(CashFlow)
class CashFlowAdmin(admin.ModelAdmin):
    list_display = ['date', 'tenant', 'total_revenue', 'total_expenses', 'balance']
    list_filter = ['date', 'tenant']
    readonly_fields = ['total_revenue', 'total_expenses', 'balance', 'created_at', 'updated_at']
    date_hierarchy = 'date'
