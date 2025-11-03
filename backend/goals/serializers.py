from rest_framework import serializers
from .models import Goal, GoalProgress
from core.serializers import UserSerializer


class GoalProgressSerializer(serializers.ModelSerializer):
    """Serializer para progresso da meta"""
    
    class Meta:
        model = GoalProgress
        fields = [
            'id', 'goal', 'date', 'value', 'percentage', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'percentage', 'created_at', 'updated_at']


class GoalSerializer(serializers.ModelSerializer):
    """Serializer para visualização de meta"""
    
    user_details = UserSerializer(source='user', read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    target_type_display = serializers.CharField(source='get_target_type_display', read_only=True)
    period_display = serializers.CharField(source='get_period_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    percentage = serializers.SerializerMethodField()
    progress_data = serializers.SerializerMethodField()
    
    class Meta:
        model = Goal
        fields = [
            'id', 'user', 'user_details', 'name', 'description',
            'type', 'type_display', 'target_type', 'target_type_display',
            'target_value', 'current_value', 'percentage',
            'period', 'period_display', 'start_date', 'end_date',
            'status', 'status_display', 'progress_data',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'current_value', 'created_at', 'updated_at']
    
    def get_percentage(self, obj):
        return round(obj.percentage(), 2)
    
    def get_progress_data(self, obj):
        """Dados para gráfico de progresso"""
        progress = obj.progress_history.all()[:30]  # Últimos 30 registros
        return [
            {
                'date': p.date.strftime('%Y-%m-%d'),
                'value': float(p.value),
                'percentage': round(p.percentage, 2)
            }
            for p in reversed(list(progress))
        ]


class GoalCreateSerializer(serializers.ModelSerializer):
    """Serializer para criação/atualização de meta"""
    
    class Meta:
        model = Goal
        fields = [
            'user', 'name', 'description', 'type', 'target_type',
            'target_value', 'period', 'start_date', 'end_date'
        ]
    
    def validate(self, data):
        # Validação: data fim deve ser maior que data início
        if data.get('end_date') and data.get('start_date'):
            if data['end_date'] <= data['start_date']:
                raise serializers.ValidationError(
                    'Data de fim deve ser posterior à data de início.'
                )
        
        # Validação: meta individual deve ter usuário
        if data.get('type') == 'individual' and not data.get('user'):
            raise serializers.ValidationError(
                'Meta individual deve ter um profissional associado.'
            )
        
        # Validação: meta de equipe não deve ter usuário
        if data.get('type') == 'team' and data.get('user'):
            raise serializers.ValidationError(
                'Meta de equipe não deve ter profissional associado.'
            )
        
        # Validação: valor alvo deve ser maior que zero
        if data.get('target_value') and data['target_value'] <= 0:
            raise serializers.ValidationError(
                'Valor alvo deve ser maior que zero.'
            )
        
        return data
    
    def create(self, validated_data):
        request = self.context.get('request')
        
        goal = Goal.objects.create(
            tenant=request.user.tenant,
            status='active',
            **validated_data
        )
        
        # Calcula valor inicial
        goal.calculate_current_value()
        
        # Cria primeiro registro de progresso
        GoalProgress.objects.create(
            tenant=request.user.tenant,
            goal=goal,
            date=goal.start_date,
            value=goal.current_value,
            notes='Meta criada'
        )
        
        return goal


class GoalUpdateSerializer(serializers.ModelSerializer):
    """Serializer para atualizar progresso manual"""
    
    current_value = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=True
    )
    notes = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = Goal
        fields = ['current_value', 'notes']
    
    def update(self, instance, validated_data):
        notes = validated_data.pop('notes', '')
        current_value = validated_data['current_value']
        
        instance.update_progress(current_value)
        
        # Registra progresso
        from django.utils import timezone
        GoalProgress.objects.create(
            tenant=instance.tenant,
            goal=instance,
            date=timezone.now().date(),
            value=current_value,
            notes=notes
        )
        
        return instance
