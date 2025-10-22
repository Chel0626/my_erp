import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// ==================== TYPES ====================

export interface Tenant {
  id: string;
  name: string;
  plan: string;
  is_active: boolean;
  user_count: number;
  subscription_status: string;
  created_at: string;
}

export interface Subscription {
  id: number;
  tenant: string;
  tenant_name: string;
  plan: 'free' | 'basic' | 'professional' | 'enterprise';
  plan_display: string;
  status: 'trial' | 'active' | 'suspended' | 'cancelled' | 'expired';
  status_display: string;
  payment_status: 'pending' | 'paid' | 'overdue' | 'failed';
  payment_status_display: string;
  monthly_price: string;
  max_users: number;
  max_appointments_per_month: number;
  features: Record<string, boolean>;
  start_date: string;
  trial_end_date: string | null;
  next_billing_date: string | null;
  days_until_expiration: number | null;
  is_active: boolean;
  is_trial: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  subscription: number;
  tenant_name: string;
  amount: string;
  payment_method: 'credit_card' | 'debit_card' | 'pix' | 'bank_slip' | 'bank_transfer';
  payment_method_display: string;
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  status_display: string;
  reference_month: string;
  paid_at: string | null;
  transaction_id: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface SystemError {
  id: number;
  tenant: string | null;
  tenant_name: string | null;
  error_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  severity_display: string;
  status: 'new' | 'investigating' | 'resolved' | 'ignored';
  status_display: string;
  message: string;
  stack_trace: string;
  endpoint: string;
  user_email: string;
  ip_address: string;
  user_agent: string;
  occurrences: number;
  first_seen: string;
  last_seen: string;
  resolved_at: string | null;
  resolved_by: string;
  resolution_notes: string;
}

export interface UsageStats {
  id: number;
  tenant: string;
  tenant_name: string;
  month: string;
  month_display: string;
  total_users: number;
  active_users: number;
  total_appointments: number;
  completed_appointments: number;
  total_revenue: string;
  total_customers: number;
  new_customers: number;
  api_calls: number;
  storage_used_mb: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_tenants: number;
  active_tenants: number;
  trial_tenants: number;
  suspended_tenants: number;
  total_revenue_month: string;
  total_revenue_year: string;
  pending_payments: number;
  overdue_payments: number;
  critical_errors: number;
  unresolved_errors: number;
  total_users: number;
  total_appointments_month: number;
}

export interface RevenueByPlan {
  plan: string;
  plan_display: string;
  count: number;
  revenue: string;
}

// ==================== API FUNCTIONS ====================

// Dashboard
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await api.get('/superadmin/dashboard/stats/');
  return data;
};

export const getRevenueByPlan = async (): Promise<RevenueByPlan[]> => {
  const { data } = await api.get('/superadmin/dashboard/revenue_by_plan/');
  return data;
};

export const getRecentErrors = async (): Promise<SystemError[]> => {
  const { data } = await api.get('/superadmin/dashboard/recent_errors/');
  return data;
};

// Tenants
export const getTenants = async (): Promise<Tenant[]> => {
  const { data } = await api.get('/superadmin/tenants/');
  return data;
};

export const getActiveTenants = async (): Promise<Tenant[]> => {
  const { data } = await api.get('/superadmin/tenants/active/');
  return data;
};

export const getTenant = async (id: string): Promise<Tenant> => {
  const { data } = await api.get(`/superadmin/tenants/${id}/`);
  return data;
};

export const suspendTenant = async (id: string): Promise<void> => {
  await api.post(`/superadmin/tenants/${id}/suspend/`);
};

export const activateTenant = async (id: string): Promise<void> => {
  await api.post(`/superadmin/tenants/${id}/activate/`);
};

// Subscriptions
export const getSubscriptions = async (): Promise<Subscription[]> => {
  const { data } = await api.get('/superadmin/subscriptions/');
  return data;
};

export const getSubscription = async (id: number): Promise<Subscription> => {
  const { data } = await api.get(`/superadmin/subscriptions/${id}/`);
  return data;
};

export const getExpiringSoonSubscriptions = async (): Promise<Subscription[]> => {
  const { data } = await api.get('/superadmin/subscriptions/expiring_soon/');
  return data;
};

export const getTrialSubscriptions = async (): Promise<Subscription[]> => {
  const { data } = await api.get('/superadmin/subscriptions/trials/');
  return data;
};

export const suspendSubscription = async (id: number): Promise<void> => {
  await api.post(`/superadmin/subscriptions/${id}/suspend/`);
};

export const activateSubscription = async (id: number): Promise<void> => {
  await api.post(`/superadmin/subscriptions/${id}/activate/`);
};

export const upgradeSubscription = async (id: number, plan: string): Promise<Subscription> => {
  const { data } = await api.post(`/superadmin/subscriptions/${id}/upgrade/`, { plan });
  return data;
};

