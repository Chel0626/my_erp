"""
Models for the commissions app.
"""

from decimal import Decimal

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from core.models import TenantAwareModel


class CommissionRule(TenantAwareModel):
    """
    Commission rules for professionals and services.
    Can be specific to a professional and/or service, or global.
    """

    professional = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="commission_rules",
        null=True,
        blank=True,
        help_text="Specific professional (null = applies to all professionals)",
    )
    service = models.ForeignKey(
        "scheduling.Service",
        on_delete=models.CASCADE,
        related_name="commission_rules",
        null=True,
        blank=True,
        help_text="Specific service (null = applies to all services)",
    )
    commission_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00")), MaxValueValidator(Decimal("100.00"))],
        help_text="Commission percentage (0-100)",
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this rule is currently active",
    )
    priority = models.IntegerField(
        default=0,
        help_text="Priority when multiple rules apply (higher = higher priority)",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "commission_rules"
        verbose_name = "Commission Rule"
        verbose_name_plural = "Commission Rules"
        ordering = ["-priority", "-created_at"]
        indexes = [
            models.Index(fields=["tenant", "is_active"]),
            models.Index(fields=["tenant", "professional"]),
            models.Index(fields=["tenant", "service"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["tenant", "professional", "service"],
                name="unique_commission_rule_per_tenant",
            )
        ]

    def __str__(self):
        parts = []
        if self.professional:
            parts.append(f"Professional: {self.professional.name}")
        if self.service:
            parts.append(f"Service: {self.service.name}")
        parts.append(f"{self.commission_percentage}%")
        return " - ".join(parts) if parts else f"Global Rule: {self.commission_percentage}%"


class Commission(TenantAwareModel):
    """
    Commission records for completed appointments.
    Automatically created when an appointment is marked as completed.
    """

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("cancelled", "Cancelled"),
    ]

    professional = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="commissions",
        help_text="Professional who earned this commission",
    )
    appointment = models.ForeignKey(
        "scheduling.Appointment",
        on_delete=models.CASCADE,
        related_name="commissions",
        help_text="Related appointment",
    )
    service = models.ForeignKey(
        "scheduling.Service",
        on_delete=models.CASCADE,
        related_name="commissions",
        help_text="Service provided",
    )
    rule = models.ForeignKey(
        CommissionRule,
        on_delete=models.SET_NULL,
        related_name="commissions",
        null=True,
        blank=True,
        help_text="Commission rule used to calculate this commission",
    )
    service_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Price of service at time of commission",
    )
    commission_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Commission percentage applied",
    )
    commission_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Calculated commission amount",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )
    date = models.DateField(
        help_text="Date when commission was earned",
    )
    paid_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When this commission was paid",
    )
    paid_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="commissions_paid",
        null=True,
        blank=True,
        help_text="User who marked this commission as paid",
    )
    notes = models.TextField(
        blank=True,
        help_text="Additional notes about this commission",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "commissions"
        verbose_name = "Commission"
        verbose_name_plural = "Commissions"
        ordering = ["-date", "-created_at"]
        indexes = [
            models.Index(fields=["tenant", "professional", "status"]),
            models.Index(fields=["tenant", "status", "date"]),
            models.Index(fields=["tenant", "appointment"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["tenant", "appointment", "service"],
                name="unique_commission_per_appointment_service",
            )
        ]

    def __str__(self):
        return (
            f"{self.professional.name} - "
            f"{self.service.name} - "
            f"R$ {self.commission_amount} ({self.get_status_display()})"
        )

    @property
    def is_pending(self):
        """Check if commission is pending."""
        return self.status == "pending"

    @property
    def is_paid(self):
        """Check if commission has been paid."""
        return self.status == "paid"

    @property
    def is_cancelled(self):
        """Check if commission was cancelled."""
        return self.status == "cancelled"
