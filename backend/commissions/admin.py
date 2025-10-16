"""
Admin configuration for commissions app.
"""

from django.contrib import admin

from .models import Commission, CommissionRule


@admin.register(CommissionRule)
class CommissionRuleAdmin(admin.ModelAdmin):
    """Admin interface for commission rules."""

    list_display = [
        "id",
        "professional",
        "service",
        "commission_percentage",
        "priority",
        "is_active",
        "created_at",
    ]
    list_filter = ["is_active", "created_at"]
    search_fields = [
        "professional__first_name",
        "professional__last_name",
        "service__name",
    ]
    readonly_fields = ["created_at", "updated_at"]
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "professional",
                    "service",
                    "commission_percentage",
                    "is_active",
                    "priority",
                )
            },
        ),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )


@admin.register(Commission)
class CommissionAdmin(admin.ModelAdmin):
    """Admin interface for commissions."""

    list_display = [
        "id",
        "professional",
        "service",
        "commission_amount",
        "status",
        "date",
        "paid_at",
    ]
    list_filter = ["status", "date", "paid_at"]
    search_fields = [
        "professional__first_name",
        "professional__last_name",
        "service__name",
    ]
    readonly_fields = [
        "commission_amount",
        "paid_at",
        "paid_by",
        "created_at",
        "updated_at",
    ]
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "professional",
                    "appointment",
                    "service",
                    "rule",
                )
            },
        ),
        (
            "Financial Details",
            {
                "fields": (
                    "service_price",
                    "commission_percentage",
                    "commission_amount",
                )
            },
        ),
        (
            "Status",
            {
                "fields": (
                    "status",
                    "date",
                    "paid_at",
                    "paid_by",
                    "notes",
                )
            },
        ),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )
