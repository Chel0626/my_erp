"""
Serializers do Módulo de Inventário
"""
from rest_framework import serializers
from django.db import IntegrityError
from .models import Product, StockMovement


class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer completo de Produto
    """
    profit_margin = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    stock_status = serializers.ReadOnlyField()
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'category', 'category_display',
            'cost_price', 'sale_price', 'profit_margin',
            'stock_quantity', 'min_stock', 'is_low_stock', 'stock_status',
            'barcode', 'sku', 'image_url',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CreateProductSerializer(serializers.ModelSerializer):
    """
    Serializer para criar/atualizar produto
    """
    class Meta:
        model = Product
        fields = [
            'name', 'description', 'category',
            'cost_price', 'sale_price',
            'stock_quantity', 'min_stock',
            'barcode', 'sku', 'image_url',
            'is_active'
        ]
    
    def validate(self, attrs):
        """
        Validações customizadas
        """
        # Validar preço de venda maior que custo
        if attrs.get('sale_price') and attrs.get('cost_price'):
            if attrs['sale_price'] < attrs['cost_price']:
                raise serializers.ValidationError({
                    'sale_price': 'Preço de venda deve ser maior ou igual ao preço de custo'
                })
        
        return attrs
    
    def create(self, validated_data):
        """
        Cria produto com tenant do usuário autenticado
        """
        request = self.context.get('request')
        validated_data['tenant'] = request.user.tenant
        
        try:
            return Product.objects.create(**validated_data)
        except IntegrityError:
            raise serializers.ValidationError({
                'name': 'Já existe um produto com este nome'
            })
    
    def update(self, instance, validated_data):
        """
        Atualiza produto (não permite mudar stock_quantity diretamente)
        """
        # Remove stock_quantity se vier no payload (deve usar StockMovement)
        validated_data.pop('stock_quantity', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        try:
            instance.save()
        except IntegrityError:
            raise serializers.ValidationError({
                'name': 'Já existe um produto com este nome'
            })
        
        return instance


class StockMovementSerializer(serializers.ModelSerializer):
    """
    Serializer completo de Movimentação
    """
    product_name = serializers.CharField(source='product.name', read_only=True)
    movement_type_display = serializers.CharField(
        source='get_movement_type_display',
        read_only=True
    )
    reason_display = serializers.CharField(
        source='get_reason_display',
        read_only=True
    )
    created_by_name = serializers.CharField(
        source='created_by.name',
        read_only=True,
        allow_null=True
    )
    
    class Meta:
        model = StockMovement
        fields = [
            'id', 'product', 'product_name',
            'movement_type', 'movement_type_display',
            'reason', 'reason_display',
            'quantity', 'stock_before', 'stock_after',
            'notes', 'transaction',
            'created_by', 'created_by_name', 'created_at'
        ]
        read_only_fields = [
            'id', 'stock_before', 'stock_after',
            'created_by', 'created_at'
        ]


class CreateStockMovementSerializer(serializers.ModelSerializer):
    """
    Serializer para criar movimentação de estoque
    """
    class Meta:
        model = StockMovement
        fields = [
            'product', 'movement_type', 'reason',
            'quantity', 'notes'
        ]
    
    def validate_product(self, value):
        """
        Valida se produto pertence ao mesmo tenant
        """
        request = self.context.get('request')
        if value.tenant != request.user.tenant:
            raise serializers.ValidationError('Produto não encontrado')
        return value
    
    def validate(self, attrs):
        """
        Validações de estoque
        """
        product = attrs.get('product')
        movement_type = attrs.get('movement_type')
        quantity = attrs.get('quantity')
        
        # Se for saída, valida se tem estoque suficiente
        if movement_type == 'saida':
            if product.stock_quantity < quantity:
                raise serializers.ValidationError({
                    'quantity': f'Estoque insuficiente. Disponível: {product.stock_quantity}'
                })
        
        return attrs
    
    def create(self, validated_data):
        """
        Cria movimentação com tenant e usuário
        """
        request = self.context.get('request')
        validated_data['tenant'] = request.user.tenant
        validated_data['created_by'] = request.user
        
        try:
            return StockMovement.objects.create(**validated_data)
        except ValueError as e:
            raise serializers.ValidationError({'quantity': str(e)})


class ProductSummarySerializer(serializers.Serializer):
    """
    Serializer para resumo de produtos
    """
    total_products = serializers.IntegerField()
    active_products = serializers.IntegerField()
    low_stock_products = serializers.IntegerField()
    out_of_stock_products = serializers.IntegerField()
    total_stock_value = serializers.DecimalField(max_digits=15, decimal_places=2)
