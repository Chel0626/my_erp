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
    staleTime: 10 * 60 * 1000, // 10 minutos - serviços mudam raramente
    gcTime: 30 * 60 * 1000, // 30 minutos
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
 * Usa optimistic updates para melhor UX
 */
export function usePatchService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Service> }) => {
      const response = await api.patch(`/scheduling/services/${id}/`, data);
      return response.data;
    },
    // Optimistic update - atualiza UI antes da resposta
    onMutate: async ({ id, data }) => {
      // Cancela queries em andamento
      await queryClient.cancelQueries({ queryKey: ['services'] });
      
      // Pega o valor anterior
      const previousServices = queryClient.getQueryData<Service[]>(['services', false]);
      
      // Atualiza otimisticamente
      if (previousServices) {
        queryClient.setQueryData<Service[]>(['services', false], (old) =>
          old?.map((service) =>
            service.id === id ? { ...service, ...data } : service
          )
        );
      }
      
      // Retorna contexto com valor anterior para rollback se der erro
      return { previousServices };
    },
    // Se der erro, faz rollback
    onError: (err, variables, context) => {
      if (context?.previousServices) {
        queryClient.setQueryData(['services', false], context.previousServices);
      }
    },
    // Sempre sincroniza no final
    onSettled: () => {
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
