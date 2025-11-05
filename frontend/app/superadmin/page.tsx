'use client';

import { useDashboardStats, useRevenueByPlan, useRecentErrors } from '@/hooks/useSuperAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default function SuperAdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: revenueByPlan, isLoading: revenueLoading } = useRevenueByPlan();
  const { data: recentErrors, isLoading: errorsLoading } = useRecentErrors();

  // Garante que os dados são arrays
  const revenueArray = Array.isArray(revenueByPlan) ? revenueByPlan : [];
  const errorsArray = Array.isArray(recentErrors) ? recentErrors : [];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8 pb-20 lg:pb-8">
      {/* Header - Compacto mobile */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard Super Admin</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Visão geral da plataforma multi-tenant</p>
      </div>

      {/* Main Stats Grid - Grid responsivo */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
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
              {stats?.trial_tenants ? (
                <span className="ml-1 sm:ml-2">
                  • <span className="text-blue-600 font-medium">{stats.trial_tenants}</span> trial
                </span>
              ) : null}
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

        {/* Critical Errors */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Erros Críticos</CardTitle>
            <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-red-600">{stats?.critical_errors || 0}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
              {stats?.unresolved_errors || 0} não resolvidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-2">
        {/* Total Users */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Usuários</CardTitle>
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats?.total_users || 0}</div>
          </CardContent>
        </Card>

        {/* Appointments This Month */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Agendamentos</CardTitle>
            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats?.total_appointments_month || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Plan */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Receita por Plano</CardTitle>
        </CardHeader>
        <CardContent>
          {revenueLoading ? (
            <div className="flex justify-center py-6 sm:py-8">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : revenueArray.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {revenueArray.map((item) => (
                <div key={item.plan} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-2 sm:p-0 border sm:border-0 rounded sm:rounded-none">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Badge variant="outline" className="text-xs">{item.plan_display}</Badge>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {item.count} {item.count === 1 ? 'assinatura' : 'assinaturas'}
                    </span>
                  </div>
                  <div className="text-base sm:text-lg font-semibold">
                    {formatCurrency(parseFloat(item.revenue))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6 sm:py-8 text-xs sm:text-sm">
              Nenhum dado de receita disponível
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Errors */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Erros Recentes</CardTitle>
          <Link 
            href="/superadmin/errors" 
            className="text-xs sm:text-sm text-primary hover:underline"
          >
            Ver todos
          </Link>
        </CardHeader>
        <CardContent>
          {errorsLoading ? (
            <div className="flex justify-center py-6 sm:py-8">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : errorsArray.length > 0 ? (
            <div className="space-y-2 sm:space-y-4">
              {errorsArray.slice(0, 5).map((error) => (
                <div key={error.id} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg">
                  <AlertTriangle className={`h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0 ${
                    error.severity === 'critical' ? 'text-red-600' : 
                    error.severity === 'high' ? 'text-orange-600' : 
                    'text-yellow-600'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                      <Badge variant={getSeverityColor(error.severity)} className="text-[10px] sm:text-xs">
                        {error.severity_display}
                      </Badge>
                      {error.tenant_name && (
                        <span className="text-[10px] sm:text-sm text-muted-foreground truncate">
                          {error.tenant_name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-medium line-clamp-2">{error.message}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">
                      {error.endpoint} • {error.occurrences} ocorrência(s)
                    </p>
                  </div>
                  {error.status === 'resolved' ? (
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6 sm:py-8 text-xs sm:text-sm">
              Nenhum erro recente registrado
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions - Grid responsivo */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/superadmin/tenants">
          <Card className="hover:bg-accent transition-colors cursor-pointer active:scale-[0.98]">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                Gerenciar Tenants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Visualizar e gerenciar todas as empresas cadastradas
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/superadmin/subscriptions">
          <Card className="hover:bg-accent transition-colors cursor-pointer active:scale-[0.98]">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                Assinaturas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Acompanhar planos, renovações e upgrades
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/superadmin/payments">
          <Card className="hover:bg-accent transition-colors cursor-pointer active:scale-[0.98]">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                Pagamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Controlar recebimentos e inadimplências
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
