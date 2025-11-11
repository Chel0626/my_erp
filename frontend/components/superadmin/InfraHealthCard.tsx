/**
 * Componente: Saúde da Infraestrutura
 * Mostra CPU e Memória do servidor
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Server, Cpu, HardDrive } from 'lucide-react';
import { useInfraMetrics } from '@/hooks/useSystemHealth';
import { Line } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import { cn } from '@/lib/utils';

export default function InfraHealthCard() {
  const { data: metrics, isLoading } = useInfraMetrics();

  if (isLoading || !metrics) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="text-lg">Saúde da Infraestrutura</CardTitle>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const cpuChartData = {
    labels: metrics.cpu_history.map(h => 
      new Date(h.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    ),
    datasets: [
      {
        label: 'CPU %',
        data: metrics.cpu_history.map(h => h.percentage),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const memoryChartData = {
    labels: metrics.memory_history.map(h => 
      new Date(h.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    ),
    datasets: [
      {
        label: 'Memória %',
        data: metrics.memory_history.map(h => h.percentage),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
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
          label: (context) => `${(context.parsed.y ?? 0).toFixed(1)}%`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => `${value}%`,
        },
      },
    },
  };

  const getCpuColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getMemoryColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Server className="h-5 w-5" />
          Saúde da Infraestrutura ({metrics.provider})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Métricas Atuais */}
        <div className="grid grid-cols-2 gap-4">
          {/* CPU */}
          <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium">CPU Atual</span>
            </div>
            <p className={cn("text-3xl font-bold", getCpuColor(metrics.cpu_usage_percentage))}>
              {metrics.cpu_usage_percentage.toFixed(1)}%
            </p>
          </div>

          {/* Memória */}
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">RAM Atual</span>
            </div>
            <p className={cn("text-3xl font-bold", getMemoryColor(metrics.memory_usage_percentage))}>
              {metrics.memory_usage_percentage.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Gráfico de CPU */}
        <div>
          <h4 className="text-sm font-medium mb-3">Uso de CPU (última hora)</h4>
          <div className="h-40">
            <Line data={cpuChartData} options={chartOptions} />
          </div>
        </div>

        {/* Gráfico de Memória */}
        <div>
          <h4 className="text-sm font-medium mb-3">Uso de RAM (última hora)</h4>
          <div className="h-40">
            <Line data={memoryChartData} options={chartOptions} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
