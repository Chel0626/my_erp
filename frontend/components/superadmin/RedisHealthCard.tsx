/**
 * Componente: Saúde do Cache (Redis)
 * Mostra métricas e permite ações de gerenciamento
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Database, Trash2, Search, Users } from 'lucide-react';
import { 
  useRedisMetrics, 
  useFlushRedis, 
  useDeleteRedisKey, 
  useInspectRedisKey 
} from '@/hooks/useSystemHealth';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function RedisHealthCard() {
  const { data: metrics, isLoading } = useRedisMetrics();
  const flushRedis = useFlushRedis();
  const deleteKey = useDeleteRedisKey();
  const inspectKey = useInspectRedisKey();

  const [keyToDelete, setKeyToDelete] = useState('');
  const [keyToInspect, setKeyToInspect] = useState('');
  const [inspectionResult, setInspectionResult] = useState<{
    key: string;
    type: string;
    ttl: number | null;
    value: string | number | object;
  } | null>(null);

  const handleFlushAll = async () => {
    try {
      await flushRedis.mutateAsync();
      toast.success('Cache limpo com sucesso!');
    } catch (error) {
      toast.error('Erro ao limpar cache');
    }
  };

  const handleDeleteKey = async () => {
    if (!keyToDelete.trim()) {
      toast.error('Digite uma chave para deletar');
      return;
    }
    try {
      await deleteKey.mutateAsync(keyToDelete);
      toast.success(`Chave "${keyToDelete}" deletada`);
      setKeyToDelete('');
    } catch (error) {
      toast.error('Erro ao deletar chave');
    }
  };

  const handleInspectKey = async () => {
    if (!keyToInspect.trim()) {
      toast.error('Digite uma chave para inspecionar');
      return;
    }
    try {
      const result = await inspectKey.mutateAsync(keyToInspect);
      setInspectionResult(result);
      toast.success('Chave inspecionada!');
    } catch (error) {
      toast.error('Erro ao inspecionar chave');
      setInspectionResult(null);
    }
  };

  if (isLoading || !metrics) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="text-lg">Saúde do Cache (Redis)</CardTitle>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const hitRatioColor = metrics.hit_ratio_percentage >= 90 
    ? 'text-green-600 border-green-600' 
    : metrics.hit_ratio_percentage >= 70 
    ? 'text-yellow-600 border-yellow-600' 
    : 'text-red-600 border-red-600';

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Database className="h-5 w-5" />
          Saúde do Cache (Redis)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Taxa de Acerto - Velocímetro */}
        <div className="flex flex-col items-center">
          <div className={cn(
            "relative w-32 h-32 rounded-full border-8 flex items-center justify-center",
            hitRatioColor
          )}>
            <div className="text-center">
              <div className="text-3xl font-bold">{metrics.hit_ratio_percentage.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Hit Ratio</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Taxa de Acerto</p>
        </div>

        {/* Uso de Memória */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uso de Memória</span>
            <span className="font-medium">
              {metrics.used_memory_mb.toFixed(0)} MB / {metrics.max_memory_mb.toFixed(0)} MB
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-4">
            <div
              className={cn(
                "h-4 rounded-full transition-all",
                metrics.memory_usage_percentage >= 90 
                  ? "bg-red-600" 
                  : metrics.memory_usage_percentage >= 70 
                  ? "bg-yellow-600" 
                  : "bg-green-600"
              )}
              style={{ width: `${Math.min(metrics.memory_usage_percentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {metrics.memory_usage_percentage.toFixed(1)}% utilizado
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium">Clientes</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{metrics.connected_clients}</p>
          </div>

          <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-1">
              <Database className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-medium">Chaves</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{metrics.total_keys}</p>
          </div>
        </div>

        {/* Hits e Misses */}
        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Hits</p>
              <p className="text-lg font-bold text-green-600">{metrics.keyspace_hits.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Misses</p>
              <p className="text-lg font-bold text-red-600">{metrics.keyspace_misses.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Ações de Gerenciamento */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-medium">Ações de Gerenciamento</h4>

          {/* Deletar Chave */}
          <div className="space-y-2">
            <Label htmlFor="delete-key" className="text-xs">Deletar Chave Específica</Label>
            <div className="flex gap-2">
              <Input
                id="delete-key"
                placeholder="nome_da_chave"
                value={keyToDelete}
                onChange={(e) => setKeyToDelete(e.target.value)}
                className="text-sm"
              />
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDeleteKey}
                disabled={deleteKey.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Inspecionar Chave */}
          <div className="space-y-2">
            <Label htmlFor="inspect-key" className="text-xs">Inspecionar Chave</Label>
            <div className="flex gap-2">
              <Input
                id="inspect-key"
                placeholder="nome_da_chave"
                value={keyToInspect}
                onChange={(e) => setKeyToInspect(e.target.value)}
                className="text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleInspectKey}
                disabled={inspectKey.isPending}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {inspectionResult && (
              <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(inspectionResult, null, 2)}
              </pre>
            )}
          </div>

          {/* Limpar TODO o Cache */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar TODO o Cache
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação irá deletar <strong>TODAS</strong> as chaves do Redis.
                  Isso pode afetar temporariamente o desempenho da aplicação.
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleFlushAll}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Sim, limpar tudo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
