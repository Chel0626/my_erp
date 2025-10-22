'use client';

import { useSystemErrors, useResolveError, useIgnoreError } from '@/hooks/useSuperAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ErrorsPage() {
  const { data: errors, isLoading } = useSystemErrors();
  const resolveError = useResolveError();
  const ignoreError = useIgnoreError();
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [expandedError, setExpandedError] = useState<number | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

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
  const stats = errors?.reduce(
    (acc, error) => {
      acc.total++;
      if (error.severity === 'critical') acc.critical++;
      if (error.status === 'new') acc.new++;
      if (error.status === 'resolved') acc.resolved++;
      return acc;
    },
    { total: 0, critical: 0, new: 0, resolved: 0 }
  );

  if (isLoading) {
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

      {/* Errors List */}
      {errors && errors.length > 0 ? (
        <div className="space-y-3">
          {errors.map((error) => (
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
