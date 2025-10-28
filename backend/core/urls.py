"""
URLs da app core (Multi-Tenant)
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import SignUpView, UserViewSet, TenantViewSet
from .health_views import (
    health_check,
    sentry_test_error,
    sentry_test_warning,
    sentry_test_custom_event
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'tenants', TenantViewSet, basename='tenant')

urlpatterns = [
    # Auth endpoints
    path('auth/signup/', SignUpView.as_view(), name='signup'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Health Check & Monitoring
    path('health/', health_check, name='health-check'),
    path('sentry-test/', sentry_test_error, name='sentry-test-error'),
    path('sentry-test-warning/', sentry_test_warning, name='sentry-test-warning'),
    path('sentry-test-event/', sentry_test_custom_event, name='sentry-test-event'),
    
    # Router URLs
    path('', include(router.urls)),
]
