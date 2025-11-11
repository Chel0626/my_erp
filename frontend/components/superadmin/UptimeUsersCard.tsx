/**
 * Componente: Disponibilidade e Usuários Ativos
 * Mostra status do sistema e usuários online
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, Wifi, WifiOff } from 'lucide-react';
import { useUptimeStatus, useOnlineUsers } from '@/hooks/useSystemHealth';
import { Line } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import { cn } from '@/lib/utils';

export default function UptimeUsersCard() {
  const { data: uptime, isLoading: uptimeLoading } = useUptimeStatus();
  const { data: users, isLoading: usersLoading } = useOnlineUsers();

  if (uptimeLoading || usersLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="text-lg">Disponibilidade & Usuários</CardTitle>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const isOnline = uptime?.status === 'up';

  const usersChartData = users ? {
    labels: users.users_history.map(h => 
      new Date(h.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    ),
    datasets: [
      {
        label: 'Usuários Ativos',
        data: users.users_history.map(h => h.count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  } : null;

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.y ?? 0} usuários`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Disponibilidade & Usuários
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status do Sistema - LED Grande */}
        <div className="flex flex-col items-center py-4">
          <div className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center mb-4 shadow-lg",
            isOnline 
              ? "bg-green-500 animate-pulse" 
              : "bg-red-500"
          )}>
            {isOnline ? (
              <Wifi className="h-12 w-12 text-white" />
            ) : (
              <WifiOff className="h-12 w-12 text-white" />
            )}
          </div>
          <div className="text-center">
            <p className={cn(
              "text-3xl font-bold",
              isOnline ? "text-green-600" : "text-red-600"
            )}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Status do Sistema
            </p>
          </div>
        </div>

        {/* Métricas de Uptime */}
        {uptime && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs font-medium text-muted-foreground mb-1">Uptime</p>
              <p className="text-2xl font-bold text-blue-600">
                {uptime.uptime_percentage.toFixed(2)}%
              </p>
            </div>

            <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-xs font-medium text-muted-foreground mb-1">Latência</p>
              <p className="text-2xl font-bold text-purple-600">
                {uptime.response_time_ms.toFixed(0)} ms
              </p>
            </div>
          </div>
        )}

        {/* Usuários Ativos - Contador Grande */}
        {users && (
          <div className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            <Users className="h-8 w-8 text-blue-600 mb-2" />
            <p className="text-sm font-medium text-muted-foreground mb-2">Usuários Ativos Agora</p>
            <p className="text-5xl font-bold text-blue-600">
              {users.active_users}
            </p>
          </div>
        )}

        {/* Gráfico de Atividade de Usuários */}
        {users && usersChartData && (
          <div>
            <h4 className="text-sm font-medium mb-3">Atividade de Usuários (última hora)</h4>
            <div className="h-40">
              <Line data={usersChartData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Última Verificação */}
        {uptime && (
          <div className="text-xs text-muted-foreground text-center pt-4 border-t">
            Última verificação: {new Date(uptime.last_check).toLocaleString('pt-BR')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
