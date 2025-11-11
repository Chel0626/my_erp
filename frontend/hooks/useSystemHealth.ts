/**
 * Hook para monitorar a saúde geral do sistema
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// ==================== SENTRY METRICS ====================

export interface SentryHealthMetrics {
  crash_free_users_percentage: number;
  new_issues_count: number;
  recurring_issues_count: number;
  sentry_url: string;
}

export function useSentryHealth() {
  return useQuery<SentryHealthMetrics>({
    queryKey: ['system-health', 'sentry-health'],
    queryFn: async () => {
      const response = await api.get('/superadmin/system-health/sentry/health/');
      return response.data;
    },
    refetchInterval: 60000, // Atualiza a cada 1 minuto
  });
}

// ==================== SENTRY PERFORMANCE ====================

export interface SentryPerformanceMetrics {
  top_slow_transactions: Array<{
    endpoint: string;
    avg_duration_ms: number;
    p95_duration_ms: number;
    p99_duration_ms: number;
  }>;
  avg_response_time_ms: number;
  error_rate_percentage: number;
  latency_history: Array<{
    timestamp: string;
    avg_ms: number;
  }>;
}

export function useSentryPerformance() {
  return useQuery<SentryPerformanceMetrics>({
    queryKey: ['system-health', 'sentry-performance'],
    queryFn: async () => {
      const response = await api.get('/superadmin/system-health/sentry/performance/');
      return response.data;
    },
    refetchInterval: 120000, // Atualiza a cada 2 minutos
  });
}

// ==================== REDIS METRICS ====================

export interface RedisMetrics {
  hit_ratio_percentage: number;
  used_memory_mb: number;
  max_memory_mb: number;
  memory_usage_percentage: number;
  connected_clients: number;
  total_keys: number;
  keyspace_hits: number;
  keyspace_misses: number;
}

export function useRedisMetrics() {
  return useQuery<RedisMetrics>({
    queryKey: ['system-health', 'redis-metrics'],
    queryFn: async () => {
      const response = await api.get('/superadmin/system-health/redis/metrics/');
      return response.data;
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });
}

// ==================== REDIS ACTIONS ====================

export function useFlushRedis() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/superadmin/system-health/redis/flushall/');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-health', 'redis-metrics'] });
    },
  });
}

export function useDeleteRedisKey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (key: string) => {
      const response = await api.post('/superadmin/system-health/redis/del_key/', { key });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-health', 'redis-metrics'] });
    },
  });
}

export function useInspectRedisKey() {
  return useMutation({
    mutationFn: async (key: string) => {
      const response = await api.post('/superadmin/system-health/redis/inspect_key/', { key });
      return response.data;
    },
  });
}

// ==================== INFRASTRUCTURE METRICS ====================

export interface InfraMetrics {
  cpu_usage_percentage: number;
  memory_usage_percentage: number;
  cpu_history: Array<{
    timestamp: string;
    percentage: number;
  }>;
  memory_history: Array<{
    timestamp: string;
    percentage: number;
  }>;
  provider: string;
}

export function useInfraMetrics() {
  return useQuery<InfraMetrics>({
    queryKey: ['system-health', 'infra-metrics'],
    queryFn: async () => {
      const response = await api.get('/superadmin/system-health/infra/metrics/');
      return response.data;
    },
    refetchInterval: 60000, // Atualiza a cada 1 minuto
  });
}

// ==================== UPTIME & USERS ====================

export interface UptimeMetrics {
  status: 'up' | 'down';
  uptime_percentage: number;
  response_time_ms: number;
  last_check: string;
}

export interface OnlineUsersMetrics {
  active_users: number;
  users_history: Array<{
    timestamp: string;
    count: number;
  }>;
}

export function useUptimeStatus() {
  return useQuery<UptimeMetrics>({
    queryKey: ['system-health', 'uptime-status'],
    queryFn: async () => {
      const response = await api.get('/superadmin/system-health/uptime/status/');
      return response.data;
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });
}

export function useOnlineUsers() {
  return useQuery<OnlineUsersMetrics>({
    queryKey: ['system-health', 'online-users'],
    queryFn: async () => {
      const response = await api.get('/superadmin/system-health/users/online/');
      return response.data;
    },
    refetchInterval: 10000, // Atualiza a cada 10 segundos (mais frequente)
  });
}
