'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  useGoal,
  useUpdateGoalProgress,
  useRecalculateGoal,
  useCancelGoal,
  useDeleteGoal,
} from '@/hooks/useGoals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Calendar,
  RefreshCw,
  Save,
  Target,
  TrendingUp,
  User,
  Users,
  X,
  Trash2,
  BarChart3,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GoalProgressChart } from '@/components/goals/GoalProgressChart';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function GoalDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const { data: goal, isLoading } = useGoal(id);
  const updateProgress = useUpdateGoalProgress(parseInt(id));
  const recalculate = useRecalculateGoal(parseInt(id));
  const cancelGoal = useCancelGoal(parseInt(id));
  const deleteGoal = useDeleteGoal();

  const [progressValue, setProgressValue] = useState('');
  const [progressNotes, setProgressNotes] = useState('');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando meta...</p>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Meta não encontrada</h3>
              <Button className="mt-4" asChild>
                <Link href="/dashboard/goals">Voltar para Metas</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const percentage = Math.min(Math.round(goal.percentage), 100);
  const isActive = goal.status === 'active';

  // Formatar valor baseado no tipo
  const formatValue = (value: string) => {
    if (goal.target_type === 'revenue') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(parseFloat(value));
    }
    return value;
  };

  const handleUpdateProgress = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!progressValue) {
      toast({
        title: 'Erro',
        description: 'Informe o valor do progresso',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateProgress.mutateAsync({
        value: parseFloat(progressValue),
        notes: progressNotes,
      });
      toast({
        title: 'Sucesso!',
        description: 'Progresso atualizado com sucesso',
      });
      setProgressValue('');
      setProgressNotes('');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast({
        title: 'Erro ao atualizar progresso',
        description: err.response?.data?.detail || 'Tente novamente',
        variant: 'destructive',
      });
    }
  };

  const handleRecalculate = async () => {
    try {
      await recalculate.mutateAsync();
      toast({
        title: 'Sucesso!',
        description: 'Meta recalculada com sucesso',
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast({
        title: 'Erro ao recalcular',
        description: err.response?.data?.detail || 'Tente novamente',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = async () => {
    if (!confirm('Tem certeza que deseja cancelar esta meta?')) return;

    try {
      await cancelGoal.mutateAsync();
      toast({
        title: 'Meta cancelada',
        description: 'A meta foi cancelada com sucesso',
      });
      router.push('/dashboard/goals');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast({
        title: 'Erro ao cancelar',
        description: err.response?.data?.detail || 'Tente novamente',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.')) return;

    try {
      await deleteGoal.mutateAsync(parseInt(id));
      toast({
        title: 'Meta excluída',
        description: 'A meta foi excluída com sucesso',
      });
      router.push('/dashboard/goals');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast({
        title: 'Erro ao excluir',
        description: err.response?.data?.detail || 'Tente novamente',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/goals">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{goal.name}</h1>
            <p className="text-muted-foreground">{goal.target_type_display}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isActive && (
            <>
              <Button variant="outline" size="sm" onClick={handleRecalculate}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Recalcular
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancelar Meta
              </Button>
            </>
          )}
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge>{goal.status_display}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Progresso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">{percentage}%</p>
              <Progress value={percentage} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Valor Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatValue(goal.current_value)}</p>
            <p className="text-xs text-muted-foreground">
              Meta: {formatValue(goal.target_value)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Período</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-semibold">{goal.period_display}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(goal.start_date), 'dd/MM/yyyy', { locale: ptBR })}
              {' - '}
              {format(new Date(goal.end_date), 'dd/MM/yyyy', { locale: ptBR })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Evolução do Progresso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GoalProgressChart goal={goal} />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {goal.description && (
              <div>
                <Label>Descrição</Label>
                <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
              </div>
            )}

            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                {goal.type === 'individual' ? (
                  <User className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Users className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm">
                  <strong>Tipo:</strong> {goal.type_display}
                </span>
              </div>

              {goal.user_details && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Profissional:</strong> {goal.user_details.full_name}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Criada em:</strong>{' '}
                  {format(new Date(goal.created_at), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Update Progress */}
        {isActive && (
          <Card>
            <CardHeader>
              <CardTitle>Atualizar Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProgress} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="value">
                    Valor <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={progressValue}
                    onChange={(e) => setProgressValue(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Adicione observações sobre este progresso..."
                    value={progressNotes}
                    onChange={(e) => setProgressNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={updateProgress.isPending} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  {updateProgress.isPending ? 'Salvando...' : 'Salvar Progresso'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
