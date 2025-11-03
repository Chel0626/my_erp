from django.contrib import admin
from .models import Sale, SaleItem, CashRegister


class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 0
    readonly_fields = ['total']
    fields = ['product', 'service', 'professional', 'quantity', 'unit_price', 'discount', 'total']


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ['id', 'date', 'customer', 'user', 'total', 'payment_method', 'payment_status']
    list_filter = ['payment_status', 'payment_method', 'date']
    search_fields = ['customer__name', 'user__first_name', 'user__last_name']
    readonly_fields = ['date', 'subtotal', 'total']
    inlines = [SaleItemInline]
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('cash_register', 'customer', 'user', 'date')
        }),
        ('Valores', {
            'fields': ('subtotal', 'discount', 'total')
        }),
        ('Pagamento', {
            'fields': ('payment_method', 'payment_status')
        }),
        ('Observações', {
            'fields': ('notes',)
        }),
    )


@admin.register(CashRegister)
class CashRegisterAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'opened_at', 'closed_at', 'status', 'opening_balance', 'closing_balance', 'difference']
    list_filter = ['status', 'opened_at']
    search_fields = ['user__first_name', 'user__last_name']
    readonly_fields = ['opened_at', 'closed_at', 'expected_balance', 'difference']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('user', 'opened_at', 'closed_at', 'status')
        }),
        ('Valores', {
            'fields': ('opening_balance', 'closing_balance', 'expected_balance', 'difference')
        }),
        ('Observações', {
            'fields': ('notes',)
        }),
    )
