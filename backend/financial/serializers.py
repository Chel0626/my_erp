"""
Serializers do módulo Financeiro
"""
from rest_framework import serializers
from django.db import IntegrityError
from decimal import Decimal
from .models import PaymentMethod, Transaction, CashFlow


class PaymentMethodSerializer(serializers.ModelSerializer):
    """Serializer para PaymentMethod"""
    
    class Meta:
        model = PaymentMethod
        fields = ['id', 'name', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        """Adiciona o tenant automaticamente"""
        request = self.context.get('request')
        validated_data['tenant'] = request.user.tenant
        
        try:
            return super().create(validated_data)
        except IntegrityError:
            raise serializers.ValidationError({
                'name': 'Já existe um método de pagamento com este nome.'
            })

    def update(self, instance, validated_data):
        """Atualiza método de pagamento com validação de nome único"""
        try:
            return super().update(instance, validated_data)
        except IntegrityError:
            raise serializers.ValidationError({
                'name': 'Já existe um método de pagamento com este nome.'
            })


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer para Transaction"""
    payment_method_details = PaymentMethodSerializer(source='payment_method', read_only=True)
    appointment_details = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.email', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'type', 'description', 'amount', 'date',
            'payment_method', 'payment_method_details',
            'appointment', 'appointment_details',
            'notes', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def validate(self, data):
        """Valida que payment_method e appointment pertencem ao mesmo tenant"""
        request = self.context.get('request')
        
        # Valida payment_method
        if 'payment_method' in data:
            if data['payment_method'].tenant_id != request.user.tenant_id:
                raise serializers.ValidationError({
                    'payment_method': 'O método de pagamento não pertence à sua empresa.'
                })
        
        # Valida appointment (se fornecido)
        if 'appointment' in data and data['appointment']:
            if data['appointment'].tenant_id != request.user.tenant_id:
                raise serializers.ValidationError({
                    'appointment': 'O agendamento não pertence à sua empresa.'
                })
        
        return data

    def get_appointment_details(self, obj):
        """Retorna detalhes básicos do agendamento se houver"""
        if obj.appointment:
            return {
                'id': str(obj.appointment.id),
                'customer_name': obj.appointment.customer_name,
                'start_time': obj.appointment.start_time.isoformat() if obj.appointment.start_time else None,
                'status': obj.appointment.status,
            }
        return None

    def create(self, validated_data):
        """Adiciona o tenant e created_by automaticamente"""
        request = self.context.get('request')
        validated_data['tenant'] = request.user.tenant
        validated_data['created_by'] = request.user
        return super().create(validated_data)


class CreateTransactionSerializer(serializers.Serializer):
    """Serializer simplificado para criar transação"""
    type = serializers.ChoiceField(choices=['receita', 'despesa'], required=True)
    description = serializers.CharField(required=True, max_length=255)
    amount = serializers.DecimalField(required=True, max_digits=10, decimal_places=2, min_value=Decimal('0.01'))
    date = serializers.DateField(required=True)
    payment_method_id = serializers.UUIDField(required=True)
    appointment_id = serializers.UUIDField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        """Valida os dados e busca os objetos relacionados"""
        request = self.context.get('request')
        tenant = request.user.tenant

        # Busca e valida payment_method
        try:
            payment_method = PaymentMethod.objects.get(
                id=data['payment_method_id'],
                tenant=tenant,
                is_active=True
            )
            data['payment_method'] = payment_method
        except PaymentMethod.DoesNotExist:
            raise serializers.ValidationError({
                'payment_method_id': 'Método de pagamento não encontrado ou inativo.'
            })

        # Busca e valida appointment (se fornecido)
        if data.get('appointment_id'):
            from scheduling.models import Appointment
            try:
                appointment = Appointment.objects.get(
                    id=data['appointment_id'],
                    tenant=tenant
                )
                data['appointment'] = appointment
            except Appointment.DoesNotExist:
                raise serializers.ValidationError({
                    'appointment_id': 'Agendamento não encontrado.'
                })

        return data

    def create(self, validated_data):
        """Cria a transação"""
        request = self.context.get('request')
        
        # Remove os IDs pois já temos os objetos
        validated_data.pop('payment_method_id', None)
        validated_data.pop('appointment_id', None)
        
        # Cria a transação
        transaction = Transaction.objects.create(
            tenant=request.user.tenant,
            created_by=request.user,
            type=validated_data['type'],
            description=validated_data['description'],
            amount=validated_data['amount'],
            date=validated_data['date'],
            payment_method=validated_data['payment_method'],
            appointment=validated_data.get('appointment'),
            notes=validated_data.get('notes', '')
        )
        
        return transaction


class CashFlowSerializer(serializers.ModelSerializer):
    """Serializer para CashFlow"""
    
    class Meta:
        model = CashFlow
        fields = [
            'id', 'date', 'total_revenue', 'total_expenses',
            'balance', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'total_revenue', 'total_expenses', 'balance', 'created_at', 'updated_at']
