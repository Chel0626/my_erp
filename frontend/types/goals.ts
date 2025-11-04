/**
 * Types para o módulo Goals/Metas
 */

export type GoalType = 'individual' | 'team';

export type TargetType = 'revenue' | 'sales_count' | 'services_count' | 'products_sold' | 'new_customers';

export type GoalPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export type GoalStatus = 'active' | 'completed' | 'failed' | 'cancelled';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  full_name: string;
}

export interface GoalProgress {
  id: number;
  goal: number;
  date: string;
  value: number;
  percentage: number;
  notes: string;
  created_at: string;
}

export interface Goal {
  id: number;
  tenant: string;
  user: number | null;
  user_details?: User;
  name: string;
  description: string;
  type: GoalType;
  type_display: string;
  target_type: TargetType;
  target_type_display: string;
  target_value: string;
  current_value: string;
  period: GoalPeriod;
  period_display: string;
  start_date: string;
  end_date: string;
  status: GoalStatus;
  status_display: string;
  percentage: number;
  progress_data: Array<{
    date: string;
    value: number;
    percentage: number;
  }>;
  created_at: string;
  updated_at: string;
}

export interface GoalCreateData {
  name: string;
  description?: string;
  type: GoalType;
  target_type: TargetType;
  target_value: number;
  period: GoalPeriod;
  start_date: string;
  end_date: string;
  user?: number | null;
}

export interface GoalUpdateData {
  name?: string;
  description?: string;
  status?: GoalStatus;
}

export interface GoalProgressUpdate {
  value: number;
  notes?: string;
}

export interface GoalFilters {
  user?: number;
  type?: GoalType;
  target_type?: TargetType;
  status?: GoalStatus;
  period?: GoalPeriod;
}

export interface GoalDashboard {
  total_goals: number;
  active_goals: number;
  completed_goals: number;
  failed_goals: number;
  average_progress: number;
  expiring_soon: Goal[];
  top_performers: Array<{
    user: User;
    goals_count: number;
    completed_count: number;
    average_progress: number;
  }>;
}

export interface GoalRanking {
  position: number;
  user: User;
  total_goals: number;
  completed_goals: number;
  active_goals: number;
  success_rate: number;
  average_progress: number;
  score: number;
}

// Opções para selects
export const GOAL_TYPE_OPTIONS = [
  { value: 'individual', label: 'Individual' },
  { value: 'team', label: 'Equipe' },
];

export const TARGET_TYPE_OPTIONS = [
  { value: 'revenue', label: 'Faturamento' },
  { value: 'sales_count', label: 'Quantidade de Vendas' },
  { value: 'services_count', label: 'Quantidade de Serviços' },
  { value: 'products_sold', label: 'Produtos Vendidos' },
  { value: 'new_customers', label: 'Novos Clientes' },
];

export const PERIOD_OPTIONS = [
  { value: 'daily', label: 'Diário' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'yearly', label: 'Anual' },
];

export const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativa' },
  { value: 'completed', label: 'Concluída' },
  { value: 'failed', label: 'Falhada' },
  { value: 'cancelled', label: 'Cancelada' },
];
