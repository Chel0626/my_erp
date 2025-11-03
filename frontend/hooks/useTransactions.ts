import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// ==============================
// TYPES
// ==============================

export interface PaymentMethod {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  type: 'receita' | 'despesa';
  description: string;
  amount: string;
  date: string;
  payment_method: string;
  payment_method_details: PaymentMethod;
  appointment?: string;
  appointment_details?: any;
  notes: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionInput {
  type: 'receita' | 'despesa';
  description: string;
  amount: string | number;
  date: string;
  payment_method_id: string;
  appointment_id?: string;
  notes?: string;
}

export interface UpdateTransactionInput extends CreateTransactionInput {
  id: string;
}

export interface TransactionFilters {
  date?: string;
  start_date?: string;
  end_date?: string;
  type?: 'receita' | 'despesa';
  payment_method?: string;
}

export interface TransactionSummary {
  start_date: string;
  end_date: string;
  total_revenue: string;
  total_expenses: string;
  balance: string;
  transaction_count: number;
}

// ==============================
// QUERIES (Leitura)
// ==============================

/**
 * Hook para listar transações com filtros opcionais
 */
export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.date) params.append('date', filters.date);
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.payment_method) params.append('payment_method', filters.payment_method);

      const response = await api.get(`/financial/transactions/?${params.toString()}`);
      return response.data as Transaction[];
    },
  });
}

/**
 * Hook para buscar uma transação específica
 */
export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      const response = await api.get(`/financial/transactions/${id}/`);
      return response.data as Transaction;
    },
    enabled: !!id,
  });
}

/**
 * Hook para buscar transações de hoje
 */
export function useTransactionsToday() {
  return useQuery({
    queryKey: ['transactions', 'today'],
    queryFn: async () => {
      const response = await api.get('/financial/transactions/today/');
      return response.data as Transaction[];
    },
  });
}

/**
 * Hook para buscar resumo financeiro
 */
export function useTransactionSummary(filters?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: ['transactions', 'summary', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);

      const response = await api.get(`/financial/transactions/summary/?${params.toString()}`);
      return response.data as TransactionSummary;
    },
  });
}

/**
 * Hook para buscar resumo por método de pagamento
 */
export function useTransactionsByPaymentMethod(filters?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: ['transactions', 'by-payment-method', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);

      const response = await api.get(`/financial/transactions/by_payment_method/?${params.toString()}`);
      return response.data;
    },
  });
}

// ==============================
// MUTATIONS (Escrita)
// ==============================

/**
 * Hook para criar nova transação
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTransactionInput) => {
      const response = await api.post('/financial/transactions/', data);
      return response.data as Transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

/**
 * Hook para atualizar transação
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateTransactionInput) => {
      const response = await api.put(`/financial/transactions/${id}/`, data);
      return response.data as Transaction;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction', data.id] });
    },
  });
}

/**
 * Hook para deletar transação
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/financial/transactions/${id}/`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

// ==============================
// EXPORTAÇÕES
// ==============================

/**
 * Exporta transações em formato CSV
 */
export async function exportTransactionsCSV(filters?: TransactionFilters) {
  const params = new URLSearchParams();
  if (filters?.date) params.append('date', filters.date);
  if (filters?.start_date) params.append('start_date', filters.start_date);
  if (filters?.end_date) params.append('end_date', filters.end_date);
  if (filters?.type) params.append('type', filters.type);
  if (filters?.payment_method) params.append('payment_method', filters.payment_method);

  const response = await api.get(`/financial/transactions/export_csv/?${params.toString()}`, {
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'transacoes.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Exporta transações em formato Excel
 */
export async function exportTransactionsExcel(filters?: TransactionFilters) {
  const params = new URLSearchParams();
  if (filters?.date) params.append('date', filters.date);
  if (filters?.start_date) params.append('start_date', filters.start_date);
  if (filters?.end_date) params.append('end_date', filters.end_date);
  if (filters?.type) params.append('type', filters.type);
  if (filters?.payment_method) params.append('payment_method', filters.payment_method);

  const response = await api.get(`/financial/transactions/export_excel/?${params.toString()}`, {
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'transacoes.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
