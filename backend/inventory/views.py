"""
Views do Módulo de Inventário
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Q, F, DecimalField
from django.db.models.functions import Coalesce
from core.permissions import IsSameTenant
from .models import Product, StockMovement
from .serializers import (
    ProductSerializer,
    CreateProductSerializer,
    StockMovementSerializer,
    CreateStockMovementSerializer,
    ProductSummarySerializer
)


class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar Produtos
    
    Endpoints:
    - GET /api/inventory/products/ - Listar produtos
    - GET /api/inventory/products/{id}/ - Buscar produto
    - GET /api/inventory/products/active/ - Produtos ativos
    - GET /api/inventory/products/low_stock/ - Produtos com estoque baixo
    - GET /api/inventory/products/out_of_stock/ - Produtos sem estoque
    - GET /api/inventory/products/summary/ - Resumo do inventário
    - POST /api/inventory/products/ - Criar produto
    - PUT /api/inventory/products/{id}/ - Atualizar produto
    - DELETE /api/inventory/products/{id}/ - Deletar produto
    """
    permission_classes = [IsAuthenticated, IsSameTenant]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category', 'is_active']
    
    def get_queryset(self):
        """Filtra produtos do tenant do usuário"""
        return Product.objects.filter(
            tenant=self.request.user.tenant
        ).select_related('tenant')
    
    def get_serializer_class(self):
        """Usa serializer específico para create/update"""
        if self.action in ['create', 'update', 'partial_update']:
            return CreateProductSerializer
        return ProductSerializer
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        GET /api/inventory/products/active/
        Lista apenas produtos ativos
        """
        products = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """
        GET /api/inventory/products/low_stock/
        Lista produtos com estoque abaixo do mínimo
        """
        products = self.get_queryset().filter(
            is_active=True,
            stock_quantity__lte=F('min_stock'),
            stock_quantity__gt=0
        )
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def out_of_stock(self, request):
        """
        GET /api/inventory/products/out_of_stock/
        Lista produtos sem estoque
        """
        products = self.get_queryset().filter(
            is_active=True,
            stock_quantity=0
        )
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        GET /api/inventory/products/summary/
        Retorna resumo estatístico do inventário
        """
        try:
            queryset = self.get_queryset()
            
            # Calcula valor total do estoque
            stock_value_result = queryset.aggregate(
                total=Coalesce(
                    Sum(F('stock_quantity') * F('cost_price'), output_field=DecimalField()),
                    0.0
                )
            )
            
            summary = {
                'total_products': queryset.count(),
                'active_products': queryset.filter(is_active=True).count(),
                'low_stock_products': queryset.filter(
                    is_active=True,
                    stock_quantity__lte=F('min_stock'),
                    stock_quantity__gt=0
                ).count(),
                'out_of_stock_products': queryset.filter(
                    is_active=True,
                    stock_quantity=0
                ).count(),
                'total_stock_value': stock_value_result.get('total') or 0
            }
            
            serializer = ProductSummarySerializer(summary)
            return Response(serializer.data)
        except Exception as e:
            # Log do erro para debug
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Erro ao gerar resumo: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def best_selling(self, request):
        """
        GET /api/inventory/products/best_selling/
        Retorna produtos mais vendidos com estatísticas
        Query params: 
        - limit (default: 10)
        - date_from, date_to (optional)
        """
        from financial.models import Transaction
        from django.db.models import Sum, Count
        
        # Parâmetros
        limit = int(request.query_params.get('limit', 10))
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        # Base query de transações (apenas saídas/vendas)
        transactions = Transaction.objects.filter(
            tenant=request.user.tenant,
            type='saida'
        )
        
        # Filtrar por período se fornecido
        if date_from:
            transactions = transactions.filter(date__gte=date_from)
        if date_to:
            transactions = transactions.filter(date__lte=date_to)
        
        # Buscar movimentações de saída relacionadas às transações
        from .models import StockMovement
        
        movements = StockMovement.objects.filter(
            tenant=request.user.tenant,
            movement_type='saida',
            transaction__in=transactions
        )
        
        # Filtrar por período se fornecido
        if date_from:
            movements = movements.filter(created_at__date__gte=date_from)
        if date_to:
            movements = movements.filter(created_at__date__lte=date_to)
        
        # Agregar por produto
        product_stats = movements.values(
            'product__id',
            'product__name',
            'product__sku',
            'product__sale_price',
            'product__stock_quantity'
        ).annotate(
            total_quantity_sold=Sum('quantity'),
            total_sales_count=Count('id'),
            total_revenue=Sum(F('quantity') * F('product__sale_price'), output_field=DecimalField())
        ).order_by('-total_quantity_sold')[:limit]
        
        # Formatar resposta
        result = []
        for stat in product_stats:
            result.append({
                'product_id': stat['product__id'],
                'product_name': stat['product__name'],
                'sku': stat['product__sku'],
                'sale_price': float(stat['product__sale_price']),
                'current_stock': stat['product__stock_quantity'],
                'total_quantity_sold': stat['total_quantity_sold'],
                'total_sales_count': stat['total_sales_count'],
                'total_revenue': float(stat['total_revenue'] or 0),
            })
        
        return Response(result)
    
    @action(detail=True, methods=['post'])
    def add_stock(self, request, pk=None):
        """
        POST /api/inventory/products/{id}/add_stock/
        Adiciona estoque ao produto (atalho para criar StockMovement de entrada)
        
        Body:
        {
            "quantity": 10,
            "reason": "compra",
            "notes": "Compra do fornecedor X"
        }
        """
        try:
            product = self.get_object()
            
            # Cria movimentação de entrada
            data = {
                'product': product.id,
                'movement_type': 'entrada',
                'quantity': request.data.get('quantity'),
                'reason': request.data.get('reason', 'compra'),
                'notes': request.data.get('notes', '')
            }
            
            serializer = CreateStockMovementSerializer(
                data=data,
                context={'request': request}
            )
            
            if serializer.is_valid():
                serializer.save()
                
                # Retorna produto atualizado
                product.refresh_from_db()
                product_serializer = ProductSerializer(product)
                return Response(product_serializer.data)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Erro ao adicionar estoque: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """Exporta produtos para CSV"""
        import csv
        from django.http import HttpResponse
        
        queryset = self.get_queryset()
        
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="produtos.csv"'
        response.write('\ufeff')  # BOM para UTF-8
        
        writer = csv.writer(response)
        writer.writerow([
            'SKU', 'Nome', 'Categoria', 'Preço Custo', 'Preço Venda',
            'Estoque', 'Estoque Mínimo', 'Ativo'
        ])
        
        for product in queryset:
            writer.writerow([
                product.sku,
                product.name,
                product.category,
                float(product.cost_price),
                float(product.sale_price),
                product.stock_quantity,
                product.min_stock,
                'Sim' if product.is_active else 'Não'
            ])
        
        return response
    
    @action(detail=False, methods=['get'])
    def export_excel(self, request):
        """Exporta produtos para Excel"""
        try:
            from openpyxl import Workbook
            from django.http import HttpResponse
            
            queryset = self.get_queryset()
            
            wb = Workbook()
            ws = wb.active
            ws.title = "Produtos"
            
            # Cabeçalho
            headers = [
                'SKU', 'Nome', 'Categoria', 'Preço Custo', 'Preço Venda',
                'Estoque', 'Estoque Mínimo', 'Ativo'
            ]
            ws.append(headers)
            
            # Dados
            for product in queryset:
                ws.append([
                    product.sku,
                    product.name,
                    product.category,
                    float(product.cost_price),
                    float(product.sale_price),
                    product.stock_quantity,
                    product.min_stock,
                    'Sim' if product.is_active else 'Não'
                ])
            
            response = HttpResponse(
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = 'attachment; filename="produtos.xlsx"'
            wb.save(response)
            
            return response
        
        except ImportError:
            return Response(
                {'error': 'Biblioteca openpyxl não instalada'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def remove_stock(self, request, pk=None):
        """
        POST /api/inventory/products/{id}/remove_stock/
        Remove estoque do produto (atalho para criar StockMovement de saída)
        
        Body:
        {
            "quantity": 5,
            "reason": "perda",
            "notes": "Produto danificado"
        }
        """
        try:
            product = self.get_object()
            
            # Cria movimentação de saída
            data = {
                'product': product.id,
                'movement_type': 'saida',
                'quantity': request.data.get('quantity'),
                'reason': request.data.get('reason', 'ajuste'),
                'notes': request.data.get('notes', '')
            }
            
            serializer = CreateStockMovementSerializer(
                data=data,
                context={'request': request}
            )
            
            if serializer.is_valid():
                serializer.save()
                
                # Retorna produto atualizado
                product.refresh_from_db()
                product_serializer = ProductSerializer(product)
                return Response(product_serializer.data)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Erro ao remover estoque: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class StockMovementViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar Movimentações de Estoque
    
    Endpoints:
    - GET /api/inventory/stock-movements/ - Listar movimentações
    - GET /api/inventory/stock-movements/{id}/ - Buscar movimentação
    - GET /api/inventory/stock-movements/by_product/ - Por produto (query param: product_id)
    - POST /api/inventory/stock-movements/ - Criar movimentação
    """
    permission_classes = [IsAuthenticated, IsSameTenant]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['movement_type', 'reason', 'product']
    http_method_names = ['get', 'post', 'head', 'options']  # Não permite PUT/DELETE
    
    def get_queryset(self):
        """Filtra movimentações do tenant do usuário"""
        return StockMovement.objects.filter(
            tenant=self.request.user.tenant
        ).select_related('product', 'created_by', 'transaction')
    
    def get_serializer_class(self):
        """Usa serializer específico para create"""
        if self.action == 'create':
            return CreateStockMovementSerializer
        return StockMovementSerializer
    
    @action(detail=False, methods=['get'])
    def by_product(self, request):
        """
        GET /api/inventory/stock-movements/by_product/?product_id={uuid}
        Lista movimentações de um produto específico
        """
        product_id = request.query_params.get('product_id')
        
        if not product_id:
            return Response(
                {'error': 'product_id é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        movements = self.get_queryset().filter(product_id=product_id)
        serializer = self.get_serializer(movements, many=True)
        return Response(serializer.data)
