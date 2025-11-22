/**
 * Modal de Paywall
 * Aparece quando: 1) Trial expirado 2) Limite de uso atingido
 */
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Users, Wrench, Sparkles } from 'lucide-react';
import { PLANS } from '@/hooks/usePayments';

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: 'trial_expired' | 'client_limit' | 'service_limit';
  message?: string;
}

export function PaywallModal({ open, onOpenChange, reason, message }: PaywallModalProps) {
  const { tenant } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getTitle = () => {
    switch (reason) {
      case 'trial_expired':
        return 'Seu período de teste acabou! 🎉';
      case 'client_limit':
        return 'Parabéns! Sua barbearia está crescendo! 🚀';
      case 'service_limit':
        return 'Limite de serviços atingido';
      default:
        return 'Faça upgrade do seu plano';
    }
  };

  const getDescription = () => {
    if (message) return message;

    switch (reason) {
      case 'trial_expired':
        return 'Espero que tenha gostado do sistema! Para continuar gerenciando sua barbearia, escolha um plano.';
      case 'client_limit':
        return 'Você atingiu 10 clientes cadastrados! O plano gratuito permite apenas 10 clientes. Libere cadastros ilimitados por apenas R$ 59,90/mês.';
      case 'service_limit':
        return 'O plano gratuito permite apenas 4 serviços. Faça upgrade para cadastrar serviços ilimitados.';
      default:
        return 'Escolha o melhor plano para continuar usando o sistema.';
    }
  };

  const getIcon = () => {
    switch (reason) {
      case 'trial_expired':
        return <Clock className="w-12 h-12 text-orange-600" />;
      case 'client_limit':
        return <Users className="w-12 h-12 text-blue-600" />;
      case 'service_limit':
        return <Wrench className="w-12 h-12 text-purple-600" />;
      default:
        return <AlertTriangle className="w-12 h-12 text-yellow-600" />;
    }
  };

  const recommendedPlan = reason === 'client_limit' || reason === 'service_limit' 
    ? PLANS.profissional 
    : PLANS.profissional;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex flex-col items-center text-center space-y-4 mb-4">
            {getIcon()}
            <DialogTitle className="text-2xl">{getTitle()}</DialogTitle>
            <DialogDescription className="text-base max-w-md">
              {getDescription()}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Plano Recomendado */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {recommendedPlan.title}
                </h3>
                <Badge className="bg-orange-500 text-white">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Recomendado
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {recommendedPlan.description}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                R$ {recommendedPlan.price.toFixed(2).replace('.', ',')}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">/mês</div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-2 mb-6">
            {recommendedPlan.features.slice(0, 6).map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </div>
            ))}
          </div>

          <Button 
            onClick={() => router.push('/plans')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6"
            size="lg"
          >
            Ver Todos os Planos
          </Button>
        </div>

        {/* Informações adicionais */}
        {tenant?.subscription_status === 'TRIAL' && (
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            {tenant.current_clients_count} clientes e {tenant.current_services_count} serviços cadastrados durante seu teste
          </div>
        )}

        {/* Botão de fechar (apenas se não for trial expirado) */}
        {reason !== 'trial_expired' && (
          <div className="text-center">
            <Button 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              Continuar sem upgrade
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
