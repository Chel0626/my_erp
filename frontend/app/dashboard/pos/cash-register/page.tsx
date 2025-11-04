'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CurrencyInput } from '@/components/ui/currency-input';
import {
  useCurrentCashRegister,
  useOpenCashRegister,
  useCloseCashRegister,
  useCashRegisters,
  useCashSummary,
} from '@/hooks/usePOS';
import type { CashRegister } from '@/types/pos';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function CashRegisterPage() {
  const [showOpen, setShowOpen] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [openingBalance, setOpeningBalance] = useState('0');
  const [closingBalance, setClosingBalance] = useState('0');
  const [notes, setNotes] = useState('');

  const { data: currentCash, refetch } = useCurrentCashRegister();
  const { data: cashHistory } = useCashRegisters({ status: '' });
  const { data: summary } = useCashSummary();
  const openCash = useOpenCashRegister();
  const closeCash = useCloseCashRegister();

  const handleOpenCash = async () => {
    try {
      await openCash.mutateAsync({
        opening_balance: openingBalance,
        notes,
      });
      toast.success('Caixa aberto com sucesso!');
      setShowOpen(false);
      setOpeningBalance('0');
      setNotes('');
      refetch();
    } catch (error) {
      toast.error('Erro ao abrir caixa');
    }
  };

  const handleCloseCash = async () => {
    if (!currentCash) return;

    try {
      await closeCash.mutateAsync({
        id: currentCash.id,
        data: {
          closing_balance: closingBalance,
          notes,
        },
      });
      toast.success('Caixa fechado com sucesso!');
      setShowClose(false);
      setClosingBalance('0');
      setNotes('');
      refetch();
    } catch (error) {
      toast.error('Erro ao fechar caixa');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Caixa</h1>
          <p className="text-muted-foreground">
            Controle de abertura e fechamento do caixa
          </p>
        </div>
        {currentCash ? (
          <Button onClick={() => setShowClose(true)} variant="destructive">
            Fechar Caixa
          </Button>
        ) : (
          <Button onClick={() => setShowOpen(true)}>Abrir Caixa</Button>
        )}
      </div>

      {/* Status do Caixa */}
      {currentCash ? (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Caixa está <strong>ABERTO</strong> desde{' '}
            {format(new Date(currentCash.opened_at), "dd/MM/yyyy 'às' HH:mm", {
              locale: ptBR,
            })}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-orange-500 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Nenhum caixa aberto no momento. Abra um caixa para começar a vender.
          </AlertDescription>
        </Alert>
      )}

      {/* Cards de Resumo */}
      {currentCash && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Saldo Inicial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                R$ {parseFloat(currentCash.opening_balance).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total em Vendas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                R$ {parseFloat(currentCash.total_sales).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Qtd. Vendas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{currentCash.total_sales_count}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Saldo Esperado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">
                R${' '}
                {(
                  parseFloat(currentCash.opening_balance) +
                  parseFloat(currentCash.total_sales)
                ).toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Breakdown de Pagamentos */}
      {currentCash && currentCash.payment_breakdown && (
        <Card>
          <CardHeader>
            <CardTitle>Formas de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(currentCash.payment_breakdown).map(
                ([method, data]: [string, { label: string; total: number }]) => (
                  <div key={method} className="text-center p-4 border rounded">
                    <p className="text-sm text-muted-foreground mb-1">
                      {data.label}
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      R$ {data.total.toFixed(2)}
                    </p>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo do Dia */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded">
                <p className="text-sm text-muted-foreground mb-1">
                  Total de Caixas
                </p>
                <p className="text-2xl font-bold">{summary.total_registers}</p>
              </div>
              <div className="text-center p-4 border rounded">
                <p className="text-sm text-muted-foreground mb-1">Caixas Abertos</p>
                <p className="text-2xl font-bold text-green-600">
                  {summary.open_registers}
                </p>
              </div>
              <div className="text-center p-4 border rounded">
                <p className="text-sm text-muted-foreground mb-1">Total Vendas</p>
                <p className="text-2xl font-bold">{summary.total_sales}</p>
              </div>
              <div className="text-center p-4 border rounded">
                <p className="text-sm text-muted-foreground mb-1">
                  Faturamento Total
                </p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {summary.total_amount?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico de Caixas */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Caixas</CardTitle>
        </CardHeader>
        <CardContent>
          {cashHistory && cashHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operador</TableHead>
                  <TableHead>Abertura</TableHead>
                  <TableHead>Fechamento</TableHead>
                  <TableHead>Saldo Inicial</TableHead>
                  <TableHead>Saldo Final</TableHead>
                  <TableHead>Diferença</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cashHistory.map((cash: CashRegister) => (
                  <TableRow key={cash.id}>
                    <TableCell>
                      {cash.user_details.first_name} {cash.user_details.last_name}
                    </TableCell>
                    <TableCell>
                      {format(new Date(cash.opened_at), 'dd/MM/yyyy HH:mm', {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>
                      {cash.closed_at
                        ? format(new Date(cash.closed_at), 'dd/MM/yyyy HH:mm', {
                            locale: ptBR,
                          })
                        : '-'}
                    </TableCell>
                    <TableCell>R$ {parseFloat(cash.opening_balance).toFixed(2)}</TableCell>
                    <TableCell>
                      {cash.closing_balance
                        ? `R$ ${parseFloat(cash.closing_balance).toFixed(2)}`
                        : '-'}
                    </TableCell>
                    <TableCell
                      className={
                        cash.difference
                          ? parseFloat(cash.difference) < 0
                            ? 'text-red-600'
                            : 'text-green-600'
                          : ''
                      }
                    >
                      {cash.difference
                        ? `R$ ${parseFloat(cash.difference).toFixed(2)}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={cash.status === 'open' ? 'default' : 'secondary'}
                      >
                        {cash.status_display}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhum histórico encontrado
            </p>
          )}
        </CardContent>
      </Card>

      {/* Dialog: Abrir Caixa */}
      <Dialog open={showOpen} onOpenChange={setShowOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir Caixa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Saldo Inicial *</Label>
              <CurrencyInput
                value={openingBalance}
                onChange={(value) => setOpeningBalance(value)}
                placeholder="R$ 0,00"
              />
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações opcionais"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleOpenCash} disabled={openCash.isPending}>
              {openCash.isPending ? 'Abrindo...' : 'Abrir Caixa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Fechar Caixa */}
      <Dialog open={showClose} onOpenChange={setShowClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fechar Caixa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {currentCash && (
              <div className="bg-muted p-4 rounded space-y-2">
                <div className="flex justify-between">
                  <span>Saldo Inicial:</span>
                  <span className="font-semibold">
                    R$ {parseFloat(currentCash.opening_balance).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total em Vendas:</span>
                  <span className="font-semibold text-green-600">
                    R$ {parseFloat(currentCash.total_sales).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Saldo Esperado:</span>
                  <span className="text-blue-600">
                    R${' '}
                    {(
                      parseFloat(currentCash.opening_balance) +
                      parseFloat(currentCash.total_sales)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Saldo de Fechamento *</Label>
              <CurrencyInput
                value={closingBalance}
                onChange={(value) => setClosingBalance(value)}
                placeholder="R$ 0,00"
              />
              <p className="text-sm text-muted-foreground">
                Informe o valor real em dinheiro no caixa
              </p>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações sobre o fechamento"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClose(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCloseCash}
              disabled={closeCash.isPending}
              variant="destructive"
            >
              {closeCash.isPending ? 'Fechando...' : 'Fechar Caixa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
