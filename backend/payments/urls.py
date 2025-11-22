"""
URLs do app Payments
"""
from django.urls import path
from .views import SubscribeView, MercadoPagoWebhookView

app_name = 'payments'

urlpatterns = [
    # Endpoint de assinatura (escolher plano)
    path('subscribe/', SubscribeView.as_view(), name='subscribe'),
]
