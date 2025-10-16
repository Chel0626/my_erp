"""
Configuração do Django Admin para Clientes
"""
from django.contrib import admin
from .models import Customer


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    """Admin para gerenciar Clientes"""
    
    list_display = [
        'name',
        'phone',
        'email',
        'tag',
        'is_active',
        'last_visit',
        'created_at',
    ]
    
    list_filter = [
        'tag',
        'is_active',
        'gender',
        'created_at',
    ]
    
    search_fields = [
        'name',
        'phone',
        'email',
        'cpf',
    ]
    
    readonly_fields = [
        'id',
        'created_at',
        'updated_at',
        'last_visit',
    ]
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': (
                'name',
                'cpf',
                'phone',
                'phone_secondary',
                'email',
                'birth_date',
                'gender',
            )
        }),
        ('Endereço', {
            'fields': (
                'address_street',
                'address_number',
                'address_complement',
                'address_neighborhood',
                'address_city',
                'address_state',
                'address_zipcode',
            ),
            'classes': ('collapse',),
        }),
        ('Preferências', {
            'fields': (
                'preferences',
                'notes',
            ),
        }),
        ('Categorização', {
            'fields': (
                'tag',
                'avatar_url',
                'is_active',
            )
        }),
        ('Metadata', {
            'fields': (
                'id',
                'tenant',
                'last_visit',
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',),
        }),
    )
    
    def get_queryset(self, request):
        """Admin vê todos os clientes (sem filtro de tenant)"""
        return super().get_queryset(request)

