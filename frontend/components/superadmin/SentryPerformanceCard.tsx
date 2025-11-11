/**
 * Componente: Performance da Aplicação (Sentry APM) - Estilo NOC
 * Mostra transações lentas e latência
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, TrendingDown, TrendingUp, Zap, ExternalLink } from 'lucide-react';
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
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 border-slate-700/50 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg text-white">⚡ Performance APM</CardTitle>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-purple-500 border-r-transparent border-b-purple-500 border-l-transparent mx-auto"></div>
            <p className="text-sm text-slate-400">Carregando métricas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const avgResponseTime = metrics.avg_response_time_ms;
  const performanceColor = avgResponseTime < 100 
    ? 'text-emerald-400' 
    : avgResponseTime < 300 
    ? 'text-blue-400' 
    : avgResponseTime < 500
    ? 'text-amber-400'
    : 'text-red-400';

  const chartData = {
    labels: metrics.latency_history.map(h => 
      new Date(h.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    ),
    datasets: [
      {
        label: 'Latência Média (ms)',
        data: metrics.latency_history.map(h => h.avg_ms),
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: 'rgb(139, 92, 246)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
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
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#a78bfa',
        borderColor: 'rgba(139, 92, 246, 0.3)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `${(context.parsed.y ?? 0).toFixed(0)} ms`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          color: '#64748b',
          callback: (value) => `${value} ms`,
        },
      },
      x: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          color: '#64748b',
          maxRotation: 0,
        },
      },
    },
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 border-slate-700/50 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between text-white">
          <span className="flex items-center gap-2">
            ⚡ Performance APM
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Sentry</Badge>
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Tempo Médio de Resposta - Destaque NOC */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-700/10 border border-purple-500/30 p-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-300 mb-1">TEMPO MÉDIO</p>
              <p className={`text-5xl font-bold ${performanceColor}`}>
                {avgResponseTime.toFixed(0)}
                <span className="text-2xl ml-1">ms</span>
              </p>
            </div>
            <Activity className="h-16 w-16 text-purple-400/30" />
          </div>
        </div>

        {/* Gráfico de Latência - Estilo NOC */}
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            Latência em Tempo Real
          </h4>
          <div className="h-48 bg-slate-900/50 rounded-lg p-3 border border-slate-700/30">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Top 5 Transações Mais Lentas - NOC Style */}
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-3">🐌 Transações Lentas</h4>
          <div className="space-y-2">
            {metrics.top_slow_transactions.length === 0 ? (
              <div className="text-center py-6 bg-slate-900/50 rounded-lg border border-slate-700/30">
                <Zap className="h-12 w-12 text-emerald-400/50 mx-auto mb-2" />
                <p className="text-sm text-slate-400">✓ Todas transações rápidas!</p>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-700/30 overflow-hidden bg-slate-900/30">
                <table className="w-full text-sm">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="text-left p-3 font-medium text-slate-400 text-xs uppercase">Endpoint</th>
                      <th className="text-right p-3 font-medium text-slate-400 text-xs uppercase">Média</th>
                      <th className="text-right p-3 font-medium text-slate-400 text-xs uppercase">P95</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {metrics.top_slow_transactions.map((transaction, index) => {
                      const slowColor = transaction.avg_duration_ms > 500 
                        ? 'text-red-400' 
                        : transaction.avg_duration_ms > 300 
                        ? 'text-amber-400' 
                        : 'text-blue-400';
                      
                      return (
                        <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-3 font-mono text-xs text-slate-300 truncate max-w-[200px]">
                            {transaction.endpoint}
                          </td>
                          <td className={`p-3 text-right font-bold ${slowColor}`}>
                            {transaction.avg_duration_ms.toFixed(0)} ms
                          </td>
                          <td className="p-3 text-right text-slate-400">
                            {transaction.p95_duration_ms.toFixed(0)} ms
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Taxa de Erro */}
        {metrics.error_rate_percentage > 0 && (
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-600/20 to-red-700/10 rounded-lg border border-red-500/30">
            <TrendingUp className="h-5 w-5 text-red-400" />
            <div className="flex-1">
              <span className="text-sm text-red-300">Taxa de Erro</span>
              <p className="text-2xl font-bold text-red-400">{metrics.error_rate_percentage.toFixed(2)}%</p>
            </div>
            <Button 
              size="sm"
              variant="outline"
              className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
            >
              Investigar
            </Button>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30"
          >
            <Activity className="h-4 w-4 mr-2" />
            Ver APM
          </Button>
          <Button
            variant="outline"
            className="bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30"
          >
            <Zap className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

