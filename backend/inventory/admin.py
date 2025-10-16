"""
Admin do Módulo de Inventário
"""
from django.contrib import admin
from .models import Product, StockMovement


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Admin de Produtos"""
    list_display = [
        'name', 'category', 'sale_price', 'stock_quantity',
        'is_low_stock', 'is_active', 'tenant'
    ]
    list_filter = ['category', 'is_active', 'tenant']
    search_fields = ['name', 'barcode', 'sku']
    readonly_fields = ['id', 'profit_margin', 'stock_status', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('name', 'description', 'category', 'is_active')
        }),
        ('Precificação', {
            'fields': ('cost_price', 'sale_price', 'profit_margin')
        }),
        ('Estoque', {
            'fields': ('stock_quantity', 'min_stock', 'stock_status')
        }),
        ('Códigos', {
            'fields': ('barcode', 'sku', 'image_url'),
            'classes': ('collapse',)
        }),
        ('Sistema', {
            'fields': ('id', 'tenant', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    """Admin de Movimentações"""
    list_display = [
        'product', 'movement_type', 'reason', 'quantity',
        'stock_before', 'stock_after', 'created_by', 'created_at'
    ]
    list_filter = ['movement_type', 'reason', 'created_at']
    search_fields = ['product__name', 'notes']
    readonly_fields = [
        'id', 'stock_before', 'stock_after',
        'created_by', 'created_at', 'tenant'
    ]
    
    fieldsets = (
        ('Movimentação', {
            'fields': ('product', 'movement_type', 'reason', 'quantity')
        }),
        ('Estoque', {
            'fields': ('stock_before', 'stock_after')
        }),
        ('Observações', {
            'fields': ('notes', 'transaction'),
            'classes': ('collapse',)
        }),
        ('Sistema', {
            'fields': ('id', 'tenant', 'created_by', 'created_at'),
            'classes': ('collapse',)
        }),
    )
