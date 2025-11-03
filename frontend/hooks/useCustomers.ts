/**
 * Hooks para gerenciamento de Clientes
 * Usando React Query para cache e sincronização
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// ==================== TYPES ====================

export interface Customer {
  id: string;
  tenant: string;
  name: string;
  cpf?: string;
  email?: string;
  phone: string;
  phone_secondary?: string;
  birth_date?: string;
  gender?: 'M' | 'F' | 'O';
  
  // Endereço
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  address_neighborhood?: string;
  address_city?: string;
  address_state?: string;
  address_zipcode?: string;
  
  // Preferências
  preferences?: string;
  notes?: string;
  
  // Categorização
  tag: 'VIP' | 'REGULAR' | 'NOVO' | 'INATIVO';
  avatar_url?: string;
  is_active: boolean;
  
  // Metadata
  last_visit?: string;
  created_at: string;
  updated_at: string;
  
  // Campos calculados
  age?: number;
  full_address?: string;
  is_birthday_month?: boolean;
  total_appointments?: number;
  total_spent?: number;
}

export interface CustomerListItem {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tag: 'VIP' | 'REGULAR' | 'NOVO' | 'INATIVO';
  is_active: boolean;
  last_visit?: string;
  created_at: string;
}

export interface CustomerStats {
  total_spent: number;
  total_appointments: number;
  average_ticket: number;
  favorite_service?: {
    id: string;
    name: string;
    count: number;
  };
  favorite_professional?: {
    id: string;
    name: string;
    count: number;
  };
  last_appointment?: {
    id: string;
    date: string;
    service: string;
  };
}

export interface CustomerSummary {
  total_customers: number;
  active_customers: number;
  inactive_customers: number;
  vip_customers: number;
  regular_customers: number;
  new_customers: number;
  birthdays_this_month: number;
}

export interface CustomerFilters {
  tag?: 'VIP' | 'REGULAR' | 'NOVO' | 'INATIVO';
  is_active?: boolean;
  gender?: 'M' | 'F' | 'O';
  search?: string;
  ordering?: string;
}

// ==================== API FUNCTIONS ====================

const customersApi = {
  list: async (filters?: CustomerFilters): Promise<CustomerListItem[]> => {
    const { data } = await api.get('/customers/', { params: filters });
    // DRF retorna {results: [...]} quando há paginação
    return Array.isArray(data) ? data : data.results || [];
  },

  get: async (id: string): Promise<Customer> => {
    const { data } = await api.get(`/customers/${id}/`);
    return data;
  },

  create: async (customer: Partial<Customer>): Promise<Customer> => {
    const { data } = await api.post('/customers/', customer);
    return data;
  },

  update: async ({ id, ...customer }: Partial<Customer> & { id: string }): Promise<Customer> => {
    const { data } = await api.patch(`/customers/${id}/`, customer);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}/`);
  },

  stats: async (id: string): Promise<CustomerStats> => {
    const { data } = await api.get(`/customers/${id}/stats/`);
    return data;
  },

  appointments: async (id: string): Promise<any[]> => {
    const { data } = await api.get(`/customers/${id}/appointments/`);
    return data;
  },

  birthdays: async (): Promise<CustomerListItem[]> => {
    const { data } = await api.get('/customers/birthdays/');
    return data;
  },

  inactive: async (): Promise<CustomerListItem[]> => {
    const { data } = await api.get('/customers/inactive/');
    return data;
  },

  activate: async (id: string): Promise<Customer> => {
    const { data } = await api.post(`/customers/${id}/activate/`);
    return data;
  },

  deactivate: async (id: string): Promise<Customer> => {
    const { data } = await api.post(`/customers/${id}/deactivate/`);
    return data;
  },

  summary: async (): Promise<CustomerSummary> => {
    const { data } = await api.get('/customers/summary/');
    return data;
  },
};

// ==================== HOOKS ====================

/**
 * Hook para listar clientes com filtros
 */
export function useCustomers(filters?: CustomerFilters) {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: () => customersApi.list(filters),
  });
}

/**
 * Hook para obter um cliente específico
 */
export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => customersApi.get(id!),
    enabled: !!id,
  });
}

/**
 * Hook para criar cliente
 */
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cliente criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar cliente');
    },
  });
}

/**
 * Hook para atualizar cliente
 */
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customersApi.update,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', data.id] });
      toast.success('Cliente atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar cliente');
    },
  });
}

/**
 * Hook para deletar cliente
 */
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cliente removido com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao remover cliente');
    },
  });
}

/**
 * Hook para obter estatísticas de um cliente
 */
export function useCustomerStats(id: string | undefined) {
  return useQuery({
    queryKey: ['customers', id, 'stats'],
    queryFn: () => customersApi.stats(id!),
    enabled: !!id,
  });
}

/**
 * Hook para obter histórico de agendamentos de um cliente
 */
export function useCustomerAppointments(id: string | undefined) {
  return useQuery({
    queryKey: ['customers', id, 'appointments'],
    queryFn: () => customersApi.appointments(id!),
    enabled: !!id,
  });
}

/**
 * Hook para obter aniversariantes do mês
 */
export function useBirthdays() {
  return useQuery({
    queryKey: ['customers', 'birthdays'],
    queryFn: customersApi.birthdays,
  });
}

/**
 * Hook para obter clientes inativos
 */
export function useInactiveCustomers() {
  return useQuery({
    queryKey: ['customers', 'inactive'],
    queryFn: customersApi.inactive,
  });
}

/**
 * Hook para ativar cliente
 */
export function useActivateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customersApi.activate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', data.id] });
      toast.success('Cliente ativado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao ativar cliente');
    },
  });
}

/**
 * Hook para desativar cliente
 */
export function useDeactivateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customersApi.deactivate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', data.id] });
      toast.success('Cliente desativado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao desativar cliente');
    },
  });
}

/**
 * Hook para obter resumo estatístico de clientes
 */
export function useCustomerSummary() {
  return useQuery({
    queryKey: ['customers', 'summary'],
    queryFn: customersApi.summary,
  });
}

// ==================== EXPORTAÇÕES ====================

/**
 * Exporta clientes em formato CSV
 */
export async function exportCustomersCSV(filters?: CustomerFilters) {
  const params = new URLSearchParams();
  if (filters?.tag) params.append('tag', filters.tag);
  if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
  if (filters?.gender) params.append('gender', filters.gender);
  if (filters?.search) params.append('search', filters.search);

  const response = await api.get(`/customers/customers/export_csv/?${params.toString()}`, {
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'clientes.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Exporta clientes em formato Excel
 */
export async function exportCustomersExcel(filters?: CustomerFilters) {
  const params = new URLSearchParams();
  if (filters?.tag) params.append('tag', filters.tag);
  if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
  if (filters?.gender) params.append('gender', filters.gender);
  if (filters?.search) params.append('search', filters.search);

  const response = await api.get(`/customers/customers/export_excel/?${params.toString()}`, {
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'clientes.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
