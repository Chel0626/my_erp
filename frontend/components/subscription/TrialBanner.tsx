/**
 * Barra de aviso do Trial
 * Mostra dias restantes do trial e progresso de uso (clientes/serviços)
 */
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Clock, Users, Wrench } from 'lucide-react';
import Link from 'next/link';
import { differenceInDays, parseISO } from 'date-fns';

export function TrialBanner() {
  const { user, tenant } = useAuth();

  // Não mostra se não tiver tenant ou não estiver em TRIAL
  if (!tenant || tenant.subscription_status !== 'TRIAL') {
    return null;
  }

  // Calcula dias restantes
  const daysLeft = tenant.trial_ends_at 
    ? differenceInDays(parseISO(tenant.trial_ends_at), new Date())
    : 0;

  // Calcula progresso de uso
  const clientProgress = (tenant.current_clients_count / 10) * 100;
  const serviceProgress = (tenant.current_services_count / 4) * 100;

  // Urgência (últimos 2 dias ou limites próximos)
  const isUrgent = daysLeft <= 2 || clientProgress >= 80 || serviceProgress >= 80;

  return (
    <div
      className={`
        w-full px-4 py-3 border-b
        ${isUrgent 
          ? 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-900' 
          : 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900'
        }
      `}
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        {/* Mensagem principal */}
        <div className="flex items-start gap-3 flex-1">
          <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isUrgent ? 'text-orange-600' : 'text-blue-600'}`} />
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-semibold ${isUrgent ? 'text-orange-900 dark:text-orange-100' : 'text-blue-900 dark:text-blue-100'}`}>
                Período de Teste
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                {daysLeft > 0 ? (
                  <>{daysLeft} {daysLeft === 1 ? 'dia' : 'dias'} restantes</>
                ) : (
                  <>Expira hoje!</>
                )}
              </span>
            </div>

            {/* Progresso de uso */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Clientes */}
              <div className="flex items-center gap-2 min-w-[180px]">
                <Users className="w-4 h-4 text-gray-500" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Clientes</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {tenant.current_clients_count}/10
                    </span>
                  </div>
                  <Progress value={clientProgress} className="h-1.5" />
                </div>
              </div>

              {/* Serviços */}
              <div className="flex items-center gap-2 min-w-[180px]">
                <Wrench className="w-4 h-4 text-gray-500" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Serviços</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {tenant.current_services_count}/4
                    </span>
                  </div>
                  <Progress value={serviceProgress} className="h-1.5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botão de ação */}
        <Link href="/plans">
          <Button 
            size="sm" 
            className={
              isUrgent 
                ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }
          >
            Assinar Agora
          </Button>
        </Link>
      </div>
    </div>
  );
}
