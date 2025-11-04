'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGoalsComparison } from '@/hooks/useGoals';
import { TrendingUp, TrendingDown, ArrowRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function GoalsComparison() {
  const { data, isLoading } = useGoalsComparison();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground text-sm">
            Carregando comparação...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const renderChange = (value: number, label: string, isCurrency = false, isPercentage = false) => {
    const isPositive = value > 0;
    const isNegative = value < 0;
    const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : ArrowRight;
    const colorClass = isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-muted-foreground';

    const formatValue = (val: number) => {
      if (isCurrency) {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(val);
      }
      if (isPercentage) {
        return `${val.toFixed(1)}%`;
      }
      return val.toString();
    };

    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${colorClass}`} />
          <span className={`font-semibold ${colorClass}`}>
            {isPositive && '+'}{formatValue(value)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Comparação de Períodos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Period Headers */}
        <div className="grid grid-cols-2 gap-4 pb-4 border-b">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Período Anterior</p>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(data.previous_period.start), 'dd/MM/yyyy', { locale: ptBR })}
              {' - '}
              {format(new Date(data.previous_period.end), 'dd/MM/yyyy', { locale: ptBR })}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Período Atual</p>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(data.current_period.start), 'dd/MM/yyyy', { locale: ptBR })}
              {' - '}
              {format(new Date(data.current_period.end), 'dd/MM/yyyy', { locale: ptBR })}
            </p>
          </div>
        </div>

        {/* Comparison Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {renderChange(data.changes.total_goals, 'Total de Metas')}
          {renderChange(data.changes.completed_goals, 'Metas Concluídas')}
          {renderChange(data.changes.avg_progress, 'Progresso Médio', false, true)}
          {renderChange(data.changes.success_rate, 'Taxa de Sucesso', false, true)}
          {renderChange(data.changes.total_revenue, 'Faturamento Total', true)}
        </div>

        {/* Summary */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Período Anterior:</p>
              <ul className="mt-2 space-y-1">
                <li>
                  <strong>{data.previous_period.stats.total}</strong> metas totais
                </li>
                <li>
                  <strong>{data.previous_period.stats.completed}</strong> concluídas
                </li>
                <li>
                  <strong>{data.previous_period.stats.avg_progress}%</strong> progresso médio
                </li>
              </ul>
            </div>
            <div>
              <p className="text-muted-foreground">Período Atual:</p>
              <ul className="mt-2 space-y-1">
                <li>
                  <strong>{data.current_period.stats.total}</strong> metas totais
                </li>
                <li>
                  <strong>{data.current_period.stats.completed}</strong> concluídas
                </li>
                <li>
                  <strong>{data.current_period.stats.avg_progress}%</strong> progresso médio
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
