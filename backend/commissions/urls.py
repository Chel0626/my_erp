"""
URL configuration for commissions app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import CommissionRuleViewSet, CommissionViewSet

app_name = "commissions"

router = DefaultRouter()
router.register(r"rules", CommissionRuleViewSet, basename="commission-rule")
router.register(r"", CommissionViewSet, basename="commission")

urlpatterns = [
    path("", include(router.urls)),
]
