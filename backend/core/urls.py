"""
URLs da app core (Multi-Tenant)
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import SignUpView, UserViewSet, TenantViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'tenants', TenantViewSet, basename='tenant')

urlpatterns = [
    # Auth endpoints
    path('auth/signup/', SignUpView.as_view(), name='signup'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Router URLs
    path('', include(router.urls)),
]
