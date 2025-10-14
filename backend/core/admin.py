"""
Admin customizado para Multi-Tenant
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Tenant, User


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    """Admin para Tenant"""
    list_display = ['name', 'owner', 'plan', 'is_active', 'created_at']
    list_filter = ['plan', 'is_active', 'created_at']
    search_fields = ['name', 'owner__email']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('id', 'name', 'owner', 'plan', 'is_active')
        }),
        ('Datas', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin customizado para User"""
    list_display = ['email', 'name', 'tenant', 'role', 'is_active', 'is_staff']
    list_filter = ['role', 'is_active', 'is_staff', 'tenant']
    search_fields = ['email', 'name', 'tenant__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Autenticação', {
            'fields': ('email', 'password')
        }),
        ('Informações Pessoais', {
            'fields': ('name',)
        }),
        ('Multi-Tenant', {
            'fields': ('tenant', 'role')
        }),
        ('Permissões', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Datas', {
            'fields': ('created_at', 'updated_at', 'last_login')
        }),
    )
    
    add_fieldsets = (
        ('Criar Novo Usuário', {
            'classes': ('wide',),
            'fields': ('email', 'name', 'tenant', 'role', 'password1', 'password2'),
        }),
    )
    
    ordering = ['-created_at']
