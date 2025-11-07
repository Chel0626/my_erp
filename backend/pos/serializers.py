from rest_framework import serializers
from .models import Sale, SaleItem, CashRegister
from customers.serializers import CustomerSerializer
from core.serializers import UserSerializer
from inventory.models import Product
from scheduling.models import Service
from decimal import Decimal


class SaleItemSerializer(serializers.ModelSerializer):
    """Serializer para item da venda"""
    
    product_name = serializers.CharField(source='product.name', read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True)
    professional_name = serializers.CharField(source='professional.get_full_name', read_only=True)
    item_name = serializers.SerializerMethodField()
    
    class Meta:
        model = SaleItem
        fields = [
            'id', 'product', 'product_name', 'service', 'service_name',
            'professional', 'professional_name', 'item_name',
            'quantity', 'unit_price', 'discount', 'total'
        ]
        read_only_fields = ['id', 'total']
    
    def get_item_name(self, obj):
        return obj.product.name if obj.product else obj.service.name


class SaleSerializer(serializers.ModelSerializer):
    """Serializer para visualização de venda"""
    
    items = SaleItemSerializer(many=True, read_only=True)
    customer_details = CustomerSerializer(source='customer', read_only=True)
    user_details = UserSerializer(source='user', read_only=True)
    cash_register_id = serializers.IntegerField(source='cash_register.id', read_only=True)
    
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    
    class Meta:
        model = Sale
        fields = [
            'id', 'cash_register', 'cash_register_id', 'customer', 'customer_details',
            'user', 'user_details', 'date', 'subtotal', 'discount', 'total',
            'payment_method', 'payment_method_display',
            'payment_status', 'payment_status_display',
            'notes', 'items'
        ]
        read_only_fields = ['id', 'date', 'user', 'subtotal', 'total']


class SaleItemCreateSerializer(serializers.ModelSerializer):
    """Serializer para criação de item"""
    
    class Meta:
        model = SaleItem
        fields = [
            'product', 'service', 'professional',
            'quantity', 'unit_price', 'discount'
        ]
    
    def validate(self, data):
        # Validação: produto OU serviço
        if not data.get('product') and not data.get('service'):
            raise serializers.ValidationError('Item deve ter um produto ou serviço.')
        
        if data.get('product') and data.get('service'):
            raise serializers.ValidationError('Item não pode ter produto e serviço ao mesmo tempo.')
        
        # Validação: se for produto, verificar estoque
        if data.get('product'):
            product = data['product']
            quantity = data.get('quantity', Decimal('1'))
            
            # Garante que stock_quantity existe (proteção para produtos antigos)
            stock = getattr(product, 'stock_quantity', 0)
            
            if stock < quantity:
                raise serializers.ValidationError(
                    f'Estoque insuficiente para {product.name}. '
                    f'Disponível: {stock}, Solicitado: {quantity}'
                )
        
        return data


class SaleCreateSerializer(serializers.ModelSerializer):
    """Serializer para criação de venda"""
    
    items = SaleItemCreateSerializer(many=True)
    
    class Meta:
        model = Sale
        fields = [
            'customer', 'discount', 'payment_method',
            'payment_status', 'notes', 'items'
        ]
    
    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError('Venda deve ter pelo menos um item.')
        return items
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        request = self.context.get('request')
        
        # Busca caixa aberto do usuário
        cash_register = CashRegister.objects.filter(
            tenant=request.user.tenant,
            user=request.user,
            status='open'
        ).first()
        
        if not cash_register:
            raise serializers.ValidationError('Não há caixa aberto para este usuário.')
        
        # Cria venda
        sale = Sale.objects.create(
            tenant=request.user.tenant,
            cash_register=cash_register,
            user=request.user,
            **validated_data
        )
        
        # Cria items e atualiza estoque
        for item_data in items_data:
            item = SaleItem.objects.create(
                tenant=request.user.tenant,
                sale=sale,
                **item_data
            )
            
            # Atualiza estoque se for produto
            if item.product:
                product = item.product
                # Garante que stock_quantity existe (proteção para produtos antigos)
                current_stock = getattr(product, 'stock_quantity', 0)
                product.stock_quantity = current_stock - item.quantity
                product.save()
        
        # Recalcula total da venda
        sale.calculate_total()
        
        # Gera comissões
        if sale.payment_status == 'paid':
            sale.generate_commissions()
        
        return sale


class CashRegisterSerializer(serializers.ModelSerializer):
    """Serializer para caixa"""
    
    user_details = UserSerializer(source='user', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    total_sales = serializers.SerializerMethodField()
    total_sales_count = serializers.SerializerMethodField()
    payment_breakdown = serializers.SerializerMethodField()
    
    class Meta:
        model = CashRegister
        fields = [
            'id', 'user', 'user_details', 'opened_at', 'closed_at',
            'opening_balance', 'closing_balance', 'expected_balance',
            'difference', 'status', 'status_display', 'notes',
            'total_sales', 'total_sales_count', 'payment_breakdown'
        ]
        read_only_fields = [
            'id', 'opened_at', 'closed_at', 'user',
            'expected_balance', 'difference'
        ]
    
    def get_total_sales(self, obj):
        """Total de vendas pagas no caixa"""
        from django.db.models import Sum
        return obj.sales.filter(payment_status='paid').aggregate(
            total=Sum('total')
        )['total'] or Decimal('0')
    
    def get_total_sales_count(self, obj):
        """Quantidade de vendas"""
        return obj.sales.count()
    
    def get_payment_breakdown(self, obj):
        """Breakdown por forma de pagamento"""
        from django.db.models import Sum
        
        breakdown = {}
        for method, label in Sale.PAYMENT_METHOD_CHOICES:
            total = obj.sales.filter(
                payment_method=method,
                payment_status='paid'
            ).aggregate(total=Sum('total'))['total'] or Decimal('0')
            
            if total > 0:
                breakdown[method] = {
                    'label': label,
                    'total': float(total)
                }
        
        return breakdown


class CashRegisterCreateSerializer(serializers.ModelSerializer):
    """Serializer para abrir caixa"""
    
    class Meta:
        model = CashRegister
        fields = ['opening_balance', 'notes']
    
    def validate(self, data):
        request = self.context.get('request')
        
        # Validação: usuário não pode ter mais de um caixa aberto
        open_register = CashRegister.objects.filter(
            tenant=request.user.tenant,
            user=request.user,
            status='open'
        ).exists()
        
        if open_register:
            raise serializers.ValidationError('Você já possui um caixa aberto.')
        
        return data
    
    def create(self, validated_data):
        request = self.context.get('request')
        
        cash_register = CashRegister.objects.create(
            tenant=request.user.tenant,
            user=request.user,
            status='open',
            **validated_data
        )
        
        return cash_register


class CashRegisterCloseSerializer(serializers.Serializer):
    """Serializer para fechar caixa"""
    
    closing_balance = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=Decimal('0')
    )
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        cash_register = self.instance
        
        if cash_register.status == 'closed':
            raise serializers.ValidationError('Este caixa já está fechado.')
        
        return data
    
    def update(self, instance, validated_data):
        from django.utils import timezone
        
        instance.closing_balance = validated_data['closing_balance']
        instance.notes = validated_data.get('notes', instance.notes)
        instance.closed_at = timezone.now()
        instance.status = 'closed'
        
        # Calcula saldo esperado e diferença
        instance.calculate_expected_balance()
        instance.calculate_difference()
        
        instance.save()
        return instance
