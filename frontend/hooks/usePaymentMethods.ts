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

export interface CreatePaymentMethodInput {
  name: string;
  is_active?: boolean;
}

export interface UpdatePaymentMethodInput extends CreatePaymentMethodInput {
  id: string;
}

// ==============================
// QUERIES (Leitura)
// ==============================

/**
 * Hook para listar todos os métodos de pagamento
 */
export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const response = await api.get('/financial/payment-methods/');
      return response.data as PaymentMethod[];
    },
  });
}

/**
 * Hook para listar apenas métodos de pagamento ativos
 */
export function useActivePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods', 'active'],
    queryFn: async () => {
      const response = await api.get('/financial/payment-methods/active/');
      return response.data as PaymentMethod[];
    },
  });
}

/**
 * Hook para buscar um método de pagamento específico
 */
export function usePaymentMethod(id: string) {
  return useQuery({
    queryKey: ['payment-method', id],
    queryFn: async () => {
      const response = await api.get(`/financial/payment-methods/${id}/`);
      return response.data as PaymentMethod;
    },
    enabled: !!id,
  });
}

// ==============================
// MUTATIONS (Escrita)
// ==============================

/**
 * Hook para criar novo método de pagamento
 */
export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePaymentMethodInput) => {
      const response = await api.post('/financial/payment-methods/', data);
      return response.data as PaymentMethod;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  });
}

/**
 * Hook para atualizar método de pagamento
 */
export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdatePaymentMethodInput) => {
      const response = await api.put(`/financial/payment-methods/${id}/`, data);
      return response.data as PaymentMethod;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      queryClient.invalidateQueries({ queryKey: ['payment-method', data.id] });
    },
  });
}

/**
 * Hook para deletar método de pagamento
 */
export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/financial/payment-methods/${id}/`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  });
}
