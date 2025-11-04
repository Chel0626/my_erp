/**
 * Hook para buscar dados de relatórios e dashboards
 * Utiliza React Query para cache e gerenciamento de estado
 */

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ==================== INTERFACES ====================

export interface RevenueChartData {
  start_date: string;
  end_date: string;
  period: 'day' | 'week' | 'month';
  data: Array<{
    period: string;
    total: string;
    count: number;
  }>;
}

export interface ExpenseChartData {
  start_date: string;
  end_date: string;
  period: 'day' | 'week' | 'month';
  data: Array<{
    period: string;
    total: string;
    count: number;
  }>;
}

export interface StatusDistribution {
  total: number;
  data: Array<{
    status: string;
    status_display: string;
    count: number;
    percentage: number;
  }>;
}

export interface TopService {
  service_id: string;
  service_name: string;
  price: string;
  appointments_count: number;
  total_revenue: string;
}

export interface ProfessionalPerformance {
  professional_id: string;
  professional_name: string;
  professional_email: string;
  total_appointments: number;
  completed: number;
  cancelled: number;
  total_revenue: number;
  completion_rate: number;
}

export interface CommissionPerformance {
  professional_id: string;
  professional_name: string;
  professional_email: string;
  total_commissions: number;
  count_paid: number;
  count_pending: number;
  count_cancelled: number;
  total_paid: number;
  total_pending: number;
  total_cancelled: number;
  completion_rate: number;
  total_amount: number;
}

export interface BestSellingProduct {
  product_id: string;
  product_name: string;
  sku: string;
  sale_price: number;
  current_stock: number;
  total_quantity_sold: number;
  total_sales_count: number;
  total_revenue: number;
}

export interface AppointmentsTimeline {
  start_date: string;
  end_date: string;
  period: 'day' | 'week' | 'month';
  data: Array<{
    period: string;
    total: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  }>;
}

export interface ReportFilters {
  start_date?: string;
  end_date?: string;
  period?: 'day' | 'week' | 'month';
  limit?: number;
}

// ==================== HOOKS ====================

/**
 * Busca dados para gráfico de receita ao longo do tempo
 */
export function useRevenueChart(filters?: ReportFilters) {
  return useQuery<RevenueChartData>({
    queryKey: ['reports', 'revenue-chart', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.period) params.append('period', filters.period);

      const response = await api.get(
        `/financial/transactions/revenue_chart/?${params.toString()}`
      );
      return response.data;
    },
  });
}

/**
 * Busca dados para gráfico de despesas ao longo do tempo
 */
export function useExpenseChart(filters?: ReportFilters) {
  return useQuery<ExpenseChartData>({
    queryKey: ['reports', 'expense-chart', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.period) params.append('period', filters.period);

      const response = await api.get(
        `/financial/transactions/expense_chart/?${params.toString()}`
      );
      return response.data;
    },
  });
}

/**
 * Busca distribuição de agendamentos por status
 */
export function useStatusDistribution(filters?: ReportFilters) {
  return useQuery<StatusDistribution>({
    queryKey: ['reports', 'status-distribution', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);

      const response = await api.get(
        `/scheduling/appointments/status_distribution/?${params.toString()}`
      );
      return response.data;
    },
  });
}

/**
 * Busca top serviços mais agendados
 */
export function useTopServices(filters?: ReportFilters) {
  return useQuery<TopService[]>({
    queryKey: ['reports', 'top-services', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await api.get(
        `/scheduling/appointments/top_services/?${params.toString()}`
      );
      return response.data;
    },
  });
}

/**
 * Busca desempenho de cada profissional
 */
export function useProfessionalPerformance(filters?: ReportFilters) {
  return useQuery<ProfessionalPerformance[]>({
    queryKey: ['reports', 'professional-performance', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);

      const response = await api.get(
        `/scheduling/appointments/professional_performance/?${params.toString()}`
      );
      return response.data;
    },
  });
}

/**
 * Busca timeline de agendamentos para gráfico de linha
 */
export function useAppointmentsTimeline(filters?: ReportFilters) {
  return useQuery<AppointmentsTimeline>({
    queryKey: ['reports', 'appointments-timeline', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.period) params.append('period', filters.period);

      const response = await api.get(
        `/scheduling/appointments/appointments_timeline/?${params.toString()}`
      );
      return response.data;
    },
  });
}

/**
 * Busca desempenho de comissões por profissional
 */
export function useCommissionPerformance(filters?: ReportFilters) {
  return useQuery<CommissionPerformance[]>({
    queryKey: ['reports', 'commission-performance', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.start_date) params.append('date_from', filters.start_date);
      if (filters?.end_date) params.append('date_to', filters.end_date);

      const response = await api.get(
        `/commissions/professional_performance/?${params.toString()}`
      );
      return response.data;
    },
  });
}

/**
 * Busca produtos mais vendidos
 */
export function useBestSellingProducts(filters?: ReportFilters) {
  return useQuery<BestSellingProduct[]>({
    queryKey: ['reports', 'best-selling-products', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.start_date) params.append('date_from', filters.start_date);
      if (filters?.end_date) params.append('date_to', filters.end_date);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await api.get(
        `/inventory/products/best_selling/?${params.toString()}`
      );
      return response.data;
    },
  });
}

/**
 * Busca todos os dados de relatórios de uma vez
 * Útil para dashboard completo
 */
export function useAllReports(filters?: ReportFilters) {
  const revenueChart = useRevenueChart(filters);
  const expenseChart = useExpenseChart(filters);
  const statusDistribution = useStatusDistribution(filters);
  const topServices = useTopServices(filters);
  const professionalPerformance = useProfessionalPerformance(filters);
  const appointmentsTimeline = useAppointmentsTimeline(filters);
  const commissionPerformance = useCommissionPerformance(filters);
  const bestSellingProducts = useBestSellingProducts(filters);

  return {
    revenueChart,
    expenseChart,
    statusDistribution,
    topServices,
    professionalPerformance,
    appointmentsTimeline,
    commissionPerformance,
    bestSellingProducts,
    isLoading:
      revenueChart.isLoading ||
      expenseChart.isLoading ||
      statusDistribution.isLoading ||
      topServices.isLoading ||
      professionalPerformance.isLoading ||
      appointmentsTimeline.isLoading ||
      commissionPerformance.isLoading ||
      bestSellingProducts.isLoading,
    isError:
      revenueChart.isError ||
      expenseChart.isError ||
      statusDistribution.isError ||
      topServices.isError ||
      professionalPerformance.isError ||
      appointmentsTimeline.isError ||
      commissionPerformance.isError ||
      bestSellingProducts.isError,
  };
}
