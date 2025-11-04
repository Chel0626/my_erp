'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGoals } from '@/hooks/useGoals';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Target, TrendingUp, Trophy, Users } from 'lucide-react';
import type { GoalFilters, GoalStatus, GoalType, TargetType, GoalPeriod } from '@/types/goals';
import { GoalCard } from '@/components/goals/GoalCard';
import { GoalsDashboard } from '@/components/goals/GoalsDashboard';
import { GoalsComparison } from '@/components/goals/GoalsComparison';

export default function GoalsPage() {
  const [filters, setFilters] = useState<GoalFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showDashboard, setShowDashboard] = useState(true);

  const { data: goals, isLoading } = useGoals(filters);

  // Filtrar por termo de busca
  const filteredGoals = goals?.filter((goal) => {
    if (!searchTerm) return true;
    return goal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           goal.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Estatísticas rápidas
  const stats = {
    total: goals?.length || 0,
    active: goals?.filter((g) => g.status === 'active').length || 0,
    completed: goals?.filter((g) => g.status === 'completed').length || 0,
    avgProgress: goals?.length
      ? Math.round(goals.reduce((sum, g) => sum + g.percentage, 0) / goals.length)
      : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Metas</h1>
          <p className="text-muted-foreground">
            Gerencie metas individuais e de equipe
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/goals/ranking">
              <Trophy className="mr-2 h-4 w-4" />
              Ranking
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/goals/new">
              <Plus className="mr-2 h-4 w-4" />
              Nova Meta
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Metas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metas Ativas</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <Trophy className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.avgProgress}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Section */}
      {showDashboard && (
        <>
          <GoalsDashboard />
          <GoalsComparison />
        </>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-5">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar metas..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <Select
              value={filters.type || 'all'}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  type: value === 'all' ? undefined : (value as GoalType),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="team">Equipe</SelectItem>
              </SelectContent>
            </Select>

            {/* Target Type Filter */}
            <Select
              value={filters.target_type || 'all'}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  target_type: value === 'all' ? undefined : (value as TargetType),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Meta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="revenue">Faturamento</SelectItem>
                <SelectItem value="sales_count">Qtd. Vendas</SelectItem>
                <SelectItem value="services_count">Qtd. Serviços</SelectItem>
                <SelectItem value="products_sold">Produtos Vendidos</SelectItem>
                <SelectItem value="new_customers">Novos Clientes</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  status: value === 'all' ? undefined : (value as GoalStatus),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativa</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="failed">Falhada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>

            {/* Period Filter */}
            <Select
              value={filters.period || 'all'}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  period: value === 'all' ? undefined : (value as GoalPeriod),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="quarterly">Trimestral</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Goals List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando metas...</p>
        </div>
      ) : filteredGoals && filteredGoals.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Target className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Nenhuma meta encontrada</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {searchTerm || Object.keys(filters).length > 0
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando sua primeira meta'}
              </p>
              {!searchTerm && Object.keys(filters).length === 0 && (
                <Button className="mt-4" asChild>
                  <Link href="/dashboard/goals/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Meta
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
