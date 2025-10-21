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
    
    # Campos do cliente (read-only, vêm do FK customer ou direto)
    customer_id = serializers.SerializerMethodField()
    customer_full_info = serializers.SerializerMethodField()
    
    # Preço e status de pagamento
    final_price = serializers.SerializerMethodField()
    is_paid = serializers.SerializerMethodField()
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'customer', 'customer_id', 'customer_name', 'customer_phone', 'customer_email',
            'customer_full_info', 'service', 'service_details', 'professional', 'professional_details',
            'start_time', 'end_time', 'price', 'final_price', 'is_paid',
            'status', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'end_time', 'created_at', 'updated_at', 'customer_id', 'customer_full_info', 'final_price', 'is_paid']
    
    def get_customer_id(self, obj):
        """Retorna ID do cliente se vinculado"""
        return str(obj.customer.id) if obj.customer else None

    def get_customer_full_info(self, obj):
        """Retorna informações completas do cliente se vinculado"""
        if obj.customer:
            return {
                'id': str(obj.customer.id),
                'name': obj.customer.name,
                'phone': obj.customer.phone,
                'email': obj.customer.email,
                'tag': obj.customer.tag,
            }
        return None

    def get_final_price(self, obj):
        """Retorna preço final do agendamento"""
        try:
            return obj.get_final_price()
        except Exception:
            return obj.price if hasattr(obj, 'price') and obj.price else 0

    def get_is_paid(self, obj):
        """Retorna se o agendamento está pago"""
        try:
            return obj.is_paid()
        except Exception:
            return False

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
        
        # Valida customer (se fornecido)
        if 'customer' in data and data['customer']:
            if data['customer'].tenant_id != request.user.tenant_id:
                raise serializers.ValidationError({
                    'customer': 'O cliente não pertence à sua empresa.'
                })
        
        # Se tem customer vinculado, não precisa customer_name manual
        # (será preenchido automaticamente pelo save do model)
        
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
    Aceita customer_id OU dados do cliente
    """
    # Cliente - ou ID de cliente existente, ou dados para novo
    customer_id = serializers.UUIDField(required=False, allow_null=True)
    customer_name = serializers.CharField(required=False, max_length=255)
    customer_phone = serializers.CharField(required=False, max_length=20, allow_blank=True)
    customer_email = serializers.EmailField(required=False, allow_blank=True)
    
    # Dados do agendamento
    service_id = serializers.UUIDField(required=True)
    professional_id = serializers.UUIDField(required=True)
    start_time = serializers.DateTimeField(required=True)
    price = serializers.DecimalField(required=False, max_digits=10, decimal_places=2, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        """Valida os dados e busca os objetos relacionados"""
        request = self.context.get('request')
        tenant = request.user.tenant
        
        # Valida cliente: ou customer_id OU customer_name
        if data.get('customer_id'):
            # Busca cliente existente
            from customers.models import Customer
            try:
                customer = Customer.objects.get(
                    id=data['customer_id'],
                    tenant=tenant
                )
                data['customer'] = customer
                # Remove campos manuais se fornecidos (customer FK prevalece)
                data.pop('customer_name', None)
                data.pop('customer_phone', None)
                data.pop('customer_email', None)
            except Customer.DoesNotExist:
                raise serializers.ValidationError({
                    'customer_id': 'Cliente não encontrado.'
                })
        elif data.get('customer_name'):
            # Usa dados manuais do cliente
            pass
        else:
            raise serializers.ValidationError({
                'customer': 'Informe customer_id ou customer_name.'
            })

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
        validated_data.pop('customer_id', None)
        
        # Prepara dados do agendamento
        appointment_data = {
            'tenant': request.user.tenant,
            'created_by': request.user,
            'service': validated_data['service'],
            'professional': validated_data['professional'],
            'start_time': validated_data['start_time'],
            'notes': validated_data.get('notes', ''),
            'status': 'marcado',
        }
        
        # Adiciona customer (FK) se existe
        if 'customer' in validated_data:
            appointment_data['customer'] = validated_data['customer']
        else:
            # Dados manuais do cliente
            appointment_data['customer_name'] = validated_data.get('customer_name', '')
            appointment_data['customer_phone'] = validated_data.get('customer_phone', '')
            appointment_data['customer_email'] = validated_data.get('customer_email', '')
        
        # Adiciona price se fornecido
        if 'price' in validated_data:
            appointment_data['price'] = validated_data['price']
        
        # Cria o agendamento (save() vai preencher customer_name automaticamente se tem customer)
        appointment = Appointment.objects.create(**appointment_data)
        
        return appointment
