/**
 * Componente: Saúde da Infraestrutura - Estilo NOC
 * Mostra CPU e Memória do servidor
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Server, Cpu, HardDrive, Zap } from 'lucide-react';
import { useInfraMetrics } from '@/hooks/useSystemHealth';
import { Line } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';

export default function InfraHealthCard() {
  const { data: metrics, isLoading } = useInfraMetrics();

  if (isLoading || !metrics) {
    return (
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 border-slate-700/50 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg text-white">🖥️ Infraestrutura</CardTitle>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-orange-500 border-r-transparent border-b-orange-500 border-l-transparent mx-auto"></div>
            <p className="text-sm text-slate-400">Carregando métricas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const cpuColor = metrics.cpu_usage_percentage >= 90 
    ? 'text-red-400' 
    : metrics.cpu_usage_percentage >= 70 
    ? 'text-amber-400' 
    : 'text-emerald-400';

  const memoryColor = metrics.memory_usage_percentage >= 90 
    ? 'text-red-400' 
    : metrics.memory_usage_percentage >= 70 
    ? 'text-amber-400' 
    : 'text-emerald-400';

  const cpuChartData = {
    labels: metrics.cpu_history.map(h => 
      new Date(h.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    ),
    datasets: [
      {
        label: 'CPU %',
        data: metrics.cpu_history.map(h => h.percentage),
        borderColor: 'rgb(251, 146, 60)',
        backgroundColor: 'rgba(251, 146, 60, 0.2)',
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
    ],
  };

  const memoryChartData = {
    labels: metrics.memory_history.map(h => 
      new Date(h.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    ),
    datasets: [
      {
        label: 'RAM %',
        data: metrics.memory_history.map(h => h.percentage),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fb923c',
        borderColor: 'rgba(251, 146, 60, 0.3)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `${(context.parsed.y ?? 0).toFixed(1)}%`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: {
          color: '#64748b',
          callback: (value) => `${value}%`,
        },
      },
      x: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
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
            🖥️ Infraestrutura
            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
              {metrics.provider}
            </Badge>
          </span>
          <Server className="h-5 w-5 text-orange-400" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Métricas Atuais NOC */}
        <div className="grid grid-cols-2 gap-3">
          {/* CPU */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-600/20 to-orange-700/10 border border-orange-500/30 p-4">
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="h-4 w-4 text-orange-400" />
                <span className="text-xs font-medium text-orange-300">CPU</span>
              </div>
              <p className={`text-4xl font-bold ${cpuColor}`}>
                {metrics.cpu_usage_percentage.toFixed(1)}
                <span className="text-xl ml-1">%</span>
              </p>
            </div>
          </div>

          {/* RAM */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-600/20 to-emerald-700/10 border border-emerald-500/30 p-4">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-300">RAM</span>
              </div>
              <p className={`text-4xl font-bold ${memoryColor}`}>
                {metrics.memory_usage_percentage.toFixed(1)}
                <span className="text-xl ml-1">%</span>
              </p>
            </div>
          </div>
        </div>

        {/* Gráfico de CPU */}
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            CPU - Última Hora
          </h4>
          <div className="h-32 bg-slate-900/50 rounded-lg p-3 border border-slate-700/30">
            <Line data={cpuChartData} options={chartOptions} />
          </div>
        </div>

        {/* Gráfico de RAM */}
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            RAM - Última Hora
          </h4>
          <div className="h-32 bg-slate-900/50 rounded-lg p-3 border border-slate-700/30">
            <Line data={memoryChartData} options={chartOptions} />
          </div>
        </div>

        {/* Botão de Ação */}
        <Button
          variant="outline"
          className="w-full bg-orange-500/20 border-orange-500/30 text-orange-300 hover:bg-orange-500/30"
        >
          <Zap className="h-4 w-4 mr-2" />
          Otimizar Recursos
        </Button>
      </CardContent>
    </Card>
  );
}
