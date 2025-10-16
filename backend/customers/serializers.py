"""
Serializers para o módulo de Clientes
"""
from rest_framework import serializers
from .models import Customer
from django.db import IntegrityError


class CustomerSerializer(serializers.ModelSerializer):
    """
    Serializer completo de Cliente
    Inclui campos calculados e relacionamentos
    """
    age = serializers.SerializerMethodField()
    full_address = serializers.SerializerMethodField()
    is_birthday_month = serializers.SerializerMethodField()
    total_appointments = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()
    
    class Meta:
        model = Customer
        fields = [
            'id',
            'name',
            'cpf',
            'email',
            'phone',
            'phone_secondary',
            'birth_date',
            'gender',
            'address_street',
            'address_number',
            'address_complement',
            'address_neighborhood',
            'address_city',
            'address_state',
            'address_zipcode',
            'full_address',
            'preferences',
            'notes',
            'tag',
            'avatar_url',
            'is_active',
            'last_visit',
            'age',
            'is_birthday_month',
            'total_appointments',
            'total_spent',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_visit']
    
    def get_age(self, obj):
        """Retorna idade calculada"""
        return obj.get_age()
    
    def get_full_address(self, obj):
        """Retorna endereço formatado"""
        return obj.get_full_address()
    
    def get_is_birthday_month(self, obj):
        """Verifica se faz aniversário este mês"""
        return obj.is_birthday_this_month()
    
    def get_total_appointments(self, obj):
        """Conta total de agendamentos do cliente"""
        return obj.appointments.count() if hasattr(obj, 'appointments') else 0
    
    def get_total_spent(self, obj):
        """Calcula total gasto pelo cliente"""
        if not hasattr(obj, 'appointments'):
            return 0.0
        
        total = 0.0
        for appointment in obj.appointments.filter(status='concluido'):
            if appointment.service_details and appointment.service_details.get('price'):
                try:
                    total += float(appointment.service_details['price'])
                except (ValueError, TypeError):
                    pass
        
        return round(total, 2)
    
    def validate_cpf(self, value):
        """Valida CPF único por tenant"""
        if value:
            # Remove formatação
            cpf_clean = value.replace('.', '').replace('-', '')
            
            # Verifica se já existe (exceto no próprio registro em caso de update)
            tenant = self.context['request'].user.tenant
            queryset = Customer.objects.filter(tenant=tenant, cpf=value)
            
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            
            if queryset.exists():
                raise serializers.ValidationError("Já existe um cliente com este CPF neste tenant.")
        
        return value
    
    def validate_phone(self, value):
        """Valida telefone obrigatório"""
        if not value or value.strip() == '':
            raise serializers.ValidationError("Telefone principal é obrigatório.")
        return value
    
    def create(self, validated_data):
        """Cria cliente com tratamento de erro de duplicidade"""
        try:
            # Adiciona tenant automaticamente
            validated_data['tenant'] = self.context['request'].user.tenant
            return super().create(validated_data)
        except IntegrityError as e:
            if 'unique_customer_cpf_per_tenant' in str(e):
                raise serializers.ValidationError({
                    'cpf': 'Já existe um cliente com este CPF.'
                })
            raise


class CustomerListSerializer(serializers.ModelSerializer):
    """
    Serializer resumido para listagem de clientes
    Retorna apenas campos essenciais para performance
    """
    age = serializers.SerializerMethodField()
    total_appointments = serializers.SerializerMethodField()
    
    class Meta:
        model = Customer
        fields = [
            'id',
            'name',
            'phone',
            'email',
            'tag',
            'avatar_url',
            'is_active',
            'last_visit',
            'age',
            'total_appointments',
            'created_at',
        ]
    
    def get_age(self, obj):
        return obj.get_age()
    
    def get_total_appointments(self, obj):
        return obj.appointments.count() if hasattr(obj, 'appointments') else 0


class CustomerStatsSerializer(serializers.Serializer):
    """
    Serializer para estatísticas do cliente
    """
    total_appointments = serializers.IntegerField()
    completed_appointments = serializers.IntegerField()
    cancelled_appointments = serializers.IntegerField()
    no_show_appointments = serializers.IntegerField()
    total_spent = serializers.DecimalField(max_digits=10, decimal_places=2)
    average_ticket = serializers.DecimalField(max_digits=10, decimal_places=2)
    first_visit = serializers.DateTimeField(allow_null=True)
    last_visit = serializers.DateTimeField(allow_null=True)
    favorite_service = serializers.CharField(allow_null=True)
    favorite_professional = serializers.CharField(allow_null=True)


class CreateCustomerSerializer(serializers.ModelSerializer):
    """
    Serializer simplificado para criação rápida
    Apenas campos essenciais
    """
    class Meta:
        model = Customer
        fields = [
            'name',
            'phone',
            'email',
            'birth_date',
            'gender',
            'tag',
            'preferences',
            'notes',
        ]
    
    def create(self, validated_data):
        """Cria cliente com tenant automático"""
        validated_data['tenant'] = self.context['request'].user.tenant
        return super().create(validated_data)
