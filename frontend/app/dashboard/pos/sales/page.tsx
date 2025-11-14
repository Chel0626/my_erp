'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSales, useCancelSale, exportSalesCSV, exportSalesPDF } from '@/hooks/usePOS';
import type { Sale } from '@/types/pos';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Download, FileText, X, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function SalesPage() {
  const [filters, setFilters] = useState({
    payment_method: '',
    payment_status: '',
    date_from: '',
    date_to: '',
  });

  const { data: sales, isLoading } = useSales(filters);
  const cancelSale = useCancelSale();

  const handleCancelSale = async (id: number) => {
    if (!confirm('Tem certeza que deseja cancelar esta venda?')) return;

    try {
      await cancelSale.mutateAsync(id);
      toast.success('Venda cancelada com sucesso!');
    } catch (error) {
      toast.error('Erro ao cancelar venda');
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      if (format === 'csv') {
        await exportSalesCSV(filters);
      } else {
        await exportSalesPDF(filters);
      }
      toast.success(`Exportação ${format.toUpperCase()} realizada com sucesso!`);
    } catch (error) {
      toast.error('Erro ao exportar');
    }
  };

  const totalSales = Array.isArray(sales) ? sales.reduce((sum: number, sale: Sale) => sum + parseFloat(sale.total), 0) : 0;
  const paidSales = Array.isArray(sales) ? sales.filter((s: Sale) => s.payment_status === 'paid').length : 0;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Vendas</h1>
          <p className="text-muted-foreground text-sm">Histórico de vendas realizadas</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => handleExport('csv')} className="flex-1 md:flex-none">
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Exportar </span>CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')} className="flex-1 md:flex-none">
            <FileText className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Exportar </span>PDF
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{sales?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Vendas Pagas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{paidSales}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Faturado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              R$ {totalSales.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="max-w-full overflow-x-hidden">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Forma de Pagamento</Label>
              <Select
                value={filters.payment_method}
                onValueChange={(value) =>
                  setFilters({ ...filters, payment_method: value === "all" ? "" : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                  <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="bank_transfer">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.payment_status}
                onValueChange={(value) =>
                  setFilters({ ...filters, payment_status: value === "all" ? "" : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Input
                type="date"
                value={filters.date_from}
                onChange={(e) =>
                  setFilters({ ...filters, date_from: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Data Final</Label>
              <Input
                type="date"
                value={filters.date_to}
                onChange={(e) =>
                  setFilters({ ...filters, date_to: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Vendas */}
      <Card className="max-w-full overflow-x-hidden">
        <CardHeader>
          <CardTitle>Lista de Vendas</CardTitle>
        </CardHeader>
        <CardContent className="max-w-full overflow-x-hidden">
          {isLoading ? (
            <p className="text-center py-8">Carregando...</p>
          ) : sales && sales.length > 0 ? (
            <>
              {/* Tabela Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Vendedor</TableHead>
                      <TableHead>Itens</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(sales) && sales.map((sale: Sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>#{sale.id}</TableCell>
                        <TableCell>
                          {format(new Date(sale.date), "dd/MM/yyyy HH:mm", {
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell>
                          {sale.customer_details?.name || 'Cliente Avulso'}
                        </TableCell>
                        <TableCell>
                          {sale.user_details.first_name} {sale.user_details.last_name}
                        </TableCell>
                        <TableCell>{sale.items.length}</TableCell>
                        <TableCell className="font-semibold">
                          R$ {parseFloat(sale.total).toFixed(2)}
                        </TableCell>
                        <TableCell>{sale.payment_method_display}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              sale.payment_status === 'paid'
                                ? 'default'
                                : sale.payment_status === 'cancelled'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {sale.payment_status_display}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {sale.payment_status !== 'cancelled' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCancelSale(sale.id)}
                              disabled={cancelSale.isPending}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Cards Mobile */}
              <div className="md:hidden space-y-4 max-w-full">
                {Array.isArray(sales) && sales.map((sale: Sale) => (
                  <Card key={sale.id} className="p-4 max-w-full overflow-x-hidden">
                    <div className="space-y-2 max-w-full">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">Venda #{sale.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(sale.date), "dd/MM/yyyy HH:mm", {
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                        <Badge
                          variant={
                            sale.payment_status === 'paid'
                              ? 'default'
                              : sale.payment_status === 'cancelled'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="shrink-0"
                        >
                          {sale.payment_status_display}
                        </Badge>
                      </div>
                      
                      <div className="text-sm space-y-1 max-w-full">
                        <p className="truncate"><span className="font-medium">Cliente:</span> {sale.customer_details?.name || 'Cliente Avulso'}</p>
                        <p className="truncate"><span className="font-medium">Vendedor:</span> {sale.user_details.first_name} {sale.user_details.last_name}</p>
                        <p><span className="font-medium">Itens:</span> {sale.items.length}</p>
                        <p className="truncate"><span className="font-medium">Pagamento:</span> {sale.payment_method_display}</p>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t gap-2">
                        <p className="text-lg font-semibold whitespace-nowrap">
                          R$ {parseFloat(sale.total).toFixed(2)}
                        </p>
                        {sale.payment_status !== 'cancelled' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCancelSale(sale.id)}
                            disabled={cancelSale.isPending}
                            className="shrink-0"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma venda encontrada
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
