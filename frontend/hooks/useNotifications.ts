/**
 * Hooks para gerenciar notificações
 * Utiliza React Query para cache e gerenciamento de estado
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ==================== INTERFACES ====================

export interface Notification {
  id: string;
  notification_type: string;
  notification_type_display: string;
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  reference_type: string | null;
  reference_id: string | null;
  created_at: string;
  user_name: string;
}

export interface NotificationCount {
  total: number;
  unread: number;
  read: number;
}

export interface CreateNotificationData {
  user: string;
  notification_type: string;
  title: string;
  message: string;
  reference_type?: string;
  reference_id?: string;
}

// ==================== HOOKS ====================

/**
 * Busca todas as notificações do usuário
 */
export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get('/notifications/');
      return response.data;
    },
    refetchInterval: 30000, // Refetch a cada 30 segundos
  });
}

/**
 * Busca apenas notificações não lidas
 */
export function useUnreadNotifications() {
  return useQuery<Notification[]>({
    queryKey: ['notifications', 'unread'],
    queryFn: async () => {
      const response = await api.get('/notifications/unread/');
      return response.data;
    },
    refetchInterval: 10000, // Refetch a cada 10 segundos (polling)
  });
}

/**
 * Busca contagem de notificações
 */
export function useNotificationCount() {
  return useQuery<NotificationCount>({
    queryKey: ['notifications', 'count'],
    queryFn: async () => {
      const response = await api.get('/notifications/count/');
      return response.data;
    },
    refetchInterval: 10000, // Refetch a cada 10 segundos
  });
}

/**
 * Marca uma ou mais notificações como lidas
 */
export function useMarkNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationIds: string[]) => {
      const response = await api.post('/notifications/mark_as_read/', {
        notification_ids: notificationIds,
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalida queries relacionadas para refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'count'] });
    },
  });
}

/**
 * Marca uma notificação específica como lida
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await api.post(`/notifications/${notificationId}/mark_read/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'count'] });
    },
  });
}

/**
 * Marca todas as notificações como lidas
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/notifications/mark_all_as_read/');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'count'] });
    },
  });
}

/**
 * Cria uma nova notificação
 */
export function useCreateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateNotificationData) => {
      const response = await api.post('/notifications/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'count'] });
    },
  });
}

/**
 * Deleta uma notificação
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await api.delete(`/notifications/${notificationId}/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'count'] });
    },
  });
}
