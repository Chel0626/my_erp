'use client';

import { useSystemErrors, useResolveError, useIgnoreError } from '@/hooks/useSuperAdmin';
import { useSentryMetrics, formatSentryDate, getSentryLevelColor, getSentryLevelBadgeVariant } from '@/hooks/useSentry';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  ExternalLink,
  TrendingUp
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ErrorsPage() {
  const { data: errors, isLoading } = useSystemErrors();
  const { data: sentryMetrics, isLoading: sentryLoading } = useSentryMetrics();
  const resolveError = useResolveError();
  const ignoreError = useIgnoreError();
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [expandedError, setExpandedError] = useState<number | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Garante que errors é um array
  const errorsArray = Array.isArray(errors) ? errors : [];
  const sentryIssues = sentryMetrics?.recent_issues || [];

  const handleResolve = async (id: number) => {
    if (!resolutionNotes.trim()) {
      toast.error('Por favor, adicione uma nota de resolução');
      return;
    }

    setActionLoading(id);
    try {
      await resolveError.mutateAsync({ id, notes: resolutionNotes });
      toast.success('Erro marcado como resolvido!');
      setResolutionNotes('');
      setExpandedError(null);
    } catch (error) {
      toast.error('Erro ao resolver');
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleIgnore = async (id: number) => {
    if (!confirm('Tem certeza que deseja ignorar este erro?')) {
      return;
    }

    setActionLoading(id);
    try {
      await ignoreError.mutateAsync(id);
      toast.success('Erro ignorado!');
    } catch (error) {
      toast.error('Erro ao ignorar');
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return <Badge variant="destructive">Crítico</Badge>;
      case 'high':
        return <Badge className="bg-orange-600">Alto</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-600">Médio</Badge>;
      case 'low':
        return <Badge variant="outline">Baixo</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return <Badge className="bg-red-600">Novo</Badge>;
      case 'investigating':
        return <Badge className="bg-blue-600">Investigando</Badge>;
      case 'resolved':
        return <Badge className="bg-green-600">Resolvido</Badge>;
      case 'ignored':
        return <Badge variant="secondary">Ignorado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Calculate stats
  const stats = errorsArray.reduce(
    (acc, error) => {
      acc.total++;
      if (error.severity === 'critical') acc.critical++;
      if (error.status === 'new') acc.new++;
      if (error.status === 'resolved') acc.resolved++;
      return acc;
    },
    { total: 0, critical: 0, new: 0, resolved: 0 }
  );

  const isLoadingAny = isLoading || sentryLoading;

  if (isLoadingAny) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-8 w-8" />
            Erros do Sistema
          </h1>
          <p className="text-muted-foreground mt-1">
            Total de {stats?.total || 0} erro(s) registrado(s)
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Críticos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Novos</CardTitle>
              <XCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.new}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sentry Integration Section */}
      {sentryMetrics?.is_configured && (
        <div className="space-y-4">
          {/* Sentry Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monitoramento em Tempo Real (Sentry)
            </h2>
            <a 
              href={sentryMetrics.sentry_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Ver no Sentry
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* Sentry Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eventos 24h</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sentryMetrics.stats.total_events}</div>
                <p className="text-xs text-muted-foreground">
                  {sentryIssues.length} issues únicas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Issues Ativas</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sentryIssues.length}</div>
                <p className="text-xs text-muted-foreground">últimas 24 horas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Não Resolvidas</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {sentryIssues.filter(i => i.status !== 'resolved').length}
                </div>
                <p className="text-xs text-muted-foreground">aguardando ação</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolvidas</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {sentryIssues.filter(i => i.status === 'resolved').length}
                </div>
                <p className="text-xs text-muted-foreground">últimas 24h</p>
              </CardContent>
            </Card>
          </div>

          {/* Errors by Module */}
          {sentryMetrics.errors_by_module && Object.keys(sentryMetrics.errors_by_module).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Erros por Módulo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(sentryMetrics.errors_by_module)
                    .sort((a, b) => b[1] - a[1])
                    .map(([module, count]) => {
                      const total = Object.values(sentryMetrics.errors_by_module).reduce((a, b) => a + b, 0);
                      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                      
                      return (
                        <div key={module} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">{module}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {count} {count === 1 ? 'erro' : 'erros'}
                              </span>
                            </div>
                            <span className="text-sm font-semibold">{percentage}%</span>
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

          {/* Recent Sentry Errors */}
          {sentryIssues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Erros Recentes do Sentry</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sentryIssues.map((issue) => (
                    <a
                      key={issue.id}
                      href={issue.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent transition-colors group"
                    >
                      <AlertTriangle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${getSentryLevelColor(issue.level)}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge variant={getSentryLevelBadgeVariant(issue.level)}>
                            {issue.level.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {issue.metadata?.type || 'Error'}
                          </span>
                        </div>
                        <p className="text-sm font-medium mb-1 line-clamp-1">
                          {issue.title}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{issue.count} ocorrências</span>
                          <span>•</span>
                          <span>{formatSentryDate(issue.lastSeen)}</span>
                          {issue.metadata?.value && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[200px]">{issue.metadata.value}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {sentryMetrics && !sentryMetrics.is_configured && (
        <Card className="border-yellow-600">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertTriangle className="h-10 w-10 text-yellow-600 mb-3" />
            <p className="font-medium mb-1">Sentry não configurado</p>
            <p className="text-sm text-muted-foreground text-center">
              Configure as variáveis de ambiente SENTRY_AUTH_TOKEN, SENTRY_ORG_SLUG e SENTRY_PROJECT_SLUG
            </p>
          </CardContent>
        </Card>
      )}

      {/* System Errors Section */}
      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Erros do Sistema Interno
        </h2>
      </div>

      {/* Errors List */}
      {errorsArray.length > 0 ? (
        <div className="space-y-3">
          {errorsArray.map((error) => (
            <Card key={error.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                        error.severity === 'critical' ? 'text-red-600' : 
                        error.severity === 'high' ? 'text-orange-600' : 
                        error.severity === 'medium' ? 'text-yellow-600' : 
                        'text-muted-foreground'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getSeverityBadge(error.severity_display)}
                          {getStatusBadge(error.status_display)}
                          {error.tenant_name && (
                            <Badge variant="outline">{error.tenant_name}</Badge>
                          )}
                        </div>
                        <p className="font-medium">{error.message}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{error.error_type}</span>
                          <span>{error.endpoint}</span>
                          <span>{error.occurrences} ocorrência(s)</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedError(expandedError === error.id ? null : error.id)}
                    >
                      {expandedError === error.id ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Ocultar
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Detalhes
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Expanded Details */}
                  {expandedError === error.id && (
                    <div className="space-y-3 border-t pt-3">
                      {/* Stack Trace */}
                      {error.stack_trace && (
                        <div>
                          <p className="text-sm font-medium mb-2">Stack Trace:</p>
                          <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto max-h-60">
                            {error.stack_trace}
                          </pre>
                        </div>
                      )}

                      {/* Additional Info */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Usuário:</p>
                          <p className="font-medium">{error.user_email || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">IP:</p>
                          <p className="font-medium">{error.ip_address || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Primeira Ocorrência:</p>
                          <p className="font-medium">
                            {new Date(error.first_seen).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Última Ocorrência:</p>
                          <p className="font-medium">
                            {new Date(error.last_seen).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>

                      {/* User Agent */}
                      {error.user_agent && (
                        <div className="text-sm">
                          <p className="text-muted-foreground">User Agent:</p>
                          <p className="font-mono text-xs">{error.user_agent}</p>
                        </div>
                      )}

                      {/* Resolution */}
                      {error.status === 'resolved' && error.resolution_notes ? (
                        <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                          <p className="text-sm font-medium mb-1">Resolução:</p>
                          <p className="text-sm">{error.resolution_notes}</p>
                          {error.resolved_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Resolvido em {new Date(error.resolved_at).toLocaleString('pt-BR')}
                              {error.resolved_by && ` por ${error.resolved_by}`}
                            </p>
                          )}
                        </div>
                      ) : error.status !== 'resolved' && error.status !== 'ignored' && (
                        <div className="space-y-2">
                          <textarea
                            placeholder="Adicione uma nota de resolução..."
                            className="w-full p-2 border rounded-lg text-sm"
                            rows={3}
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleResolve(error.id)}
                              disabled={actionLoading === error.id || !resolutionNotes.trim()}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              {actionLoading === error.id ? 'Resolvendo...' : 'Marcar como Resolvido'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleIgnore(error.id)}
                              disabled={actionLoading === error.id}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Ignorar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
            <p className="text-lg font-medium">Nenhum erro registrado</p>
            <p className="text-sm text-muted-foreground mt-1">
              Ótimo! O sistema está funcionando sem erros
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
