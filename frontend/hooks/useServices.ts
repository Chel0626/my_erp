/**
 * Hook customizado para gerenciar Serviços
 * Usa React Query para cache e otimistic updates
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceInput {
  name: string;
  description?: string;
  price: string;
  duration_minutes: number;
  is_active?: boolean;
}

export interface UpdateServiceInput extends CreateServiceInput {
  id: string;
}

// ==============================
// QUERIES (Leitura)
// ==============================

/**
 * Lista todos os serviços do tenant
 */
export function useServices(activeOnly = false) {
  return useQuery<Service[]>({
    queryKey: ['services', activeOnly],
    queryFn: async () => {
      const endpoint = activeOnly 
        ? '/scheduling/services/active/' 
        : '/scheduling/services/';
      const response = await api.get(endpoint);
      // DRF retorna {count, next, previous, results}
      return response.data.results || response.data;
    },
  });
}

/**
 * Busca um serviço específico por ID
 */
export function useService(id: string) {
  return useQuery<Service>({
    queryKey: ['services', id],
    queryFn: async () => {
      const response = await api.get(`/scheduling/services/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
}

// ==============================
// MUTATIONS (Escrita)
// ==============================

/**
 * Cria um novo serviço
 */
export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateServiceInput) => {
      const response = await api.post('/scheduling/services/', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalida cache para recarregar lista
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

/**
 * Atualiza um serviço existente
 */
export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateServiceInput) => {
      const { id, ...updateData } = data;
      const response = await api.put(`/scheduling/services/${id}/`, updateData);
      return response.data;
    },
    onSuccess: (data) => {
      // Atualiza cache do serviço específico
      queryClient.setQueryData(['services', data.id], data);
      // Invalida lista para refletir mudanças
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

/**
 * Atualiza parcialmente um serviço (PATCH)
 * Útil para toggle de is_active
 */
export function usePatchService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Service> }) => {
      const response = await api.patch(`/scheduling/services/${id}/`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['services', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

/**
 * Deleta um serviço
 */
export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/scheduling/services/${id}/`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

/**
 * Toggle status ativo/inativo
 */
export function useToggleServiceStatus() {
  const patchService = usePatchService();

  return {
    ...patchService,
    toggleStatus: (service: Service) => {
      return patchService.mutate({
        id: service.id,
        data: { is_active: !service.is_active },
      });
    },
  };
}
