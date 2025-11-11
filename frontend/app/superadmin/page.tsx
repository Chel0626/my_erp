'use client';

import { useDashboardStats } from '@/hooks/useSuperAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  DollarSign, 
  Calendar,
  Activity,
  Shield,
  AlertTriangle,
  Zap,
  RefreshCw,
  Power,
  Database,
  Trash2
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import SentryHealthCard from '@/components/superadmin/SentryHealthCard';
import SentryPerformanceCard from '@/components/superadmin/SentryPerformanceCard';
import RedisHealthCard from '@/components/superadmin/RedisHealthCard';
import InfraHealthCard from '@/components/superadmin/InfraHealthCard';
import UptimeUsersCard from '@/components/superadmin/UptimeUsersCard';

export default function SuperAdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-emerald-500 border-r-blue-500 border-b-purple-500 border-l-pink-500 mx-auto"></div>
          <p className="text-slate-400 text-sm">Carregando Centro de Operações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 lg:p-6">
      {/* NOC Header - Estilo Profissional */}
      <div className="mb-6 bg-gradient-to-r from-slate-900/50 via-slate-800/30 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Shield className="h-12 w-12 text-emerald-400" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                Centro de Operações NOC
                <span className="text-xs font-normal px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                  v1.0.0
                </span>
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Monitoramento 24/7 • Infraestrutura • Performance • Segurança
              </p>
            </div>
          </div>
          
          {/* Status Badges */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
              <Activity className="h-5 w-5 text-emerald-400 animate-pulse" />
              <span className="text-sm font-medium text-emerald-400">SISTEMA ONLINE</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel - BOTÕES DE AÇÃO CRÍTICOS */}
      <div className="mb-6 grid grid-cols-2 lg:grid-cols-6 gap-3">
        <Button 
          variant="outline" 
          className="bg-gradient-to-br from-blue-600/20 to-blue-700/10 border-blue-500/30 text-blue-300 hover:bg-blue-600/30 hover:border-blue-400/50 h-auto py-4 flex-col gap-2"
        >
          <Power className="h-5 w-5" />
          <span className="text-xs font-medium">Restart Services</span>
        </Button>
        
        <Button 
          variant="outline"
          className="bg-gradient-to-br from-purple-600/20 to-purple-700/10 border-purple-500/30 text-purple-300 hover:bg-purple-600/30 hover:border-purple-400/50 h-auto py-4 flex-col gap-2"
        >
          <Database className="h-5 w-5" />
          <span className="text-xs font-medium">Clear Cache</span>
        </Button>
        
        <Button 
          variant="outline"
          className="bg-gradient-to-br from-amber-600/20 to-amber-700/10 border-amber-500/30 text-amber-300 hover:bg-amber-600/30 hover:border-amber-400/50 h-auto py-4 flex-col gap-2"
        >
          <Zap className="h-5 w-5" />
          <span className="text-xs font-medium">Optimize DB</span>
        </Button>
        
        <Button 
          variant="outline"
          className="bg-gradient-to-br from-rose-600/20 to-rose-700/10 border-rose-500/30 text-rose-300 hover:bg-rose-600/30 hover:border-rose-400/50 h-auto py-4 flex-col gap-2"
        >
          <Trash2 className="h-5 w-5" />
          <span className="text-xs font-medium">Clean Logs</span>
        </Button>
        
        <Button 
          variant="outline"
          className="bg-gradient-to-br from-emerald-600/20 to-emerald-700/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 hover:border-emerald-400/50 h-auto py-4 flex-col gap-2"
        >
          <RefreshCw className="h-5 w-5" />
          <span className="text-xs font-medium">Sync Data</span>
        </Button>
        
        <Button 
          variant="outline"
          className="bg-gradient-to-br from-red-600/20 to-red-700/10 border-red-500/30 text-red-300 hover:bg-red-600/30 hover:border-red-400/50 h-auto py-4 flex-col gap-2"
        >
          <AlertTriangle className="h-5 w-5" />
          <span className="text-xs font-medium">Emergency</span>
        </Button>
      </div>

      {/* Business Metrics - Estilo NOC */}
      <div className="mb-6 grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 border-slate-700/50 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total de Tenants</CardTitle>
            <Building2 className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white mb-2">{stats?.total_tenants || 0}</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold text-emerald-400">{stats?.active_tenants || 0}</span>
              <span className="text-sm text-slate-400">ativos agora</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/10 border-emerald-700/50 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Receita do Mês</CardTitle>
            <DollarSign className="h-5 w-5 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-400 mb-2">
              {formatCurrency(parseFloat(stats?.total_revenue_month || '0'))}
            </div>
            <div className="text-sm text-slate-400">
              {formatCurrency(parseFloat(stats?.total_revenue_year || '0'))} no ano
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-900/30 to-amber-800/10 border-amber-700/50 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Pagamentos Pendentes</CardTitle>
            <Calendar className="h-5 w-5 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white mb-2">{stats?.pending_payments || 0}</div>
            {stats?.overdue_payments ? (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-red-400 font-medium">{stats.overdue_payments} em atraso</span>
              </div>
            ) : (
              <span className="text-emerald-400 font-medium">✓ Tudo em dia</span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* NOC Grid - 2 linhas x 3 colunas estilo profissional */}
      <div className="grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        <SentryHealthCard />
        <SentryPerformanceCard />
        <RedisHealthCard />
        <InfraHealthCard />
        <UptimeUsersCard />
        
        {/* Card Extra: System Alerts */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 border-slate-700/50 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              Alertas do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-slate-400 text-center py-8">
              <Activity className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
              <p className="font-medium text-white">Nenhum alerta crítico</p>
              <p className="text-xs mt-1">Sistema operando normalmente</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
