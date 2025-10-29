'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle2, XCircle, AlertCircle, Minus, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ServiceHealth {
  status: 'healthy' | 'unhealthy' | 'degraded' | 'not_configured' | 'configured';
  response_time_ms?: number;
  error?: string;
  type?: string;
  note?: string;
  dsn_set?: boolean;
  environment?: string;
  host?: string;
}

interface HealthData {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: number;
  environment: string;
  services: {
    database?: ServiceHealth;
    cache?: ServiceHealth;
    sentry?: ServiceHealth;
    email?: ServiceHealth;
  };
}

export default function HealthPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    checkHealth();
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/core/health/');
      setHealth(response.data);
      setLastCheck(new Date());
    } catch (err: any) {
      console.error('Erro ao verificar saúde:', err);
      setError(err.message || 'Erro ao conectar com o backend');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'configured':
        return <CheckCircle2 className="h-5 w-5 text-blue-500" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'not_configured':
        return <Minus className="h-5 w-5 text-gray-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'configured':
        return 'bg-blue-100 text-blue-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'unhealthy':
        return 'bg-red-100 text-red-800';
      case 'not_configured':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'Saudável';
      case 'configured':
        return 'Configurado';
      case 'degraded':
        return 'Degradado';
      case 'unhealthy':
        return 'Com Problemas';
      case 'not_configured':
        return 'Não Configurado';
      default:
        return 'Desconhecido';
    }
  };

  const getOverallStatusBadge = () => {
    if (!health) return null;
    
    const statusConfig = {
      healthy: { bg: 'bg-green-100', text: 'text-green-800', icon: '✅', label: 'OPERACIONAL' },
      degraded: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⚠️', label: 'DEGRADADO' },
      unhealthy: { bg: 'bg-red-100', text: 'text-red-800', icon: '🔴', label: 'COM PROBLEMAS' },
    };
    
    const config = statusConfig[health.status] || statusConfig.degraded;
    
    return (
      <Badge className={`${config.bg} ${config.text} text-base px-4 py-2`}>
        {config.icon} {config.label}
      </Badge>
    );
  };

  if (error) {
    return (
      <div className="p-8">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Erro ao carregar Health Check</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              O backend pode estar offline ou há problemas de conectividade.
            </p>
            <Button onClick={checkHealth} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Saúde do Sistema</h1>
          <p className="text-gray-500 mt-1">
            {lastCheck 
              ? `Última verificação: ${formatDistanceToNow(lastCheck, { addSuffix: true, locale: ptBR })}`
              : 'Verificando...'}
          </p>
        </div>
        <Button onClick={checkHealth} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Verificar Agora
        </Button>
      </div>

      {/* Status Geral */}
      {health && (
        <Card className={
          health.status === 'healthy' ? 'border-green-200' :
          health.status === 'degraded' ? 'border-yellow-200' :
          'border-red-200'
        }>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Status Geral do Sistema</CardTitle>
                <CardDescription className="text-base mt-1">
                  Ambiente: <span className="font-semibold">{health.environment}</span>
                </CardDescription>
              </div>
              {getOverallStatusBadge()}
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Serviços */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Database */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(health?.services.database?.status || '')}
                <div>
                  <CardTitle className="text-lg">Database</CardTitle>
                  <CardDescription>
                    {health?.services.database?.type || 'PostgreSQL'}
                  </CardDescription>
                </div>
              </div>
              <Badge className={getStatusColor(health?.services.database?.status || '')}>
                {getStatusText(health?.services.database?.status || '')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {health?.services.database?.response_time_ms && (
              <p className="text-sm text-gray-600">
                ⚡ Tempo de resposta: <span className="font-semibold">{health.services.database.response_time_ms}ms</span>
              </p>
            )}
            {health?.services.database?.error && (
              <div className="bg-red-50 p-3 rounded-md mt-2">
                <p className="text-sm text-red-600 font-mono">
                  {health.services.database.error}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cache/Redis */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(health?.services.cache?.status || '')}
                <div>
                  <CardTitle className="text-lg">Cache</CardTitle>
                  <CardDescription>
                    {health?.services.cache?.type || 'Redis / LocMem'}
                  </CardDescription>
                </div>
              </div>
              <Badge className={getStatusColor(health?.services.cache?.status || '')}>
                {getStatusText(health?.services.cache?.status || '')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {health?.services.cache?.response_time_ms && (
              <p className="text-sm text-gray-600">
                ⚡ Tempo de resposta: <span className="font-semibold">{health.services.cache.response_time_ms}ms</span>
              </p>
            )}
            {health?.services.cache?.note && (
              <p className="text-sm text-gray-500 italic mt-2">
                ℹ️ {health.services.cache.note}
              </p>
            )}
            {health?.services.cache?.error && (
              <div className="bg-yellow-50 p-3 rounded-md mt-2">
                <p className="text-sm text-yellow-700 font-mono">
                  {health.services.cache.error}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sentry */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(health?.services.sentry?.status || '')}
                <div>
                  <CardTitle className="text-lg">Sentry</CardTitle>
                  <CardDescription>Monitoramento de Erros</CardDescription>
                </div>
              </div>
              <Badge className={getStatusColor(health?.services.sentry?.status || '')}>
                {getStatusText(health?.services.sentry?.status || '')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                DSN: <span className="font-semibold">{health?.services.sentry?.dsn_set ? '✅ Configurado' : '❌ Não configurado'}</span>
              </p>
              <p className="text-sm text-gray-600">
                Ambiente: <span className="font-semibold">{health?.services.sentry?.environment || 'unknown'}</span>
              </p>
              {health?.services.sentry?.status === 'configured' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => window.open('https://sentry.io/', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir Dashboard Sentry
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Email */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(health?.services.email?.status || '')}
                <div>
                  <CardTitle className="text-lg">Email Service</CardTitle>
                  <CardDescription>Envio de Emails</CardDescription>
                </div>
              </div>
              <Badge className={getStatusColor(health?.services.email?.status || '')}>
                {getStatusText(health?.services.email?.status || '')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {health?.services.email?.host && (
              <p className="text-sm text-gray-600">
                Host: <span className="font-semibold">{health.services.email.host}</span>
              </p>
            )}
            {health?.services.email?.status === 'not_configured' && (
              <p className="text-sm text-gray-500 italic">
                ℹ️ Email não configurado (opcional para desenvolvimento)
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info de Testes */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">🧪 Testar Sentry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-blue-800">
            Para testar se o Sentry está funcionando, você pode gerar erros propositais:
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/api/sentry-test', '_blank')}
            >
              Erro no Frontend
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('http://localhost:8000/api/core/sentry-test/', '_blank')}
            >
              Erro no Backend
            </Button>
          </div>
          <p className="text-xs text-blue-700 italic">
            Após clicar, verifique o dashboard do Sentry em alguns segundos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
