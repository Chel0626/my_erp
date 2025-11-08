'use client';

import { useDashboardStats, useRevenueByPlan, useRecentErrors } from '@/hooks/useSuperAdmin';
import { useSentryMetrics, formatSentryDate, getSentryLevelColor, getSentryLevelBadgeVariant } from '@/hooks/useSentry';
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
  XCircle,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default function SuperAdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: revenueByPlan, isLoading: revenueLoading } = useRevenueByPlan();
  const { data: recentErrors, isLoading: errorsLoading } = useRecentErrors();
  const { data: sentryMetrics, isLoading: sentryLoading } = useSentryMetrics();

  // Garante que os dados são arrays
  const revenueArray = Array.isArray(revenueByPlan) ? revenueByPlan : [];
  const errorsArray = Array.isArray(recentErrors) ? recentErrors : [];
  const sentryIssues = sentryMetrics?.recent_issues || [];
  
  // Calcula total de erros do Sentry nas últimas 24h
  const sentryTotalEvents = sentryMetrics?.stats?.total_events || 0;

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
            <div className="text-xl sm:text-2xl font-bold text-red-600">
              {sentryLoading ? '...' : sentryTotalEvents}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
              {sentryLoading ? 'Carregando...' : `${sentryIssues.length} issues no Sentry`}
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

      {/* Errors by Module */}
      {sentryMetrics?.is_configured && Object.keys(sentryMetrics.errors_by_module || {}).length > 0 && (
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Erros por Módulo (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {Object.entries(sentryMetrics.errors_by_module)
                .sort((a, b) => b[1] - a[1]) // Ordena por quantidade decrescente
                .map(([module, count]) => {
                  const total = Object.values(sentryMetrics.errors_by_module).reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                  
                  return (
                    <div key={module} className="space-y-1.5 sm:space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Badge variant="outline" className="text-xs">{module}</Badge>
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            {count} {count === 1 ? 'erro' : 'erros'}
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm font-semibold">{percentage}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary rounded-full h-2 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Errors */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Erros Recentes (Sentry)</CardTitle>
          {sentryMetrics?.is_configured && (
            <a 
              href={sentryMetrics.sentry_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm text-primary hover:underline flex items-center gap-1"
            >
              Ver no Sentry
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </CardHeader>
        <CardContent>
          {sentryLoading ? (
            <div className="flex justify-center py-6 sm:py-8">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : !sentryMetrics?.is_configured ? (
            <div className="text-center py-6 sm:py-8">
              <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Sentry não configurado. Configure as variáveis de ambiente.
              </p>
            </div>
          ) : sentryIssues.length > 0 ? (
            <div className="space-y-2 sm:space-y-4">
              {sentryIssues.slice(0, 5).map((issue) => (
                <a
                  key={issue.id}
                  href={issue.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg hover:bg-accent transition-colors group"
                >
                  <AlertTriangle className={`h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0 ${getSentryLevelColor(issue.level)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                      <Badge variant={getSentryLevelBadgeVariant(issue.level)} className="text-[10px] sm:text-xs">
                        {issue.level.toUpperCase()}
                      </Badge>
                      <span className="text-[10px] sm:text-xs text-muted-foreground">
                        {issue.metadata?.type || 'Error'}
                      </span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground">
                        • {parseInt(issue.count)} ocorrências
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium line-clamp-2 group-hover:text-primary">
                      {issue.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate flex-1">
                        {issue.culprit}
                      </p>
                      <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                        {formatSentryDate(issue.lastSeen)}
                      </span>
                    </div>
                  </div>
                  {issue.status === 'resolved' ? (
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary mt-0.5 flex-shrink-0" />
                  )}
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-green-600 mx-auto mb-2" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                Nenhum erro registrado nas últimas 24 horas! 🎉
              </p>
            </div>
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
