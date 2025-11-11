/**
 * Componente: Saúde do Cache (Redis) - Estilo NOC
 * Mostra métricas e permite ações de gerenciamento
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Database, Trash2, Zap, Activity } from 'lucide-react';
import { 
  useRedisMetrics, 
  useFlushRedis
} from '@/hooks/useSystemHealth';
import { toast } from 'sonner';

export default function RedisHealthCard() {
  const { data: metrics, isLoading } = useRedisMetrics();
  const flushRedis = useFlushRedis();

  const handleFlushAll = async () => {
    try {
      await flushRedis.mutateAsync();
      toast.success('🚀 Cache limpo com sucesso!');
    } catch {
      toast.error('⚠️ Erro ao limpar cache');
    }
  };

  if (isLoading || !metrics) {
    return (
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 border-slate-700/50 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg text-white">💾 Cache Redis</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-cyan-500 border-r-transparent border-b-cyan-500 border-l-transparent mx-auto"></div>
            <p className="text-sm text-slate-400">Carregando métricas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hitRatio = metrics.hit_ratio_percentage;
  const hitRatioColor = hitRatio >= 80 
    ? 'text-emerald-400' 
    : hitRatio >= 60 
    ? 'text-amber-400' 
    : 'text-red-400';

  const memoryUsagePercent = (metrics.used_memory_mb / metrics.max_memory_mb) * 100;

  return (
    <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 border-slate-700/50 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between text-white">
          <span className="flex items-center gap-2">
            💾 Cache Redis
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
              {metrics.keys_total.toLocaleString()} keys
            </Badge>
          </span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-emerald-400">ONLINE</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Hit Ratio - Métrica Principal NOC */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-600/20 to-cyan-700/10 border border-cyan-500/30 p-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="relative">
            <p className="text-xs font-medium text-cyan-300 mb-1">HIT RATIO</p>
            <p className={`text-5xl font-bold ${hitRatioColor}`}>
              {hitRatio.toFixed(1)}
              <span className="text-2xl ml-1">%</span>
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <div>
                <span className="text-slate-400">Hits:</span>
                <span className="text-emerald-400 font-bold ml-2">{metrics.hits.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400">Misses:</span>
                <span className="text-red-400 font-bold ml-2">{metrics.misses.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Uso de Memória - Barra de Progresso */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">💽 Uso de Memória</span>
            <span className="text-sm font-bold text-cyan-400">
              {metrics.used_memory_mb.toFixed(1)} / {metrics.max_memory_mb.toFixed(1)} MB
            </span>
          </div>
          <div className="relative h-6 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/30">
            <div 
              className={`absolute inset-y-0 left-0 bg-gradient-to-r ${
                memoryUsagePercent > 90 
                  ? 'from-red-500 to-red-600' 
                  : memoryUsagePercent > 70 
                  ? 'from-amber-500 to-amber-600' 
                  : 'from-cyan-500 to-blue-600'
              } transition-all duration-1000`}
              style={{ width: `${memoryUsagePercent}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
              {memoryUsagePercent.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Métricas Rápidas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-slate-400">CONEXÕES</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">{metrics.connected_clients}</p>
          </div>

          <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-1">
              <Database className="h-4 w-4 text-purple-400" />
              <span className="text-xs text-slate-400">OPERAÇÕES/SEG</span>
            </div>
            <p className="text-2xl font-bold text-purple-400">{metrics.ops_per_sec.toFixed(0)}</p>
          </div>
        </div>

        {/* Botões de Ação Crítica */}
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30 hover:border-red-400/50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Flush All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-900 border-slate-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">⚠️ Limpar Todo Cache?</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400">
                  Esta ação irá remover <strong>TODAS as {metrics.keys_total.toLocaleString()} chaves</strong> do Redis. 
                  Esta ação não pode ser desfeita e pode causar lentidão temporária no sistema.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-300">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleFlushAll}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Confirmar Limpeza
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

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
