"""
Admin do módulo de Agendamentos
"""
from django.contrib import admin
from .models import Service, Appointment


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    """Admin para Service"""
    list_display = ['name', 'tenant', 'price', 'duration_minutes', 'is_active', 'created_at']
    list_filter = ['is_active', 'tenant', 'created_at']
    search_fields = ['name', 'tenant__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Informações do Serviço', {
            'fields': ('id', 'tenant', 'name', 'description', 'price', 'duration_minutes', 'is_active')
        }),
        ('Datas', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    """Admin para Appointment"""
    list_display = ['customer_name', 'tenant', 'service', 'professional', 'start_time', 'status']
    list_filter = ['status', 'tenant', 'start_time', 'professional']
    search_fields = ['customer_name', 'customer_phone', 'customer_email', 'tenant__name']
    readonly_fields = ['id', 'end_time', 'created_at', 'updated_at']
    date_hierarchy = 'start_time'
    
    fieldsets = (
        ('Cliente', {
            'fields': ('customer_name', 'customer_phone', 'customer_email')
        }),
        ('Agendamento', {
            'fields': ('tenant', 'service', 'professional', 'start_time', 'end_time', 'status', 'notes')
        }),
        ('Metadados', {
            'fields': ('id', 'created_by', 'created_at', 'updated_at')
        }),
    )
