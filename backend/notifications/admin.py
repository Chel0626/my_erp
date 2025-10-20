"""
Admin configuration for notifications app.
"""
from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Admin para notificações."""
    
    list_display = [
        'title',
        'user',
        'notification_type',
        'is_read',
        'created_at',
    ]
    list_filter = [
        'notification_type',
        'is_read',
        'created_at',
    ]
    search_fields = [
        'title',
        'message',
        'user__first_name',
        'user__last_name',
        'user__email',
    ]
    readonly_fields = [
        'id',
        'created_at',
        'read_at',
    ]
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('id', 'tenant', 'user', 'notification_type')
        }),
        ('Conteúdo', {
            'fields': ('title', 'message')
        }),
        ('Status', {
            'fields': ('is_read', 'read_at')
        }),
        ('Referência', {
            'fields': ('reference_type', 'reference_id'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    date_hierarchy = 'created_at'
    
    def get_queryset(self, request):
        """Otimiza queryset com select_related."""
        return super().get_queryset(request).select_related('user', 'tenant')
