import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

// ==================== TYPES ====================

export interface SentryIssue {
  id: string;
  title: string;
  culprit: string;
  count: string;
  userCount: number;
  lastSeen: string;
  firstSeen: string;
  level: 'error' | 'warning' | 'info' | 'fatal';
  status: 'resolved' | 'unresolved' | 'ignored';
  permalink: string;
  metadata: {
    value: string;
    type: string;
    filename: string;
    function: string;
  };
}

export interface SentryStats {
  total_events: number;
  period: string;
  data_points: [number, number][]; // [timestamp, count]
}

export interface SentryMetrics {
  is_configured: boolean;
  stats: SentryStats;
  recent_issues: SentryIssue[];
  errors_by_module: Record<string, number>;
  sentry_url: string;
}

// ==================== HOOKS ====================

/**
 * Hook para buscar métricas do Sentry
 * @returns {Object} Dados do Sentry com stats, issues recentes e contagem por módulo
 */
export function useSentryMetrics() {
  return useQuery<SentryMetrics>({
    queryKey: ['sentry-metrics'],
    queryFn: async () => {
      const response = await api.get('/superadmin/dashboard/sentry_metrics/');
      return response.data;
    },
    // Atualiza a cada 60 segundos
    refetchInterval: 60000,
    // Mantém dados anteriores enquanto carrega novos
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Formata timestamp Unix para data legível
 */
export function formatSentryDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Menos de 1 minuto
  if (diffInSeconds < 60) {
    return 'Agora';
  }

  // Menos de 1 hora
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m atrás`;
  }

  // Menos de 24 horas
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h atrás`;
  }

  // Menos de 7 dias
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d atrás`;
  }

  // Formato completo
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Retorna a cor baseada no nível de severidade
 */
export function getSentryLevelColor(level: string): string {
  switch (level) {
    case 'fatal':
      return 'text-red-600';
    case 'error':
      return 'text-orange-600';
    case 'warning':
      return 'text-yellow-600';
    default:
      return 'text-blue-600';
  }
}

/**
 * Retorna a cor da badge baseada no nível
 */
export function getSentryLevelBadgeVariant(level: string): 'destructive' | 'default' | 'secondary' {
  switch (level) {
    case 'fatal':
    case 'error':
      return 'destructive';
    case 'warning':
      return 'default';
    default:
      return 'secondary';
  }
}
