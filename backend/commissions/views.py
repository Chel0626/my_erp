"""
Views for the commissions app.
"""

from datetime import datetime
from decimal import Decimal

from django.db.models import Count, Q, Sum
from django.utils import timezone
from django_filters import rest_framework as django_filters
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from core.permissions import IsSameTenant

from .models import Commission, CommissionRule
from .serializers import (
    CommissionSerializer,
    CommissionSummarySerializer,
    CommissionRuleSerializer,
    CreateCommissionRuleSerializer,
    CreateCommissionSerializer,
    MarkCommissionPaidSerializer,
)


class CommissionRuleFilter(django_filters.FilterSet):
    """Filter for commission rules."""

    is_active = django_filters.BooleanFilter()
    professional = django_filters.NumberFilter()
    service = django_filters.NumberFilter()

    class Meta:
        model = CommissionRule
        fields = ["is_active", "professional", "service"]


class CommissionRuleViewSet(viewsets.ModelViewSet):
    """ViewSet for commission rules."""

    queryset = CommissionRule.objects.all()
    permission_classes = [IsSameTenant]
    filter_backends = [django_filters.DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = CommissionRuleFilter
    ordering_fields = ["priority", "created_at", "commission_percentage"]
    ordering = ["-priority", "-created_at"]

    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action in ["create", "update", "partial_update"]:
            return CreateCommissionRuleSerializer
        return CommissionRuleSerializer

    @action(detail=False, methods=["get"])
    def active(self, request):
        """Get only active commission rules."""
        queryset = self.filter_queryset(self.queryset.filter(is_active=True))
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def by_professional(self, request):
        """Get commission rules for a specific professional."""
        professional_id = request.query_params.get("professional_id")
        if not professional_id:
            return Response(
                {"error": "professional_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        queryset = self.filter_queryset(
            self.queryset.filter(
                Q(professional_id=professional_id) | Q(professional__isnull=True),
                is_active=True,
            )
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class CommissionFilter(django_filters.FilterSet):
    """Filter for commissions."""

    status = django_filters.ChoiceFilter(choices=Commission.STATUS_CHOICES)
    professional = django_filters.NumberFilter()
    date_from = django_filters.DateFilter(field_name="date", lookup_expr="gte")
    date_to = django_filters.DateFilter(field_name="date", lookup_expr="lte")

    class Meta:
        model = Commission
        fields = ["status", "professional", "date_from", "date_to"]


class CommissionViewSet(viewsets.ModelViewSet):
    """ViewSet for commissions."""

    queryset = Commission.objects.select_related(
        "professional", "appointment", "service", "rule", "paid_by"
    )
    permission_classes = [IsSameTenant]
    filter_backends = [
        django_filters.DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = CommissionFilter
    search_fields = ["professional__first_name", "professional__last_name", "service__name"]
    ordering_fields = ["date", "commission_amount", "created_at"]
    ordering = ["-date", "-created_at"]

    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action in ["create", "update", "partial_update"]:
            return CreateCommissionSerializer
        elif self.action == "mark_as_paid":
            return MarkCommissionPaidSerializer
        elif self.action == "summary":
            return CommissionSummarySerializer
        return CommissionSerializer

    @action(detail=False, methods=["get"])
    def pending(self, request):
        """Get pending commissions."""
        queryset = self.filter_queryset(self.queryset.filter(status="pending"))
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def by_professional(self, request):
        """Get commissions for a specific professional."""
        professional_id = request.query_params.get("professional_id")
        if not professional_id:
            return Response(
                {"error": "professional_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        queryset = self.filter_queryset(
            self.queryset.filter(professional_id=professional_id)
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def by_period(self, request):
        """Get commissions for a specific period."""
        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")

        if not date_from or not date_to:
            return Response(
                {"error": "date_from and date_to are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            date_from = datetime.strptime(date_from, "%Y-%m-%d").date()
            date_to = datetime.strptime(date_to, "%Y-%m-%d").date()
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        queryset = self.filter_queryset(
            self.queryset.filter(date__gte=date_from, date__lte=date_to)
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def summary(self, request):
        """Get commission summary statistics."""
        queryset = self.filter_queryset(self.queryset)

        summary = queryset.aggregate(
            total_pending=Sum(
                "commission_amount", filter=Q(status="pending"), default=Decimal("0.00")
            ),
            total_paid=Sum(
                "commission_amount", filter=Q(status="paid"), default=Decimal("0.00")
            ),
            total_cancelled=Sum(
                "commission_amount", filter=Q(status="cancelled"), default=Decimal("0.00")
            ),
            count_pending=Count("id", filter=Q(status="pending")),
            count_paid=Count("id", filter=Q(status="paid")),
            count_cancelled=Count("id", filter=Q(status="cancelled")),
        )

        serializer = self.get_serializer(summary)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def professional_performance(self, request):
        """
        Get commission performance by professional.
        Returns aggregated data: total commissions, paid, pending, etc.
        Query params: date_from, date_to
        """
        from core.models import User
        
        # Obter parâmetros
        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")
        
        queryset = self.filter_queryset(self.queryset)
        
        # Filtrar por período se fornecido
        if date_from and date_to:
            try:
                date_from_obj = datetime.strptime(date_from, "%Y-%m-%d").date()
                date_to_obj = datetime.strptime(date_to, "%Y-%m-%d").date()
                queryset = queryset.filter(date__gte=date_from_obj, date__lte=date_to_obj)
            except ValueError:
                return Response(
                    {"error": "Invalid date format. Use YYYY-MM-DD"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        
        # Buscar todos os profissionais do tenant
        professionals = User.objects.filter(tenant=request.user.tenant)
        
        result = []
        for professional in professionals:
            # Comissões do profissional
            prof_commissions = queryset.filter(professional=professional)
            
            total_commissions = prof_commissions.count()
            
            # Agregar por status
            aggregates = prof_commissions.aggregate(
                total_paid=Sum("commission_amount", filter=Q(status="paid"), default=Decimal("0.00")),
                total_pending=Sum("commission_amount", filter=Q(status="pending"), default=Decimal("0.00")),
                total_cancelled=Sum("commission_amount", filter=Q(status="cancelled"), default=Decimal("0.00")),
                count_paid=Count("id", filter=Q(status="paid")),
                count_pending=Count("id", filter=Q(status="pending")),
                count_cancelled=Count("id", filter=Q(status="cancelled")),
            )
            
            # Taxa de conclusão (pago vs total)
            completion_rate = 0
            if total_commissions > 0:
                completion_rate = (aggregates["count_paid"] / total_commissions) * 100
            
            result.append({
                "professional_id": str(professional.id),
                "professional_name": professional.name,
                "professional_email": professional.email,
                "total_commissions": total_commissions,
                "count_paid": aggregates["count_paid"],
                "count_pending": aggregates["count_pending"],
                "count_cancelled": aggregates["count_cancelled"],
                "total_paid": float(aggregates["total_paid"]),
                "total_pending": float(aggregates["total_pending"]),
                "total_cancelled": float(aggregates["total_cancelled"]),
                "completion_rate": round(completion_rate, 2),
                "total_amount": float(
                    aggregates["total_paid"] 
                    + aggregates["total_pending"] 
                    + aggregates["total_cancelled"]
                ),
            })
        
        # Ordenar por total pago (maior para menor)
        result.sort(key=lambda x: x["total_paid"], reverse=True)
        
        return Response(result)

    @action(detail=False, methods=["post"])
    def mark_as_paid(self, request):
        """Mark multiple commissions as paid."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        commission_ids = serializer.validated_data["commission_ids"]
        notes = serializer.validated_data.get("notes", "")

        # Get commissions
        commissions = self.queryset.filter(id__in=commission_ids, status="pending")

        if not commissions.exists():
            return Response(
                {"error": "No pending commissions found with the provided IDs"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Update commissions
        updated_count = commissions.update(
            status="paid",
            paid_at=timezone.now(),
            paid_by=request.user,
            notes=notes if notes else "",
        )

        return Response(
            {
                "message": f"{updated_count} commission(s) marked as paid",
                "updated_count": updated_count,
            }
        )

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        """Cancel a specific commission."""
        commission = self.get_object()

        if commission.status == "paid":
            return Response(
                {"error": "Cannot cancel a paid commission"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        commission.status = "cancelled"
        commission.notes = request.data.get("notes", commission.notes)
        commission.save()

        serializer = self.get_serializer(commission)
        return Response(serializer.data)
