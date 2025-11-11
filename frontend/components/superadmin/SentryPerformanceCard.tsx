/**
 * Componente: Performance da Aplicação (Sentry APM)
 * Mostra transações lentas e latência
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingDown, TrendingUp } from 'lucide-react';
import { useSentryPerformance } from '@/hooks/useSystemHealth';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function SentryPerformanceCard() {
  const { data: metrics, isLoading } = useSentryPerformance();

  if (isLoading || !metrics) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="text-lg">Performance (Sentry APM)</CardTitle>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    labels: metrics.latency_history.map(h => 
      new Date(h.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    ),
    datasets: [
      {
        label: 'Latência Média (ms)',
        data: metrics.latency_history.map(h => h.avg_ms),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.y.toFixed(0)} ms`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${value} ms`,
        },
      },
    },
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Performance (Sentry APM)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tempo Médio de Resposta */}
        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Tempo Médio de Resposta</p>
            <p className="text-3xl font-bold text-blue-600">{metrics.avg_response_time_ms.toFixed(0)} ms</p>
          </div>
          <Activity className="h-12 w-12 text-blue-600 opacity-50" />
        </div>

        {/* Gráfico de Latência */}
        <div>
          <h4 className="text-sm font-medium mb-3">Latência Média (última hora)</h4>
          <div className="h-48">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Top 5 Transações Mais Lentas */}
        <div>
          <h4 className="text-sm font-medium mb-3">Top 5 Transações Mais Lentas</h4>
          <div className="space-y-2">
            {metrics.top_slow_transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma transação lenta detectada
              </p>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-2 font-medium">Endpoint</th>
                      <th className="text-right p-2 font-medium">Média</th>
                      <th className="text-right p-2 font-medium">P95</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {metrics.top_slow_transactions.map((transaction, index) => (
                      <tr key={index} className="hover:bg-muted/50">
                        <td className="p-2 font-mono text-xs truncate max-w-[200px]">
                          {transaction.endpoint}
                        </td>
                        <td className="p-2 text-right font-medium">
                          {transaction.avg_duration_ms.toFixed(0)} ms
                        </td>
                        <td className="p-2 text-right text-muted-foreground">
                          {transaction.p95_duration_ms.toFixed(0)} ms
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Taxa de Erro */}
        {metrics.error_rate_percentage > 0 && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
            <TrendingUp className="h-5 w-5 text-red-600" />
            <span className="text-sm">
              Taxa de Erro: <span className="font-bold text-red-600">{metrics.error_rate_percentage.toFixed(2)}%</span>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
