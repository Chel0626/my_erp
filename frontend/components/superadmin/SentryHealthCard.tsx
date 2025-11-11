/**
 * Componente: Saúde do Código (Sentry)
 * Mostra crash-free users, novos erros e erros recorrentes
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { useSentryHealth } from '@/hooks/useSystemHealth';
import { cn } from '@/lib/utils';

export default function SentryHealthCard() {
  const { data: metrics, isLoading, error } = useSentryHealth();

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="text-lg">Saúde do Código (Sentry)</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (error || !metrics) {
    return (
      <Card className="border-red-500">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Saúde do Código (Sentry)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Erro ao carregar métricas do Sentry
          </p>
        </CardContent>
      </Card>
    );
  }

  const crashFreePercentage = metrics.crash_free_users_percentage;
  const statusColor = crashFreePercentage >= 99 
    ? 'text-green-600 border-green-600' 
    : crashFreePercentage >= 95 
    ? 'text-yellow-600 border-yellow-600' 
    : 'text-red-600 border-red-600';

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Saúde do Código (Sentry)</span>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-8 w-8 p-0"
          >
            <a href={metrics.sentry_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Crash-Free Users - Velocímetro */}
        <div className="flex flex-col items-center">
          <div className={cn(
            "relative w-32 h-32 rounded-full border-8 flex items-center justify-center",
            statusColor
          )}>
            <div className="text-center">
              <div className="text-3xl font-bold">{crashFreePercentage.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Crash-Free</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Usuários Sem Falhas</p>
        </div>

        {/* Contadores de Erros */}
        <div className="grid grid-cols-2 gap-4">
          {/* Novos Erros */}
          <div className="flex flex-col items-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium">Novos Erros</span>
            </div>
            <div className="text-3xl font-bold text-red-600">
              {metrics.new_issues_count}
            </div>
          </div>

          {/* Erros Recorrentes */}
          <div className="flex flex-col items-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium">Recorrentes</span>
            </div>
            <div className="text-3xl font-bold text-orange-600">
              {metrics.recurring_issues_count}
            </div>
          </div>
        </div>

        {/* Botão Ver Todos */}
        <Button
          variant="outline"
          className="w-full"
          asChild
        >
          <a href={metrics.sentry_url} target="_blank" rel="noopener noreferrer">
            Ver Todos os Erros
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
