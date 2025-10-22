/**
 * Componente de gráfico de receita ao longo do tempo
 * Usa recharts para visualização
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RevenueChartProps {
  data: Array<{
    period: string;
    total: string;
    count: number;
  }>;
  period: 'day' | 'week' | 'month';
  type?: 'line' | 'area';
}

export function RevenueChart({ data, period, type = 'area' }: RevenueChartProps) {
  // Formatar dados para o gráfico
  const chartData = data.map((item) => {
    const date = parseISO(item.period);
    let label = '';

    if (period === 'month') {
      label = format(date, 'MMM/yyyy', { locale: ptBR });
    } else if (period === 'week') {
      label = format(date, 'dd/MM', { locale: ptBR });
    } else {
      label = format(date, 'dd/MM', { locale: ptBR });
    }

    return {
      label,
      receita: parseFloat(item.total),
      quantidade: item.count,
    };
  });

  // Calcular total
  const totalRevenue = chartData.reduce((sum, item) => sum + item.receita, 0);
  const totalCount = chartData.reduce((sum, item) => sum + item.quantidade, 0);

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Receita ao Longo do Tempo
            </CardTitle>
            <CardDescription>
              Evolução da receita no período selecionado
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="text-sm text-muted-foreground">
              {totalCount} transações
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {type === 'area' ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="label"
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                tickFormatter={(value) => `R$ ${value}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Receita
                            </span>
                            <span className="font-bold text-green-600">
                              {formatCurrency(payload[0].value as number)}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Transações
                            </span>
                            <span className="font-bold">
                              {payload[0].payload.quantidade}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="receita"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorReceita)"
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="label"
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                tickFormatter={(value) => `R$ ${value}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Receita
                            </span>
                            <span className="font-bold text-green-600">
                              {formatCurrency(payload[0].value as number)}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Transações
                            </span>
                            <span className="font-bold">
                              {payload[0].payload.quantidade}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="receita"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
