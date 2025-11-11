/**
 * Componente: Disponibilidade e Usuários Ativos - Estilo NOC
 * Mostra status do sistema e usuários online
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Users, Wifi, WifiOff, Zap } from 'lucide-react';
import { useUptimeStatus, useOnlineUsers } from '@/hooks/useSystemHealth';
import { Line } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';

export default function UptimeUsersCard() {
  const { data: uptime, isLoading: uptimeLoading } = useUptimeStatus();
  const { data: users, isLoading: usersLoading } = useOnlineUsers();

  if (uptimeLoading || usersLoading) {
    return (
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 border-slate-700/50 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg text-white">📡 Uptime & Usuários</CardTitle>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent mx-auto"></div>
            <p className="text-sm text-slate-400">Carregando métricas...</p>
          </div>
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
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
    ],
  } : null;

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#3b82f6',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `${context.parsed.y ?? 0} usuários`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: {
          color: '#64748b',
          stepSize: 1,
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
            📡 Uptime & Usuários
            <Badge className={`${
              isOnline 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                : 'bg-red-500/20 text-red-300 border-red-500/30'
            }`}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </Badge>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* LED Status - Estilo NOC */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`relative w-16 h-16 rounded-full flex items-center justify-center ${
                isOnline 
                  ? 'bg-emerald-500/20 border-2 border-emerald-500' 
                  : 'bg-red-500/20 border-2 border-red-500'
              }`}>
                {isOnline ? (
                  <>
                    <Wifi className="h-8 w-8 text-emerald-400" />
                    <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping"></div>
                  </>
                ) : (
                  <WifiOff className="h-8 w-8 text-red-400" />
                )}
              </div>
              <div>
                <p className={`text-3xl font-bold ${isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isOnline ? 'SISTEMA UP' : 'SISTEMA DOWN'}
                </p>
                <p className="text-sm text-slate-400">Status em Tempo Real</p>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas de Uptime */}
        {uptime && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-slate-400">UPTIME</span>
              </div>
              <p className="text-3xl font-bold text-blue-400">
                {uptime.uptime_percentage.toFixed(2)}
                <span className="text-lg ml-1">%</span>
              </p>
            </div>

            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-purple-400" />
                <span className="text-xs text-slate-400">LATÊNCIA</span>
              </div>
              <p className="text-3xl font-bold text-purple-400">
                {uptime.response_time_ms.toFixed(0)}
                <span className="text-lg ml-1">ms</span>
              </p>
            </div>
          </div>
        )}

        {/* Usuários Ativos - Grande Destaque NOC */}
        {users && (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-700/10 border border-blue-500/30 p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="relative text-center">
              <Users className="h-10 w-10 text-blue-400 mx-auto mb-2" />
              <p className="text-xs font-medium text-blue-300 mb-2">USUÁRIOS ATIVOS AGORA</p>
              <p className="text-6xl font-bold text-blue-400">
                {users.active_users}
              </p>
            </div>
          </div>
        )}

        {/* Gráfico de Atividade de Usuários */}
        {users && usersChartData && (
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              Atividade - Última Hora
            </h4>
            <div className="h-32 bg-slate-900/50 rounded-lg p-3 border border-slate-700/30">
              <Line data={usersChartData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Última Verificação + Ação */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700/30">
          {uptime && (
            <p className="text-xs text-slate-500">
              Verificado: {new Date(uptime.last_check).toLocaleTimeString('pt-BR')}
            </p>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <Activity className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
