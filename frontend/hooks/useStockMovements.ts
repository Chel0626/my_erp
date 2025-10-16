/**
 * Hook para gerenciar Movimentações de Estoque
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Types
export interface StockMovement {
  id: string;
  product: string;
  product_name: string;
  movement_type: 'entrada' | 'saida';
  movement_type_display: string;
  reason: string;
  reason_display: string;
  quantity: number;
  stock_before: number;
  stock_after: number;
  notes: string;
  transaction: string | null;
  created_by: string | null;
  created_by_name: string | null;
  created_at: string;
}

export interface CreateStockMovementInput {
  product: string;
  movement_type: 'entrada' | 'saida';
  reason: string;
  quantity: number;
  notes?: string;
}

export interface StockMovementFilters {
  movement_type?: 'entrada' | 'saida';
  reason?: string;
  product?: string;
}

// Query Keys
const QUERY_KEYS = {
  stockMovements: ['stock-movements'] as const,
  stockMovement: (id: string) => ['stock-movements', id] as const,
  stockMovementsByProduct: (productId: string) => ['stock-movements', 'product', productId] as const,
};

/**
 * Hook para listar movimentações
 */
export function useStockMovements(filters?: StockMovementFilters) {
  return useQuery({
    queryKey: [...QUERY_KEYS.stockMovements, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.movement_type) params.append('movement_type', filters.movement_type);
      if (filters?.reason) params.append('reason', filters.reason);
      if (filters?.product) params.append('product', filters.product);
      
      const { data } = await api.get<StockMovement[]>(`/inventory/stock-movements/?${params.toString()}`);
      return data;
    },
  });
}

/**
 * Hook para buscar movimentação específica
 */
export function useStockMovement(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.stockMovement(id),
    queryFn: async () => {
      const { data } = await api.get<StockMovement>(`/inventory/stock-movements/${id}/`);
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Hook para listar movimentações de um produto
 */
export function useStockMovementsByProduct(productId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.stockMovementsByProduct(productId),
    queryFn: async () => {
      const { data } = await api.get<StockMovement[]>(
        `/inventory/stock-movements/by_product/?product_id=${productId}`
      );
      return data;
    },
    enabled: !!productId,
  });
}

/**
 * Hook para criar movimentação
 */
export function useCreateStockMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (movementData: CreateStockMovementInput) => {
      const { data } = await api.post<StockMovement>('/inventory/stock-movements/', movementData);
      return data;
    },
    onSuccess: (data) => {
      // Invalida queries de movimentações
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stockMovements });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stockMovementsByProduct(data.product) });
      
      // Invalida queries de produtos (estoque mudou)
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
