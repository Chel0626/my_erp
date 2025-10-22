/**
 * Componente de gráfico de pizza/donut para distribuição de status
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CheckCircle, Clock, XCircle, Calendar } from 'lucide-react';

interface StatusDistributionChartProps {
  data: Array<{
    status: string;
    status_display: string;
    count: number;
    percentage: number;
  }>;
  total: number;
}

// Cores por status
const STATUS_COLORS: Record<string, string> = {
  concluido: '#10b981', // verde
  confirmado: '#3b82f6', // azul
  marcado: '#f59e0b', // laranja
  cancelado: '#ef4444', // vermelho
  em_atendimento: '#8b5cf6', // roxo
  falta: '#6b7280', // cinza
};

// Ícones por status
const STATUS_ICONS: Record<string, React.ReactNode> = {
  concluido: <CheckCircle className="h-4 w-4" />,
  confirmado: <Calendar className="h-4 w-4" />,
  marcado: <Clock className="h-4 w-4" />,
  cancelado: <XCircle className="h-4 w-4" />,
  em_atendimento: <Clock className="h-4 w-4" />,
  falta: <XCircle className="h-4 w-4" />,
};

export function StatusDistributionChart({ data, total }: StatusDistributionChartProps) {
  // Formatar dados para o gráfico
  const chartData = data.map((item) => ({
    name: item.status_display,
    value: item.count,
    percentage: item.percentage,
    status: item.status,
  }));

  // Custom label para mostrar percentual
  const renderLabel = (props: { percentage: number }) => {
    return `${props.percentage.toFixed(1)}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Status</CardTitle>
        <CardDescription>
          Total de {total} agendamentos no período
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {/* Gráfico */}
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={STATUS_COLORS[entry.status] || '#6b7280'}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{
                                backgroundColor: STATUS_COLORS[data.status],
                              }}
                            />
                            <span className="font-semibold">{data.name}</span>
                          </div>
                          <div className="text-sm">
                            <div>Quantidade: {data.value}</div>
                            <div>Percentual: {data.percentage.toFixed(2)}%</div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legenda com ícones */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            {chartData.map((item) => (
              <div
                key={item.status}
                className="flex items-center gap-2 rounded-lg border p-2"
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: `${STATUS_COLORS[item.status]}20`,
                    color: STATUS_COLORS[item.status],
                  }}
                >
                  {STATUS_ICONS[item.status]}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.value} ({item.percentage.toFixed(1)}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
