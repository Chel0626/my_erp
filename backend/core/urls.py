"""
URLs da app core (Multi-Tenant)
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    SignUpView,
    UserViewSet,
    TenantViewSet,
    GoogleOAuthLoginView,
    TenantCertificateView,
)
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
    # Auth endpoints - usando dj-rest-auth
    path('auth/', include('dj_rest_auth.urls')),  # Inclui login, logout, user, password reset
    path('auth/signup/', SignUpView.as_view(), name='signup'),
    path('auth/google/', GoogleOAuthLoginView.as_view(), name='google-oauth'),
    
    # Tenant Certificate Management
    path('tenants/certificate/upload/', TenantCertificateView.as_view(), name='tenant-certificate-upload'),
    path('tenants/certificate/info/', TenantCertificateView.as_view(), name='tenant-certificate-info'),
    path('tenants/certificate/remove/', TenantCertificateView.as_view(), name='tenant-certificate-remove'),
    
    # Health Check & Monitoring
    path('health/', health_check, name='health-check'),
    path('sentry-test/', sentry_test_error, name='sentry-test-error'),
    path('sentry-test-warning/', sentry_test_warning, name='sentry-test-warning'),
    path('sentry-test-event/', sentry_test_custom_event, name='sentry-test-event'),
    
    # Router URLs
    path('', include(router.urls)),
]
