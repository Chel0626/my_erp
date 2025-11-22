"""
URLs de Webhooks (separado para organização)
"""
from django.urls import path
from payments.views import MercadoPagoWebhookView

app_name = 'webhooks'

urlpatterns = [
    # Webhook do Mercado Pago
    path('mercadopago/', MercadoPagoWebhookView.as_view(), name='mercadopago'),
]
