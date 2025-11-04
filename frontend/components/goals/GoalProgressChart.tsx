'use client';

import { useMemo } from 'react';
import type { Goal } from '@/types/goals';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GoalProgressChartProps {
  goal: Goal;
}

export function GoalProgressChart({ goal }: GoalProgressChartProps) {
  const chartData = useMemo(() => {
    if (!goal.progress_data || goal.progress_data.length === 0) {
      return [];
    }

    return goal.progress_data.map((item) => ({
      date: format(new Date(item.date), 'dd/MM', { locale: ptBR }),
      fullDate: format(new Date(item.date), 'dd/MM/yyyy', { locale: ptBR }),
      value: parseFloat(item.value.toString()),
      percentage: item.percentage,
      target: parseFloat(goal.target_value),
    }));
  }, [goal]);

  if (chartData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Sem dados de progresso ainda</p>
      </div>
    );
  }

  // Determinar se é valor monetário
  const isMonetary = goal.target_type === 'revenue';

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            className="text-xs"
            stroke="currentColor"
          />
          <YAxis
            className="text-xs"
            stroke="currentColor"
            tickFormatter={(value) => {
              if (isMonetary) {
                return new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  minimumFractionDigits: 0,
                }).format(value);
              }
              return value.toString();
            }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null;

              const data = payload[0].payload;
              return (
                <div className="bg-background border rounded-lg shadow-lg p-3">
                  <p className="font-semibold text-sm mb-2">{data.fullDate}</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-blue-600">
                      Valor:{' '}
                      {isMonetary
                        ? new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(data.value)
                        : data.value}
                    </p>
                    <p className="text-green-600">
                      Progresso: {data.percentage.toFixed(1)}%
                    </p>
                    <p className="text-muted-foreground">
                      Meta:{' '}
                      {isMonetary
                        ? new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(data.target)
                        : data.target}
                    </p>
                  </div>
                </div>
              );
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            name="Valor Atual"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="target"
            name="Meta"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
