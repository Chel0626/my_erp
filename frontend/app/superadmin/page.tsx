'use client';

import { useDashboardStats } from '@/hooks/useSuperAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building2, 
  DollarSign, 
  Calendar,
  Activity,
  Shield
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Centro de Saúde do Sistema
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Monitoramento em tempo real da infraestrutura e aplicação
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
          <Activity className="h-5 w-5 text-primary animate-pulse" />
          <span className="text-sm font-medium">Ao Vivo</span>
        </div>
      </div>

      {/* Quick Stats - Business Metrics */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3">
        {/* Total Tenants */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Tenants</CardTitle>
            <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats?.total_tenants || 0}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
              <span className="text-green-600 font-medium">{stats?.active_tenants || 0}</span> ativos
            </p>
          </CardContent>
        </Card>

        {/* Revenue This Month */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Receita Mês</CardTitle>
            <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-base sm:text-2xl font-bold">
              {formatCurrency(parseFloat(stats?.total_revenue_month || '0'))}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">
              {formatCurrency(parseFloat(stats?.total_revenue_year || '0'))} ano
            </p>
          </CardContent>
        </Card>

        {/* Pending Payments */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Pendentes</CardTitle>
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats?.pending_payments || 0}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
              {stats?.overdue_payments ? (
                <span className="text-red-600 font-medium">{stats.overdue_payments} atraso</span>
              ) : (
                <span className="text-green-600">Nenhum atraso</span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sistema de Saúde - Grid Principal 3x2 */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {/* Quadrante 1: Saúde do Código (Sentry) */}
        <SentryHealthCard />

        {/* Quadrante 2: Performance (Sentry APM) */}
        <SentryPerformanceCard />

        {/* Quadrante 3: Saúde do Cache (Redis) */}
        <RedisHealthCard />

        {/* Quadrante 4: Saúde da Infraestrutura */}
        <InfraHealthCard />

        {/* Quadrante 5: Disponibilidade & Usuários */}
        <UptimeUsersCard />
      </div>
    </div>
  );
}