// Payments
export const getPayments = async (): Promise<Payment[]> => {
  const { data } = await api.get('/superadmin/payments/');
  return data;
};

export const getPayment = async (id: number): Promise<Payment> => {
  const { data } = await api.get(`/superadmin/payments/${id}/`);
  return data;
};

export const getOverduePayments = async (): Promise<Payment[]> => {
  const { data } = await api.get('/superadmin/payments/overdue/');
  return data;
};

export const getMonthlyRevenue = async (month: number, year: number): Promise<{ total: string }> => {
  const { data } = await api.get('/superadmin/payments/monthly_revenue/', {
    params: { month, year }
  });
  return data;
};

export const markPaymentPaid = async (id: number): Promise<void> => {
  await api.post(`/superadmin/payments/${id}/mark_paid/`);
};

// Errors
export const getSystemErrors = async (): Promise<SystemError[]> => {
  const { data } = await api.get('/superadmin/errors/');
  return data;
};

export const getSystemError = async (id: number): Promise<SystemError> => {
  const { data } = await api.get(`/superadmin/errors/${id}/`);
  return data;
};

export const getCriticalErrors = async (): Promise<SystemError[]> => {
  const { data } = await api.get('/superadmin/errors/critical/');
  return data;
};

export const getUnresolvedErrors = async (): Promise<SystemError[]> => {
  const { data } = await api.get('/superadmin/errors/unresolved/');
  return data;
};

export const resolveError = async (id: number, notes: string): Promise<void> => {
  await api.post(`/superadmin/errors/${id}/resolve/`, { notes });
};

export const ignoreError = async (id: number): Promise<void> => {
  await api.post(`/superadmin/errors/${id}/ignore/`);
};

// Usage Stats
export const getUsageStats = async (): Promise<UsageStats[]> => {
  const { data } = await api.get('/superadmin/usage/');
  return data;
};

export const getUsageStatsSummary = async (month: number, year: number) => {
  const { data } = await api.get('/superadmin/usage/summary/', {
    params: { month, year }
  });
  return data;
};

// ==================== REACT QUERY HOOKS ====================

// Dashboard
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['superadmin', 'dashboard', 'stats'],
    queryFn: getDashboardStats,
  });
};

export const useRevenueByPlan = () => {
  return useQuery({
    queryKey: ['superadmin', 'dashboard', 'revenue-by-plan'],
    queryFn: getRevenueByPlan,
  });
};

export const useRecentErrors = () => {
  return useQuery({
    queryKey: ['superadmin', 'dashboard', 'recent-errors'],
    queryFn: getRecentErrors,
  });
};

// Tenants
export const useTenants = () => {
  return useQuery({
    queryKey: ['superadmin', 'tenants'],
    queryFn: getTenants,
  });
};

export const useTenant = (id: string) => {
  return useQuery({
    queryKey: ['superadmin', 'tenants', id],
    queryFn: () => getTenant(id),
    enabled: !!id,
  });
};

export const useSuspendTenant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: suspendTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'tenants'] });
    },
  });
};

export const useActivateTenant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activateTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'tenants'] });
    },
  });
};

// Subscriptions
export const useSubscriptions = () => {
  return useQuery({
    queryKey: ['superadmin', 'subscriptions'],
    queryFn: getSubscriptions,
  });
};

export const useSubscription = (id: number) => {
  return useQuery({
    queryKey: ['superadmin', 'subscriptions', id],
    queryFn: () => getSubscription(id),
    enabled: !!id,
  });
};

export const useSuspendSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: suspendSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'subscriptions'] });
    },
  });
};

export const useActivateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activateSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'subscriptions'] });
    },
  });
};

export const useUpgradeSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, plan }: { id: number; plan: string }) => upgradeSubscription(id, plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'subscriptions'] });
    },
  });
};

// Payments
export const usePayments = () => {
  return useQuery({
    queryKey: ['superadmin', 'payments'],
    queryFn: getPayments,
  });
};

export const useMarkPaymentPaid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markPaymentPaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'payments'] });
    },
  });
};

// Errors
export const useSystemErrors = () => {
  return useQuery({
    queryKey: ['superadmin', 'errors'],
    queryFn: getSystemErrors,
  });
};

export const useCriticalErrors = () => {
  return useQuery({
    queryKey: ['superadmin', 'errors', 'critical'],
    queryFn: getCriticalErrors,
  });
};

export const useResolveError = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) => resolveError(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'errors'] });
    },
  });
};

export const useIgnoreError = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ignoreError,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'errors'] });
    },
  });
};

// Usage Stats
export const useUsageStats = () => {
  return useQuery({
    queryKey: ['superadmin', 'usage'],
    queryFn: getUsageStats,
  });
};
