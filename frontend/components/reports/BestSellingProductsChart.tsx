/**
 * Componente de Produtos Mais Vendidos
 * Exibe gráfico de barras horizontais dos produtos best sellers
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, Package, AlertCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BestSellingProduct } from '@/hooks/useReports';

interface BestSellingProductsChartProps {
  data: BestSellingProduct[] | undefined;
  isLoading: boolean;
}

export function BestSellingProductsChart({ data, isLoading }: BestSellingProductsChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Produtos Mais Vendidos
          </CardTitle>
          <CardDescription>Produtos com maior volume de vendas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Package className="h-16 w-16 mb-3 opacity-30" />
            <p className="text-lg font-medium">Nenhuma venda registrada</p>
            <p className="text-sm">Não há produtos vendidos no período selecionado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Formatar dados para o gráfico
  const chartData = data.map((item) => ({
    name: item.product_name.length > 25 ? item.product_name.substring(0, 25) + '...' : item.product_name,
    fullName: item.product_name,
    quantity: item.total_quantity_sold,
    revenue: parseFloat(item.total_revenue.toFixed(2)),
    sales: item.total_sales_count,
    stock: item.current_stock,
  }));

  // Cores para as barras
  const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#ef4444', '#14b8a6', '#f97316'];

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: { 
    active?: boolean; 
    payload?: Array<{ payload: { 
      fullName: string; 
      quantity: number; 
      total_revenue: string;
      sales: number;
      revenue: number;
      stock: number;
    } }> 
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border">
          <p className="font-semibold mb-2">{data.fullName}</p>
          <div className="space-y-1 text-sm">
            <p className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Quantidade Vendida:</span>
              <span className="font-semibold">{data.quantity} un</span>
            </p>
            <p className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Vendas:</span>
              <span className="font-semibold">{data.sales}</span>
            </p>
            <p className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Receita:</span>
              <span className="font-semibold text-green-600">{formatCurrency(data.revenue)}</span>
            </p>
            <p className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Estoque Atual:</span>
              <span className={`font-semibold ${data.stock < 10 ? 'text-red-600' : ''}`}>
                {data.stock} un
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Produtos Mais Vendidos
        </CardTitle>
        <CardDescription>
          Top {data.length} produtos com maior volume de vendas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Cards de resumo (mobile) */}
        <div className="grid gap-3 md:hidden mb-6">
          {data.slice(0, 5).map((item, index) => (
            <Card key={item.product_id} className="border-l-4" style={{ borderLeftColor: COLORS[index % COLORS.length] }}>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                    </div>
                    <span className="text-2xl font-bold text-muted-foreground ml-2">
                      #{index + 1}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t">
                    <div>
                      <p className="text-muted-foreground text-xs">Vendidos</p>
                      <p className="font-semibold">{item.total_quantity_sold} un</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Receita</p>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(item.total_revenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Vendas</p>
                      <p className="font-semibold">{item.total_sales_count}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Estoque</p>
                      <p className={`font-semibold ${item.current_stock < 10 ? 'text-red-600' : ''}`}>
                        {item.current_stock} un
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Gráfico (desktop) */}
        <div className="hidden md:block">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={140} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="quantity" name="Quantidade Vendida" radius={[0, 8, 8, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legenda de alerta de estoque baixo */}
        {data.some(item => item.current_stock < 10) && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-red-900">Atenção: Estoque Baixo</p>
              <p className="text-red-700">
                Alguns produtos best sellers estão com estoque baixo ({'<10 unidades'}). Considere fazer reposição.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
