from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta

from .models import Sale, SaleItem, CashRegister
from .serializers import (
    SaleSerializer, SaleCreateSerializer,
    CashRegisterSerializer, CashRegisterCreateSerializer, CashRegisterCloseSerializer
)
from core.permissions import IsTenantUser


class SaleViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciamento de vendas"""
    
    permission_classes = [IsAuthenticated, IsTenantUser]
    
    def get_queryset(self):
        queryset = Sale.objects.filter(
            tenant=self.request.user.tenant
        ).select_related('customer', 'user', 'cash_register').prefetch_related('items')
        
        # Filtros
        customer_id = self.request.query_params.get('customer')
        user_id = self.request.query_params.get('user')
        payment_method = self.request.query_params.get('payment_method')
        payment_status = self.request.query_params.get('payment_status')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)
        
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        if payment_method:
            queryset = queryset.filter(payment_method=payment_method)
        
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)
        
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SaleCreateSerializer
        return SaleSerializer
    
    @action(detail=True, methods=['post'])
    def cancel_sale(self, request, pk=None):
        """Cancela venda e reverte estoque"""
        sale = self.get_object()
        
        if sale.payment_status == 'cancelled':
            return Response(
                {'error': 'Venda já está cancelada.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Reverte estoque
        for item in sale.items.all():
            if item.product:
                product = item.product
                product.stock += item.quantity
                product.save()
        
        # Cancela comissões relacionadas
        from commissions.models import Commission
        Commission.objects.filter(sale=sale).update(payment_status='cancelled')
        
        # Atualiza status
        sale.payment_status = 'cancelled'
        sale.save()
        
        serializer = self.get_serializer(sale)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def print_receipt(self, request, pk=None):
        """Retorna dados para impressão de recibo"""
        sale = self.get_object()
        
        receipt_data = {
            'sale_id': sale.id,
            'date': sale.date,
            'customer': sale.customer.name if sale.customer else 'Cliente Avulso',
            'user': sale.user.get_full_name(),
            'items': [
                {
                    'name': item.product.name if item.product else item.service.name,
                    'quantity': float(item.quantity),
                    'unit_price': float(item.unit_price),
                    'discount': float(item.discount),
                    'total': float(item.total)
                }
                for item in sale.items.all()
            ],
            'subtotal': float(sale.subtotal),
            'discount': float(sale.discount),
            'total': float(sale.total),
            'payment_method': sale.get_payment_method_display(),
            'payment_status': sale.get_payment_status_display()
        }
        
        return Response(receipt_data)
    
    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """Exporta vendas para CSV"""
        import csv
        from django.http import HttpResponse
        
        queryset = self.get_queryset()
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="vendas.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'ID', 'Data', 'Cliente', 'Vendedor', 'Subtotal',
            'Desconto', 'Total', 'Forma Pagamento', 'Status'
        ])
        
        for sale in queryset:
            writer.writerow([
                sale.id,
                sale.date.strftime('%d/%m/%Y %H:%M'),
                sale.customer.name if sale.customer else 'Cliente Avulso',
                sale.user.get_full_name(),
                sale.subtotal,
                sale.discount,
                sale.total,
                sale.get_payment_method_display(),
                sale.get_payment_status_display()
            ])
        
        return response
    
    @action(detail=False, methods=['get'])
    def export_excel(self, request):
        """Exporta vendas para Excel"""
        try:
            from openpyxl import Workbook
            from django.http import HttpResponse
            
            queryset = self.get_queryset()
            
            wb = Workbook()
            ws = wb.active
            ws.title = "Vendas"
            
            # Cabeçalho
            headers = [
                'ID', 'Data', 'Cliente', 'Vendedor', 'Subtotal',
                'Desconto', 'Total', 'Forma Pagamento', 'Status'
            ]
            ws.append(headers)
            
            # Dados
            for sale in queryset:
                ws.append([
                    sale.id,
                    sale.date.strftime('%d/%m/%Y %H:%M'),
                    sale.customer.name if sale.customer else 'Cliente Avulso',
                    sale.user.get_full_name(),
                    float(sale.subtotal),
                    float(sale.discount),
                    float(sale.total),
                    sale.get_payment_method_display(),
                    sale.get_payment_status_display()
                ])
            
            response = HttpResponse(
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = 'attachment; filename="vendas.xlsx"'
            wb.save(response)
            
            return response
        
        except ImportError:
            return Response(
                {'error': 'Biblioteca openpyxl não instalada'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Dashboard de vendas"""
        queryset = self.get_queryset()
        
        # Total geral
        totals = queryset.filter(payment_status='paid').aggregate(
            total_sales=Sum('total'),
            count=Count('id')
        )
        
        # Por período (hoje, semana, mês)
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        today_sales = queryset.filter(
            date__date=today,
            payment_status='paid'
        ).aggregate(total=Sum('total'), count=Count('id'))
        
        week_sales = queryset.filter(
            date__date__gte=week_ago,
            payment_status='paid'
        ).aggregate(total=Sum('total'), count=Count('id'))
        
        month_sales = queryset.filter(
            date__date__gte=month_ago,
            payment_status='paid'
        ).aggregate(total=Sum('total'), count=Count('id'))
        
        # Top vendedores
        top_sellers = queryset.filter(payment_status='paid').values(
            'user__first_name', 'user__last_name'
        ).annotate(
            total=Sum('total'),
            count=Count('id')
        ).order_by('-total')[:5]
        
        return Response({
            'total': {
                'amount': totals['total_sales'] or 0,
                'count': totals['count'] or 0
            },
            'today': {
                'amount': today_sales['total'] or 0,
                'count': today_sales['count'] or 0
            },
            'week': {
                'amount': week_sales['total'] or 0,
                'count': week_sales['count'] or 0
            },
            'month': {
                'amount': month_sales['total'] or 0,
                'count': month_sales['count'] or 0
            },
            'top_sellers': [
                {
                    'name': f"{s['user__first_name']} {s['user__last_name']}",
                    'total': s['total'],
                    'count': s['count']
                }
                for s in top_sellers
            ]
        })


class CashRegisterViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciamento de caixa"""
    
    permission_classes = [IsAuthenticated, IsTenantUser]
    
    def get_queryset(self):
        queryset = CashRegister.objects.filter(
            tenant=self.request.user.tenant
        ).select_related('user')
        
        # Filtros
        user_id = self.request.query_params.get('user')
        status_filter = self.request.query_params.get('status')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if date_from:
            queryset = queryset.filter(opened_at__gte=date_from)
        
        if date_to:
            queryset = queryset.filter(opened_at__lte=date_to)
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CashRegisterCreateSerializer
        elif self.action == 'close':
            return CashRegisterCloseSerializer
        return CashRegisterSerializer
    
    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Fecha caixa"""
        cash_register = self.get_object()
        
        serializer = CashRegisterCloseSerializer(
            cash_register,
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(CashRegisterSerializer(cash_register).data)
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Retorna caixa aberto do usuário atual"""
        cash_register = CashRegister.objects.filter(
            tenant=request.user.tenant,
            user=request.user,
            status='open'
        ).first()
        
        if not cash_register:
            return Response(None, status=status.HTTP_200_OK)
        
        serializer = self.get_serializer(cash_register)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Resumo de caixas do dia"""
        today = timezone.now().date()
        
        registers = CashRegister.objects.filter(
            tenant=request.user.tenant,
            opened_at__date=today
        )
        
        summary = {
            'total_registers': registers.count(),
            'open_registers': registers.filter(status='open').count(),
            'closed_registers': registers.filter(status='closed').count(),
            'total_sales': 0,
            'total_amount': 0
        }
        
        for register in registers:
            sales = register.sales.filter(payment_status='paid')
            summary['total_sales'] += sales.count()
            summary['total_amount'] += float(
                sales.aggregate(total=Sum('total'))['total'] or 0
            )
        
        return Response(summary)
