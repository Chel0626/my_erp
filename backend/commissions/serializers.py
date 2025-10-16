"""
Serializers for the commissions app.
"""

from decimal import Decimal

from rest_framework import serializers

from .models import Commission, CommissionRule


class CommissionRuleSerializer(serializers.ModelSerializer):
    """Serializer for commission rules."""

    professional_name = serializers.CharField(
        source="professional.get_full_name", read_only=True
    )
    service_name = serializers.CharField(source="service.name", read_only=True)

    class Meta:
        model = CommissionRule
        fields = [
            "id",
            "professional",
            "professional_name",
            "service",
            "service_name",
            "commission_percentage",
            "is_active",
            "priority",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class CreateCommissionRuleSerializer(serializers.ModelSerializer):
    """Serializer for creating commission rules."""

    class Meta:
        model = CommissionRule
        fields = [
            "professional",
            "service",
            "commission_percentage",
            "is_active",
            "priority",
        ]

    def validate_commission_percentage(self, value):
        """Validate commission percentage is between 0 and 100."""
        if value < Decimal("0.00") or value > Decimal("100.00"):
            raise serializers.ValidationError(
                "Commission percentage must be between 0 and 100."
            )
        return value

    def validate(self, data):
        """Validate that rule doesn't create a duplicate."""
        professional = data.get("professional")
        service = data.get("service")

        # Check if rule already exists for this combination
        existing = CommissionRule.objects.filter(
            tenant=self.context["request"].tenant,
            professional=professional,
            service=service,
        )

        # Exclude current instance when updating
        if self.instance:
            existing = existing.exclude(pk=self.instance.pk)

        if existing.exists():
            raise serializers.ValidationError(
                "A commission rule already exists for this professional and service combination."
            )

        return data


class CommissionSerializer(serializers.ModelSerializer):
    """Serializer for commissions."""

    professional_name = serializers.CharField(
        source="professional.get_full_name", read_only=True
    )
    service_name = serializers.CharField(source="service.name", read_only=True)
    paid_by_name = serializers.CharField(
        source="paid_by.get_full_name", read_only=True, allow_null=True
    )
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Commission
        fields = [
            "id",
            "professional",
            "professional_name",
            "appointment",
            "service",
            "service_name",
            "rule",
            "service_price",
            "commission_percentage",
            "commission_amount",
            "status",
            "status_display",
            "date",
            "paid_at",
            "paid_by",
            "paid_by_name",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "commission_amount",
            "paid_at",
            "paid_by",
            "created_at",
            "updated_at",
        ]


class CreateCommissionSerializer(serializers.ModelSerializer):
    """Serializer for creating commissions."""

    class Meta:
        model = Commission
        fields = [
            "professional",
            "appointment",
            "service",
            "rule",
            "service_price",
            "commission_percentage",
            "date",
            "notes",
        ]

    def validate(self, data):
        """Validate and calculate commission amount."""
        service_price = data.get("service_price")
        commission_percentage = data.get("commission_percentage")

        # Calculate commission amount
        commission_amount = (service_price * commission_percentage) / Decimal("100.00")
        data["commission_amount"] = commission_amount

        return data


class MarkCommissionPaidSerializer(serializers.Serializer):
    """Serializer for marking commissions as paid."""

    commission_ids = serializers.ListField(
        child=serializers.IntegerField(), allow_empty=False
    )
    notes = serializers.CharField(required=False, allow_blank=True)


class CommissionSummarySerializer(serializers.Serializer):
    """Serializer for commission summary statistics."""

    total_pending = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_paid = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_cancelled = serializers.DecimalField(max_digits=10, decimal_places=2)
    count_pending = serializers.IntegerField()
    count_paid = serializers.IntegerField()
    count_cancelled = serializers.IntegerField()
