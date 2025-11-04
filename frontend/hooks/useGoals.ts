/**
 * Hook para gerenciar Goals/Metas
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  Goal,
  GoalProgress,
  GoalCreateData,
  GoalUpdateData,
  GoalProgressUpdate,
  GoalFilters,
  GoalDashboard,
  GoalRanking,
} from '@/types/goals';

const GOALS_KEY = 'goals';

// GET /api/goals/ - Lista de metas
export function useGoals(filters?: GoalFilters) {
  return useQuery({
    queryKey: [GOALS_KEY, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.user) params.append('user', filters.user.toString());
      if (filters?.type) params.append('type', filters.type);
      if (filters?.target_type) params.append('target_type', filters.target_type);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.period) params.append('period', filters.period);

      const response = await api.get<Goal[]>(`/goals/?${params.toString()}`);
      return response.data;
    },
  });
}

// GET /api/goals/:id/ - Detalhes de uma meta
export function useGoal(id: number | string) {
  return useQuery({
    queryKey: [GOALS_KEY, id],
    queryFn: async () => {
      const response = await api.get<Goal>(`/goals/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
}

// POST /api/goals/ - Criar meta
export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GoalCreateData) => {
      const response = await api.post<Goal>('/goals/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GOALS_KEY] });
    },
  });
}

// PATCH /api/goals/:id/ - Atualizar meta
export function useUpdateGoal(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GoalUpdateData) => {
      const response = await api.patch<Goal>(`/goals/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GOALS_KEY] });
      queryClient.invalidateQueries({ queryKey: [GOALS_KEY, id] });
    },
  });
}

// DELETE /api/goals/:id/ - Deletar meta
export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/goals/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GOALS_KEY] });
    },
  });
}

// POST /api/goals/:id/update_progress/ - Atualizar progresso manualmente
export function useUpdateGoalProgress(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GoalProgressUpdate) => {
      const response = await api.post<Goal>(`/goals/${id}/update_progress/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GOALS_KEY] });
      queryClient.invalidateQueries({ queryKey: [GOALS_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [`${GOALS_KEY}-progress`, id] });
    },
  });
}

// POST /api/goals/:id/recalculate/ - Recalcular progresso
export function useRecalculateGoal(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post<Goal>(`/goals/${id}/recalculate/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GOALS_KEY] });
      queryClient.invalidateQueries({ queryKey: [GOALS_KEY, id] });
    },
  });
}

// POST /api/goals/:id/cancel/ - Cancelar meta
export function useCancelGoal(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post<Goal>(`/goals/${id}/cancel/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GOALS_KEY] });
      queryClient.invalidateQueries({ queryKey: [GOALS_KEY, id] });
    },
  });
}

// GET /api/goals/dashboard/ - Dashboard de metas
export function useGoalsDashboard() {
  return useQuery({
    queryKey: [`${GOALS_KEY}-dashboard`],
    queryFn: async () => {
      const response = await api.get<GoalDashboard>('/goals/dashboard/');
      return response.data;
    },
  });
}

// GET /api/goals/ranking/ - Ranking de profissionais
export function useGoalsRanking() {
  return useQuery({
    queryKey: [`${GOALS_KEY}-ranking`],
    queryFn: async () => {
      const response = await api.get<GoalRanking[]>('/goals/ranking/');
      return response.data;
    },
  });
}

// POST /api/goals/recalculate_all/ - Recalcular todas as metas (admin)
export function useRecalculateAllGoals() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/goals/recalculate_all/');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GOALS_KEY] });
    },
  });
}

// GET /api/goals/:id/progress/ - Histórico de progresso
export function useGoalProgressHistory(goalId: number) {
  return useQuery({
    queryKey: [`${GOALS_KEY}-progress`, goalId],
    queryFn: async () => {
      const response = await api.get<GoalProgress[]>(`/goals/${goalId}/progress/`);
      return response.data;
    },
    enabled: !!goalId,
  });
}

// GET /api/goals/compare_periods/ - Comparação de períodos
export function useGoalsComparison() {
  return useQuery({
    queryKey: [`${GOALS_KEY}-comparison`],
    queryFn: async () => {
      const response = await api.get('/goals/compare_periods/');
      return response.data;
    },
  });
}
