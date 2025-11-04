'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGoalsDashboard } from '@/hooks/useGoals';
import { Target, TrendingUp, Trophy, AlertCircle } from 'lucide-react';
import { GoalCard } from './GoalCard';
import { Progress } from '@/components/ui/progress';

export function GoalsDashboard() {
  const { data: dashboard, isLoading } = useGoalsDashboard();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">Carregando dashboard...</p>
        </CardContent>
      </Card>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="space-y-4">
      {/* Expiring Soon */}
      {dashboard.expiring_soon && dashboard.expiring_soon.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Metas Próximas do Vencimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dashboard.expiring_soon.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Performers */}
      {dashboard.top_performers && dashboard.top_performers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Melhores Desempenhos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.top_performers.map((performer, index) => (
                <div
                  key={performer.user.id}
                  className="flex items-center gap-4 p-4 rounded-lg border"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 font-bold text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{performer.user.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {performer.completed_count} de {performer.goals_count} metas concluídas
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {Math.round(performer.average_progress)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Progresso médio</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
