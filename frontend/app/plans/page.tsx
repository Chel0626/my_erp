/**
 * Página de Planos
 * Mostra os 3 planos disponíveis (Básico, Profissional, Premium)
 * com destaque para o Profissional (Mais Popular)
 */
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { useSubscribe, PLANS } from '@/hooks/usePayments';
import { toast } from 'sonner';

export default function PlansPage() {
  const { user, tenant } = useAuth();
  const router = useRouter();
  const subscribe = useSubscribe();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = async (planId: 'basico' | 'profissional' | 'premium') => {
    if (!user) {
      toast.error('Você precisa estar logado para assinar um plano');
      router.push('/login');
      return;
    }

    setSelectedPlan(planId);

    try {
      // Chama a API que cria a preferência no Mercado Pago
      await subscribe.mutateAsync({ plan_id: planId });
      // O hook já redireciona automaticamente para o checkout do MP
    } catch (error: any) {
      console.error('Erro ao criar assinatura:', error);
      toast.error(error.response?.data?.error || 'Erro ao processar pagamento. Tente novamente.');
      setSelectedPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <Badge className="mb-4 bg-blue-600 hover:bg-blue-700 text-white">
            Escolha o melhor plano para você
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Planos e Preços
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Comece com 7 dias grátis e escolha o plano ideal para sua barbearia crescer
          </p>

          {/* Status atual do usuário */}
          {tenant && (
            <div className="mt-6 flex items-center justify-center gap-2">
              {tenant.subscription_status === 'TRIAL' && (
                <Badge variant="outline" className="border-blue-600 text-blue-600">
                  Você está em período de teste
                </Badge>
              )}
              {tenant.subscription_status === 'ACTIVE' && (
                <Badge variant="outline" className="border-green-600 text-green-600">
                  Plano Ativo: {PLANS[tenant.plan_id as keyof typeof PLANS]?.title || tenant.plan}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Cards de Planos */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {Object.values(PLANS).map((plan) => {
            const isPopular = plan.popular;
            const isCurrentPlan = tenant?.plan_id === plan.id && tenant?.subscription_status === 'ACTIVE';
            const isLoading = selectedPlan === plan.id;

            return (
              <Card 
                key={plan.id}
                className={`relative ${
                  isPopular 
                    ? 'border-2 border-orange-500 shadow-xl scale-105' 
                    : 'border border-gray-200'
                } ${isCurrentPlan ? 'bg-blue-50 dark:bg-blue-950' : 'bg-white dark:bg-gray-800'}`}
              >
                {/* Badge "Mais Popular" */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-8">
                  <CardTitle className="text-2xl font-bold">{plan.title}</CardTitle>
                  <CardDescription className="text-sm mt-2">{plan.description}</CardDescription>
                  
                  <div className="mt-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        R$ {plan.price.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">/mês</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-6">
                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isLoading || isCurrentPlan}
                    className={`w-full ${
                      isPopular 
                        ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isCurrentPlan ? 'Plano Atual' : 'Começar Agora'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Benefícios / FAQ */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Por que escolher nosso sistema?
          </h3>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="space-y-2">
              <div className="text-4xl">🔒</div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Seguro</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Seus dados protegidos com criptografia
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl">📱</div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Acessível</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Funciona em qualquer dispositivo
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl">💬</div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Suporte</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Time dedicado para te ajudar
              </p>
            </div>
          </div>
        </div>

        {/* Voltar ao Dashboard */}
        {user && (
          <div className="mt-12 text-center">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              ← Voltar ao Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
