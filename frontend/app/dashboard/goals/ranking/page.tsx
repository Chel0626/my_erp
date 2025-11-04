'use client';

import Link from 'next/link';
import { useGoalsRanking } from '@/hooks/useGoals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trophy, TrendingUp, Target, Award } from 'lucide-react';

export default function GoalsRankingPage() {
  const { data: ranking, isLoading } = useGoalsRanking();

  const getMedalColor = (position: number) => {
    switch (position) {
      case 1:
        return 'text-yellow-500';
      case 2:
        return 'text-gray-400';
      case 3:
        return 'text-orange-700';
      default:
        return 'text-muted-foreground';
    }
  };

  const getMedalBg = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-yellow-500/10';
      case 2:
        return 'bg-gray-400/10';
      case 3:
        return 'bg-orange-700/10';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/goals">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Ranking de Metas
          </h1>
          <p className="text-muted-foreground">
            Desempenho dos profissionais por metas alcançadas
          </p>
        </div>
      </div>

      {/* Ranking List */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">Carregando ranking...</p>
          </CardContent>
        </Card>
      ) : ranking && ranking.length > 0 ? (
        <div className="space-y-4">
          {ranking.map((entry) => (
            <Card
              key={entry.user.id}
              className={`${
                entry.position <= 3 ? 'border-2' : ''
              } ${
                entry.position === 1
                  ? 'border-yellow-500'
                  : entry.position === 2
                  ? 'border-gray-400'
                  : entry.position === 3
                  ? 'border-orange-700'
                  : ''
              }`}
            >
              <CardContent className="py-6">
                <div className="flex items-center gap-6">
                  {/* Position */}
                  <div
                    className={`flex items-center justify-center w-16 h-16 rounded-full ${getMedalBg(
                      entry.position
                    )}`}
                  >
                    {entry.position <= 3 ? (
                      <Trophy className={`h-8 w-8 ${getMedalColor(entry.position)}`} />
                    ) : (
                      <span className="text-2xl font-bold text-muted-foreground">
                        {entry.position}
                      </span>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">
                          {entry.user.full_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {entry.user.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-primary" />
                          <span className="text-3xl font-bold text-primary">
                            {entry.score}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">Pontuação</p>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm font-medium">Total de Metas</p>
                        </div>
                        <p className="text-2xl font-bold">{entry.total_goals}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-green-600" />
                          <p className="text-sm font-medium">Concluídas</p>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                          {entry.completed_goals}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <p className="text-sm font-medium">Ativas</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">
                          {entry.active_goals}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-purple-600" />
                          <p className="text-sm font-medium">Taxa de Sucesso</p>
                        </div>
                        <p className="text-2xl font-bold text-purple-600">
                          {Math.round(entry.success_rate)}%
                        </p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progresso Médio</span>
                        <span className="font-semibold">
                          {Math.round(entry.average_progress)}%
                        </span>
                      </div>
                      <Progress value={entry.average_progress} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum dado de ranking</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Crie metas para ver o ranking dos profissionais
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
