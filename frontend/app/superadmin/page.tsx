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
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard Super Admin</h1>
        <p className="text-muted-foreground">Visão geral da plataforma multi-tenant</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Tenants */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tenants</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_tenants || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-medium">{stats?.active_tenants || 0}</span> ativos
              {stats?.trial_tenants ? (
                <span className="ml-2">
                  • <span className="text-blue-600 font-medium">{stats.trial_tenants}</span> trial
                </span>
              ) : null}
            </p>
          </CardContent>
        </Card>

        {/* Revenue This Month */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(parseFloat(stats?.total_revenue_month || '0'))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(parseFloat(stats?.total_revenue_year || '0'))} no ano
            </p>
          </CardContent>
        </Card>

        {/* Pending Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending_payments || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.overdue_payments ? (
                <span className="text-red-600 font-medium">{stats.overdue_payments} em atraso</span>
              ) : (
                <span className="text-green-600">Nenhum em atraso</span>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Critical Errors */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erros Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.critical_errors || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.unresolved_errors || 0} não resolvidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários na Plataforma</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
          </CardContent>
        </Card>

        {/* Appointments This Month */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_appointments_month || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Receita por Plano</CardTitle>
        </CardHeader>
        <CardContent>
          {revenueLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : revenueArray.length > 0 ? (
            <div className="space-y-4">
              {revenueArray.map((item) => (
                <div key={item.plan} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{item.plan_display}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {item.count} {item.count === 1 ? 'assinatura' : 'assinaturas'}
                    </span>
                  </div>
                  <div className="text-lg font-semibold">
                    {formatCurrency(parseFloat(item.revenue))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhum dado de receita disponível
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Errors */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Erros Recentes</CardTitle>
          <Link 
            href="/superadmin/errors" 
            className="text-sm text-primary hover:underline"
          >
            Ver todos
          </Link>
        </CardHeader>
        <CardContent>
          {errorsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : errorsArray.length > 0 ? (
            <div className="space-y-4">
              {errorsArray.slice(0, 5).map((error) => (
                <div key={error.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                    error.severity === 'critical' ? 'text-red-600' : 
                    error.severity === 'high' ? 'text-orange-600' : 
                    'text-yellow-600'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getSeverityColor(error.severity)}>
                        {error.severity_display}
                      </Badge>
                      {error.tenant_name && (
                        <span className="text-sm text-muted-foreground">
                          {error.tenant_name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium truncate">{error.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {error.endpoint} • {error.occurrences} ocorrência(s)
                    </p>
                  </div>
                  {error.status === 'resolved' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhum erro recente registrado
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/superadmin/tenants">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Gerenciar Tenants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Visualizar e gerenciar todas as empresas cadastradas
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/superadmin/subscriptions">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Assinaturas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Acompanhar planos, renovações e upgrades
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/superadmin/payments">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pagamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Controlar recebimentos e inadimplências
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
