'use client';

import { useSubscriptions, useSuspendSubscription, useActivateSubscription, useUpgradeSubscription } from '@/hooks/useSuperAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Calendar,
  TrendingUp,
  Ban,
  PlayCircle,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

export default function SubscriptionsPage() {
  const { data: subscriptions, isLoading } = useSubscriptions();
  const suspendSubscription = useSuspendSubscription();
  const activateSubscription = useActivateSubscription();
  const upgradeSubscription = useUpgradeSubscription();
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Garante que subscriptions é um array
  const subscriptionsArray = Array.isArray(subscriptions) ? subscriptions : [];

  const handleSuspend = async (id: number, tenantName: string) => {
    if (!confirm(`Tem certeza que deseja suspender a assinatura de "${tenantName}"?`)) {
      return;
    }

    setActionLoading(id);
    try {
      await suspendSubscription.mutateAsync(id);
      toast.success(`Assinatura de "${tenantName}" suspensa com sucesso!`);
    } catch (error) {
      toast.error('Erro ao suspender assinatura');
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (id: number, tenantName: string) => {
    setActionLoading(id);
    try {
      await activateSubscription.mutateAsync(id);
      toast.success(`Assinatura de "${tenantName}" ativada com sucesso!`);
    } catch (error) {
      toast.error('Erro ao ativar assinatura');
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-600">Ativa</Badge>;
      case 'trial':
        return <Badge className="bg-blue-600">Trial</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspensa</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelada</Badge>;
      case 'expired':
        return <Badge variant="outline">Expirada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <Badge className="bg-green-600">Pago</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600">Pendente</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Atrasado</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'free':
        return <Badge variant="outline">Grátis</Badge>;
      case 'basic':
        return <Badge className="bg-blue-600">Básico</Badge>;
      case 'professional':
        return <Badge className="bg-purple-600">Profissional</Badge>;
      case 'enterprise':
        return <Badge className="bg-orange-600">Enterprise</Badge>;
      default:
        return <Badge variant="outline">{plan}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="h-8 w-8" />
            Assinaturas
          </h1>
          <p className="text-muted-foreground mt-1">
            Total de {subscriptions?.length || 0} assinatura(s)
          </p>
        </div>
      </div>

      {/* Subscriptions List */}
      {subscriptionsArray.length > 0 ? (
        <div className="space-y-4">
          {subscriptionsArray.map((subscription) => (
            <Card key={subscription.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {subscription.tenant_name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      ID da Assinatura: {subscription.id}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {getPlanBadge(subscription.plan_display)}
                    {getStatusBadge(subscription.status_display)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium">{formatCurrency(parseFloat(subscription.monthly_price))}/mês</p>
                    <p className="text-xs text-muted-foreground">Valor</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{subscription.max_users}</p>
                    <p className="text-xs text-muted-foreground">Máx. Usuários</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{subscription.max_appointments_per_month}</p>
                    <p className="text-xs text-muted-foreground">Máx. Agendamentos/mês</p>
                  </div>
                  <div>
                    {getPaymentStatusBadge(subscription.payment_status_display)}
                    <p className="text-xs text-muted-foreground mt-1">Status Pagamento</p>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs text-muted-foreground border-t pt-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Início: {new Date(subscription.start_date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  {subscription.trial_end_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Fim Trial: {new Date(subscription.trial_end_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                  {subscription.next_billing_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Próxima Cobrança: {new Date(subscription.next_billing_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>

                {/* Warnings */}
                {subscription.days_until_expiration !== null && subscription.days_until_expiration <= 7 && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800 dark:text-yellow-200">
                      {subscription.days_until_expiration === 0 
                        ? 'Expira hoje!' 
                        : `Expira em ${subscription.days_until_expiration} dia(s)`}
                    </span>
                  </div>
                )}

                {/* Features */}
                {subscription.features && Object.keys(subscription.features).length > 0 && (
                  <div className="border-t pt-3">
                    <p className="text-sm font-medium mb-2">Recursos:</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(subscription.features).map(([key, value]) => (
                        value && (
                          <Badge key={key} variant="secondary" className="text-xs">
                            {key.replace(/_/g, ' ')}
                          </Badge>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {subscription.is_active ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleSuspend(subscription.id, subscription.tenant_name)}
                      disabled={actionLoading === subscription.id}
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      {actionLoading === subscription.id ? 'Suspendendo...' : 'Suspender'}
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleActivate(subscription.id, subscription.tenant_name)}
                      disabled={actionLoading === subscription.id}
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      {actionLoading === subscription.id ? 'Ativando...' : 'Ativar'}
                    </Button>
                  )}
                  
                  {subscription.plan !== 'enterprise' && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Upgrade (em breve)
                    </Button>
                  )}
                </div>

                {subscription.notes && (
                  <div className="text-sm text-muted-foreground italic border-t pt-3">
                    {subscription.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nenhuma assinatura cadastrada</p>
            <p className="text-sm text-muted-foreground mt-1">
              As assinaturas aparecerão aqui quando forem criadas
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
