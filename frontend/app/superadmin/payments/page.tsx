'use client';

import { usePayments, useMarkPaymentPaid } from '@/hooks/useSuperAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard as CreditCardIcon
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

export default function PaymentsPage() {
  const { data: payments, isLoading } = usePayments();
  const markPaid = useMarkPaymentPaid();
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Garante que payments é um array (pode vir como objeto paginado ou array direto)
  const paymentsArray = Array.isArray(payments) ? payments : [];

  const handleMarkPaid = async (id: number, tenantName: string) => {
    if (!confirm(`Confirmar pagamento de "${tenantName}"?`)) {
      return;
    }

    setActionLoading(id);
    try {
      await markPaid.mutateAsync(id);
      toast.success('Pagamento confirmado com sucesso!');
    } catch (error) {
      toast.error('Erro ao confirmar pagamento');
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <Badge className="bg-green-600">Pago</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600">Pendente</Badge>;
      case 'processing':
        return <Badge className="bg-blue-600">Processando</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      case 'refunded':
        return <Badge variant="outline">Reembolsado</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCardIcon className="h-4 w-4" />;
      case 'pix':
        return <span className="text-xs font-bold">PIX</span>;
      case 'bank_slip':
        return <span className="text-xs font-bold">Boleto</span>;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  // Calculate totals
  const totals = paymentsArray.reduce(
    (acc, payment) => {
      const amount = parseFloat(payment.amount);
      acc.total += amount;
      if (payment.status === 'paid') acc.paid += amount;
      if (payment.status === 'pending') acc.pending += amount;
      if (payment.status === 'failed') acc.failed += amount;
      return acc;
    },
    { total: 0, paid: 0, pending: 0, failed: 0 }
  );

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
            <DollarSign className="h-8 w-8" />
            Histórico de Pagamentos
          </h1>
          <p className="text-muted-foreground mt-1">
            Total de {paymentsArray.length || 0} transação(ões)
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      {totals && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totals.total)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recebido</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totals.paid)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendente</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{formatCurrency(totals.pending)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Não Recebido</CardTitle>
              <CreditCardIcon className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totals.failed)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payments List */}
      {paymentsArray.length > 0 ? (
        <div className="space-y-3">
          {paymentsArray.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Payment Method Icon */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      {getMethodIcon(payment.payment_method)}
                    </div>

                    {/* Payment Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{payment.tenant_name}</p>
                        {getStatusBadge(payment.status_display)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          {getMethodIcon(payment.payment_method)}
                          <span className="capitalize">{payment.payment_method_display}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {payment.reference_month}
                        </span>
                        {payment.transaction_id && (
                          <span className="text-xs">ID: {payment.transaction_id}</span>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <p className="text-xl font-bold">{formatCurrency(parseFloat(payment.amount))}</p>
                      {payment.paid_at && (
                        <p className="text-xs text-muted-foreground">
                          Pago em {new Date(payment.paid_at).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>

                    {/* Action */}
                    {payment.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkPaid(payment.id, payment.tenant_name)}
                        disabled={actionLoading === payment.id}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {actionLoading === payment.id ? 'Confirmando...' : 'Confirmar Pago'}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {payment.notes && (
                  <div className="mt-3 pt-3 border-t text-sm text-muted-foreground italic">
                    {payment.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nenhum pagamento registrado</p>
            <p className="text-sm text-muted-foreground mt-1">
              Os pagamentos aparecerão aqui quando forem processados
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
