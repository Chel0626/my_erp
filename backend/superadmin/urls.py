from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TenantViewSet,
    SubscriptionViewSet,
    PaymentHistoryViewSet,
    SystemErrorViewSet,
    TenantUsageStatsViewSet,
    DashboardViewSet,
)

router = DefaultRouter()
router.register(r'tenants', TenantViewSet, basename='superadmin-tenant')
router.register(r'subscriptions', SubscriptionViewSet, basename='superadmin-subscription')
router.register(r'payments', PaymentHistoryViewSet, basename='superadmin-payment')
router.register(r'errors', SystemErrorViewSet, basename='superadmin-error')
router.register(r'usage', TenantUsageStatsViewSet, basename='superadmin-usage')
router.register(r'dashboard', DashboardViewSet, basename='superadmin-dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
