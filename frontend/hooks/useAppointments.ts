/**
 * Hook customizado para gerenciar Agendamentos
 * Usa React Query para cache e otimistic updates
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Appointment {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  service: string;
  service_details?: {
    id: string;
    name: string;
    price: string;
    duration_minutes: number;
  };
  professional: string;
  professional_details?: {
    id: string;
    name: string;
    email: string;
  };
  start_time: string;
  end_time: string;
  status: 'marcado' | 'confirmado' | 'em_atendimento' | 'concluido' | 'cancelado' | 'falta';
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAppointmentInput {
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  service_id: string;
  professional_id: string;
  start_time: string;
  notes?: string;
}

export interface UpdateAppointmentInput extends CreateAppointmentInput {
  id: string;
}

export interface AppointmentFilters {
  date?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  professional?: string;
  service?: string;
}

// ==============================
// QUERIES (Leitura)
// ==============================

/**
 * Lista todos os agendamentos do tenant com filtros opcionais
 */
export function useAppointments(filters?: AppointmentFilters) {
  const queryKey = ['appointments', filters];
  
  return useQuery<Appointment[]>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.date) params.append('date', filters.date);
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.professional) params.append('professional', filters.professional);
      if (filters?.service) params.append('service', filters.service);
      
      const queryString = params.toString();
      const endpoint = queryString 
        ? `/scheduling/appointments/?${queryString}`
        : '/scheduling/appointments/';
      
      const response = await api.get(endpoint);
      // DRF retorna {count, next, previous, results}
      return response.data.results || response.data;
    },
  });
}

/**
 * Busca um agendamento específico por ID
 */
export function useAppointment(id: string) {
  return useQuery<Appointment>({
    queryKey: ['appointments', id],
    queryFn: async () => {
      const response = await api.get(`/scheduling/appointments/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Lista agendamentos de hoje
 */
export function useAppointmentsToday() {
  return useQuery<Appointment[]>({
    queryKey: ['appointments', 'today'],
    queryFn: async () => {
      const response = await api.get('/scheduling/appointments/today/');
      return response.data.results || response.data;
    },
  });
}

/**
 * Lista próximos agendamentos (7 dias)
 */
export function useAppointmentsUpcoming() {
  return useQuery<Appointment[]>({
    queryKey: ['appointments', 'upcoming'],
    queryFn: async () => {
      const response = await api.get('/scheduling/appointments/upcoming/');
      return response.data.results || response.data;
    },
  });
}

// ==============================
// MUTATIONS (Escrita)
// ==============================

/**
 * Cria um novo agendamento
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAppointmentInput) => {
      const response = await api.post('/scheduling/appointments/', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalida cache para recarregar lista
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

/**
 * Atualiza um agendamento existente
 */
export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateAppointmentInput) => {
      const { id, ...updateData } = data;
      const response = await api.put(`/scheduling/appointments/${id}/`, updateData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['appointments', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

/**
 * Atualiza parcialmente um agendamento (PATCH)
 */
export function usePatchAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Appointment> }) => {
      const response = await api.patch(`/scheduling/appointments/${id}/`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['appointments', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

/**
 * Deleta um agendamento
 */
export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/scheduling/appointments/${id}/`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

/**
 * Confirma um agendamento
 */
export function useConfirmAppointment() {
  const patchAppointment = usePatchAppointment();

  return {
    ...patchAppointment,
    confirm: (id: string) => {
      return patchAppointment.mutate({
        id,
        data: { status: 'confirmado' },
      });
    },
  };
}

/**
 * Cancela um agendamento
 */
export function useCancelAppointment() {
  const patchAppointment = usePatchAppointment();

  return {
    ...patchAppointment,
    cancel: (id: string) => {
      return patchAppointment.mutate({
        id,
        data: { status: 'cancelado' },
      });
    },
  };
}

/**
 * Marca agendamento como concluído
 */
export function useCompleteAppointment() {
  const patchAppointment = usePatchAppointment();

  return {
    ...patchAppointment,
    complete: (id: string) => {
      return patchAppointment.mutate({
        id,
        data: { status: 'concluido' },
      });
    },
  };
}

/**
 * Inicia atendimento
 */
export function useStartAppointment() {
  const patchAppointment = usePatchAppointment();

  return {
    ...patchAppointment,
    start: (id: string) => {
      return patchAppointment.mutate({
        id,
        data: { status: 'em_atendimento' },
      });
    },
  };
}
