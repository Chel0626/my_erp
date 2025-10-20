/**
 * Componente de gráfico de barras horizontais para top serviços
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, TrendingUp } from 'lucide-react';

interface TopServicesChartProps {
  data: Array<{
    service_id: string;
    service_name: string;
    price: string;
    appointments_count: number;
    total_revenue: string;
  }>;
}

// Cores para as barras (gradiente de azul)
const COLORS = [
  '#3b82f6', // azul forte
  '#60a5fa', // azul médio
  '#93c5fd', // azul claro
  '#bfdbfe', // azul muito claro
  '#dbeafe', // azul bem claro
  '#eff6ff', // azul quase branco
  '#e0e7ff', // cinza azulado
  '#c7d2fe', // roxo claro
  '#a5b4fc', // roxo
  '#818cf8', // roxo escuro
];

export function TopServicesChart({ data }: TopServicesChartProps) {
  // Formatar dados para o gráfico
  const chartData = data.map((item, index) => ({
    name: item.service_name,
    quantidade: item.appointments_count,
    receita: parseFloat(item.total_revenue),
    color: COLORS[index % COLORS.length],
  }));

  // Calcular totais
  const totalAppointments = chartData.reduce((sum, item) => sum + item.quantidade, 0);
  const totalRevenue = chartData.reduce((sum, item) => sum + item.receita, 0);

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
              <Trophy className="h-5 w-5 text-yellow-600" />
              Top Serviços
            </CardTitle>
            <CardDescription>Serviços mais agendados no período</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">{totalAppointments}</div>
            <div className="text-sm text-muted-foreground">agendamentos</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {/* Gráfico de Barras Horizontais */}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" className="text-xs" />
              <YAxis
                type="category"
                dataKey="name"
                className="text-xs"
                width={120}
                tick={{ fill: 'currentColor' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          <div className="font-semibold">{data.name}</div>
                          <div className="flex flex-col gap-1 text-sm">
                            <div>
                              Agendamentos:{' '}
                              <span className="font-bold">{data.quantidade}</span>
                            </div>
                            <div>
                              Receita:{' '}
                              <span className="font-bold text-green-600">
                                {formatCurrency(data.receita)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="quantidade" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Lista detalhada */}
          <div className="grid gap-2">
            <div className="text-sm font-semibold flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Receita Total: {formatCurrency(totalRevenue)}
            </div>
            
            {chartData.slice(0, 5).map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border p-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full font-bold text-white"
                    style={{ backgroundColor: item.color }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.quantidade} agendamentos
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">
                    {formatCurrency(item.receita)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {((item.receita / totalRevenue) * 100).toFixed(1)}%
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
