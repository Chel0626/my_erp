/**
 * Hook para gerenciar Produtos
 * Integração com API de Inventory
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Types
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  category_display: string;
  cost_price: string;
  sale_price: string;
  profit_margin: number;
  stock_quantity: number;
  min_stock: number;
  is_low_stock: boolean;
  stock_status: 'ok' | 'low' | 'out';
  barcode: string;
  sku: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  category: string;
  cost_price: number;
  sale_price: number;
  stock_quantity?: number;
  min_stock?: number;
  barcode?: string;
  sku?: string;
  image_url?: string;
  is_active?: boolean;
}

export interface ProductSummary {
  total_products: number;
  active_products: number;
  low_stock_products: number;
  out_of_stock_products: number;
  total_stock_value: string;
}

export interface ProductFilters {
  category?: string;
  is_active?: boolean;
}

// Query Keys
const QUERY_KEYS = {
  products: ['products'] as const,
  product: (id: string) => ['products', id] as const,
  activeProducts: ['products', 'active'] as const,
  lowStockProducts: ['products', 'low-stock'] as const,
  outOfStockProducts: ['products', 'out-of-stock'] as const,
  productSummary: ['products', 'summary'] as const,
};

/**
 * Hook para listar produtos
 */
export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: [...QUERY_KEYS.products, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
      
      const { data } = await api.get<Product[]>(`/inventory/products/?${params.toString()}`);
      // Handle paginated response
      return Array.isArray(data) ? data : (data as any).results || [];
    },
  });
}

/**
 * Hook para buscar um produto específico
 */
export function useProduct(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.product(id),
    queryFn: async () => {
      const { data } = await api.get<Product>(`/inventory/products/${id}/`);
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Hook para listar apenas produtos ativos
 */
export function useActiveProducts() {
  return useQuery({
    queryKey: QUERY_KEYS.activeProducts,
    queryFn: async () => {
      const { data } = await api.get<Product[]>('/inventory/products/active/');
      return data;
    },
  });
}

/**
 * Hook para produtos com estoque baixo
 */
export function useLowStockProducts() {
  return useQuery({
    queryKey: QUERY_KEYS.lowStockProducts,
    queryFn: async () => {
      const { data } = await api.get<Product[]>('/inventory/products/low_stock/');
      return data;
    },
  });
}

/**
 * Hook para produtos sem estoque
 */
export function useOutOfStockProducts() {
  return useQuery({
    queryKey: QUERY_KEYS.outOfStockProducts,
    queryFn: async () => {
      const { data } = await api.get<Product[]>('/inventory/products/out_of_stock/');
      return data;
    },
  });
}

/**
 * Hook para resumo de produtos
 */
export function useProductSummary() {
  return useQuery({
    queryKey: QUERY_KEYS.productSummary,
    queryFn: async () => {
      const { data } = await api.get<ProductSummary>('/inventory/products/summary/');
      return data;
    },
  });
}

/**
 * Hook para criar produto
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData: CreateProductInput) => {
      const { data } = await api.post<Product>('/inventory/products/', productData);
      return data;
    },
    onSuccess: () => {
      // Invalida todas as queries de produtos
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeProducts });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.productSummary });
    },
  });
}

/**
 * Hook para atualizar produto
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...productData }: Partial<CreateProductInput> & { id: string }) => {
      const { data } = await api.put<Product>(`/inventory/products/${id}/`, productData);
      return data;
    },
    onSuccess: (data) => {
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.product(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeProducts });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.productSummary });
    },
  });
}

/**
 * Hook para deletar produto
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/inventory/products/${id}/`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeProducts });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.productSummary });
    },
  });
}

/**
 * Hook para adicionar estoque
 */
export function useAddStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      productId, 
      quantity, 
      reason = 'compra', 
      notes = '' 
    }: { 
      productId: string; 
      quantity: number; 
      reason?: string; 
      notes?: string;
    }) => {
      const { data } = await api.post<Product>(
        `/inventory/products/${productId}/add_stock/`,
        { quantity, reason, notes }
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.product(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lowStockProducts });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.outOfStockProducts });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.productSummary });
    },
  });
}

/**
 * Hook para remover estoque
 */
export function useRemoveStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      productId, 
      quantity, 
      reason = 'ajuste', 
      notes = '' 
    }: { 
      productId: string; 
      quantity: number; 
      reason?: string; 
      notes?: string;
    }) => {
      const { data } = await api.post<Product>(
        `/inventory/products/${productId}/remove_stock/`,
        { quantity, reason, notes }
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.product(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lowStockProducts });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.outOfStockProducts });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.productSummary });
    },
  });
}
