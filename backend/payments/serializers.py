"""
Serializers para Payments (Mercado Pago)
"""
from rest_framework import serializers


class SubscribeSerializer(serializers.Serializer):
    """Serializer para criar assinatura (escolher plano)"""
    plan_id = serializers.ChoiceField(
        choices=['basico', 'profissional', 'premium'],
        required=True,
        help_text='ID do plano escolhido: basico, profissional ou premium'
    )


class WebhookSerializer(serializers.Serializer):
    """Serializer para validar webhook do Mercado Pago"""
    id = serializers.CharField(required=False)
    type = serializers.CharField(required=False)
    action = serializers.CharField(required=False)
    data = serializers.DictField(required=False)
