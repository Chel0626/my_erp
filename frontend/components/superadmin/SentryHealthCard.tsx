/**
 * Componente: Saúde do Código (Sentry) - Estilo NOC Profissional
 * Mostra crash-free users, novos erros e erros recorrentes
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, XCircle, ExternalLink, Zap } from 'lucide-react';
import { useSentryHealth } from '@/hooks/useSystemHealth';
import { cn } from '@/lib/utils';

export default function SentryHealthCard() {
  const { data: metrics, isLoading, error } = useSentryHealth();

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 border-slate-700/50 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg text-white">🔍 Saúde do Código</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent mx-auto"></div>
            <p className="text-sm text-slate-400">Carregando métricas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !metrics) {
    return (
      <Card className="bg-gradient-to-br from-red-900/30 to-red-800/10 border-red-700/50 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-white">
            <XCircle className="h-5 w-5 text-red-400" />
            🔍 Saúde do Código
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-400/80">
            ⚠️ Erro ao carregar métricas do Sentry
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4 bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
          >
            <Zap className="h-4 w-4 mr-2" />
            Reconectar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const crashFreePercentage = metrics.crash_free_users_percentage;
  const statusColor = crashFreePercentage >= 99 
    ? 'from-emerald-500 to-green-500' 
    : crashFreePercentage >= 95 
    ? 'from-amber-500 to-yellow-500' 
    : 'from-red-500 to-rose-500';
  
  const textColor = crashFreePercentage >= 99 
    ? 'text-emerald-400' 
    : crashFreePercentage >= 95 
    ? 'text-amber-400' 
    : 'text-red-400';

  return (
    <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 border-slate-700/50 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between text-white">
          <span className="flex items-center gap-2">
            🔍 Saúde do Código
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Sentry</Badge>
          </span>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <a href={metrics.sentry_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Crash-Free Users - Estilo NOC Velocímetro */}
        <div className="flex flex-col items-center">
          <div className="relative w-36 h-36">
            {/* Círculo de fundo */}
            <div className="absolute inset-0 rounded-full bg-slate-800/50 border-4 border-slate-700/30"></div>
            
            {/* Círculo de progresso */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeDasharray={`${(crashFreePercentage / 100) * 402} 402`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" className={`${statusColor.split(' ')[0].replace('from-', 'stop-')}`} />
                  <stop offset="100%" className={`${statusColor.split(' ')[1].replace('to-', 'stop-')}`} />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Número central */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={cn("text-4xl font-bold", textColor)}>
                  {crashFreePercentage.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500 font-medium">CRASH-FREE</div>
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-3">Usuários Sem Falhas</p>
        </div>

        {/* Contadores de Erros - Estilo NOC */}
        <div className="grid grid-cols-2 gap-3">
          {/* Novos Erros */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-600/20 to-red-700/10 border border-red-500/30 p-4">
            <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-xs font-medium text-red-300">NOVOS</span>
              </div>
              <div className="text-3xl font-bold text-red-400">
                {metrics.new_issues_count}
              </div>
            </div>
          </div>

          {/* Erros Recorrentes */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-600/20 to-amber-700/10 border border-amber-500/30 p-4">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-medium text-amber-300">RECORRENTES</span>
              </div>
              <div className="text-3xl font-bold text-amber-400">
                {metrics.recurring_issues_count}
              </div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 bg-blue-500/20 border-blue-500/30 text-blue-300 hover:bg-blue-500/30 hover:border-blue-400/50"
            asChild
          >
            <a href={metrics.sentry_url} target="_blank" rel="noopener noreferrer">
              Ver Erros
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button
            variant="outline"
            className="bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30"
          >
            <Zap className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
