"""
Serializers do módulo de Agendamentos
"""
from rest_framework import serializers
from django.db import IntegrityError
from .models import Service, Appointment
from core.serializers import UserSerializer


class ServiceSerializer(serializers.ModelSerializer):
    """Serializer para Service"""
    
    class Meta:
        model = Service
        fields = [
            'id', 'name', 'description', 'price', 
            'duration_minutes', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        """Adiciona o tenant automaticamente"""
        request = self.context.get('request')
        validated_data['tenant'] = request.user.tenant
        
        try:
            return super().create(validated_data)
        except IntegrityError:
            raise serializers.ValidationError({
                'name': 'Já existe um serviço com este nome.'
            })

    def update(self, instance, validated_data):
        """Atualiza serviço com validação de nome único"""
        try:
            return super().update(instance, validated_data)
        except IntegrityError:
            raise serializers.ValidationError({
                'name': 'Já existe um serviço com este nome.'
            })


class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer para Appointment"""
    service_details = ServiceSerializer(source='service', read_only=True)
    professional_details = UserSerializer(source='professional', read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'customer_name', 'customer_phone', 'customer_email',
            'service', 'service_details', 'professional', 'professional_details',
            'start_time', 'end_time', 'status', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'end_time', 'created_at', 'updated_at']

    def validate(self, data):
        """
        Valida que service e professional pertencem ao mesmo tenant
        Implementa: BLOCO 4 - Workflow: Criar Novo Agendamento
        """
        request = self.context.get('request')
        
        # Valida service
        if 'service' in data:
            if data['service'].tenant_id != request.user.tenant_id:
                raise serializers.ValidationError({
                    'service': 'O serviço não pertence à sua empresa.'
                })
        
        # Valida professional
        if 'professional' in data:
            if data['professional'].tenant_id != request.user.tenant_id:
                raise serializers.ValidationError({
                    'professional': 'O profissional não pertence à sua empresa.'
                })
        
        # TODO: Validar disponibilidade do horário
        # Verificar se o profissional já não tem outro agendamento no mesmo horário
        
        return data

    def create(self, validated_data):
        """Adiciona o tenant e created_by automaticamente"""
        request = self.context.get('request')
        validated_data['tenant'] = request.user.tenant
        validated_data['created_by'] = request.user
        return super().create(validated_data)


class CreateAppointmentSerializer(serializers.Serializer):
    """
    Serializer simplificado para criar agendamento
    Implementa: BLOCO 4 - Workflow: Criar Novo Agendamento
    """
    customer_name = serializers.CharField(required=True, max_length=255)
    customer_phone = serializers.CharField(required=False, max_length=20, allow_blank=True)
    customer_email = serializers.EmailField(required=False, allow_blank=True)
    service_id = serializers.UUIDField(required=True)
    professional_id = serializers.UUIDField(required=True)
    start_time = serializers.DateTimeField(required=True)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        """Valida os dados e busca os objetos relacionados"""
        request = self.context.get('request')
        tenant = request.user.tenant

        # Busca e valida service
        try:
            service = Service.objects.get(
                id=data['service_id'],
                tenant=tenant,
                is_active=True
            )
            data['service'] = service
        except Service.DoesNotExist:
            raise serializers.ValidationError({
                'service_id': 'Serviço não encontrado ou inativo.'
            })

        # Busca e valida professional
        from core.models import User
        try:
            professional = User.objects.get(
                id=data['professional_id'],
                tenant=tenant,
                is_active=True
            )
            data['professional'] = professional
        except User.DoesNotExist:
            raise serializers.ValidationError({
                'professional_id': 'Profissional não encontrado ou inativo.'
            })

        return data

    def create(self, validated_data):
        """Cria o agendamento"""
        request = self.context.get('request')
        
        # Remove os IDs pois já temos os objetos
        validated_data.pop('service_id', None)
        validated_data.pop('professional_id', None)
        
        # Cria o agendamento
        appointment = Appointment.objects.create(
            tenant=request.user.tenant,
            created_by=request.user,
            customer_name=validated_data['customer_name'],
            customer_phone=validated_data.get('customer_phone', ''),
            customer_email=validated_data.get('customer_email', ''),
            service=validated_data['service'],
            professional=validated_data['professional'],
            start_time=validated_data['start_time'],
            notes=validated_data.get('notes', ''),
            status='marcado'
        )
        
        return appointment
