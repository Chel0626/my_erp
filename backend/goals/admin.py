from django.contrib import admin
from .models import Goal, GoalProgress


class GoalProgressInline(admin.TabularInline):
    model = GoalProgress
    extra = 0
    readonly_fields = ['date', 'value', 'percentage']
    fields = ['date', 'value', 'percentage', 'notes']
    ordering = ['-date']


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'user', 'type', 'target_type', 'target_value',
        'current_value', 'get_percentage', 'status', 'start_date', 'end_date'
    ]
    list_filter = ['type', 'target_type', 'status', 'period']
    search_fields = ['name', 'user__first_name', 'user__last_name']
    readonly_fields = ['current_value', 'created_at', 'updated_at']
    inlines = [GoalProgressInline]
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('name', 'description', 'type', 'user')
        }),
        ('Objetivo', {
            'fields': ('target_type', 'target_value', 'current_value')
        }),
        ('Período', {
            'fields': ('period', 'start_date', 'end_date')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Metadados', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_percentage(self, obj):
        return f"{obj.percentage():.1f}%"
    get_percentage.short_description = 'Progresso'
    
    actions = ['recalculate_selected', 'cancel_selected']
    
    def recalculate_selected(self, request, queryset):
        count = 0
        for goal in queryset:
            goal.calculate_current_value()
            count += 1
        self.message_user(request, f'{count} metas foram recalculadas.')
    recalculate_selected.short_description = 'Recalcular metas selecionadas'
    
    def cancel_selected(self, request, queryset):
        count = queryset.update(status='cancelled')
        self.message_user(request, f'{count} metas foram canceladas.')
    cancel_selected.short_description = 'Cancelar metas selecionadas'


@admin.register(GoalProgress)
class GoalProgressAdmin(admin.ModelAdmin):
    list_display = ['goal', 'date', 'value', 'percentage', 'notes']
    list_filter = ['date', 'goal__type', 'goal__target_type']
    search_fields = ['goal__name', 'notes']
    readonly_fields = ['percentage', 'created_at']
    
    fieldsets = (
        ('Informações', {
            'fields': ('goal', 'date', 'value', 'percentage', 'notes')
        }),
        ('Metadados', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
