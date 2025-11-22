/**
 * Hook para gerenciar pagamentos e assinaturas via Mercado Pago
 */
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';

// Tipos
export interface Plan {
  id: 'basico' | 'profissional' | 'premium';
  title: string;
  description: string;
  price: number;
  features: string[];
  popular?: boolean;
}

export interface SubscribeRequest {
  plan_id: 'basico' | 'profissional' | 'premium';
}

export interface SubscribeResponse {
  init_point: string;  // URL para redirecionar ao checkout do MP
  preference_id: string;
  plan: Plan;
}

/**
 * Hook para criar assinatura (escolher plano e ir para checkout MP)
 */
export function useSubscribe() {
  return useMutation({
    mutationFn: async (data: SubscribeRequest): Promise<SubscribeResponse> => {
      const response = await api.post('/payments/subscribe/', data);
      return response.data;
    },
    onSuccess: (data) => {
      // Redireciona para o checkout do Mercado Pago
      if (data.init_point) {
        window.location.href = data.init_point;
      }
    },
  });
}

/**
 * Planos disponíveis (mesmos do backend)
 */
export const PLANS: Record<string, Plan> = {
  basico: {
    id: 'basico',
    title: 'Básico',
    description: 'Para o Barbeiro Solo',
    price: 19.90,
    features: [
      '1 Profissional',
      'Agenda Online',
      'Controle Financeiro',
      'Link de Agendamento'
    ]
  },
  profissional: {
    id: 'profissional',
    title: 'Profissional',
    description: 'Para Equipes que Querem Crescer',
    price: 59.90,
    features: [
      'Profissionais ILIMITADOS',
      'Clientes ILIMITADOS',
      'Tudo do Básico +',
      'Gestão de Comissões',
      'Relatórios Avançados',
      'Lembretes WhatsApp'
    ],
    popular: true
  },
  premium: {
    id: 'premium',
    title: 'Premium',
    description: 'Para quem tem Múltiplas Filiais',
    price: 109.90,
    features: [
      'Tudo do Profissional +',
      'Gestão de Múltiplas Lojas',
      'Dashboard Consolidado',
      'Suporte Prioritário'
    ]
  }
};
