"""
URLs do módulo Financeiro
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentMethodViewSet, TransactionViewSet, CashFlowViewSet

router = DefaultRouter()
router.register(r'payment-methods', PaymentMethodViewSet, basename='payment-method')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'cash-flow', CashFlowViewSet, basename='cash-flow')

urlpatterns = [
    path('', include(router.urls)),
]
