'use client';

import { useState } from 'react';
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction, Transaction, CreateTransactionInput, TransactionFilters as TFilters, exportTransactionsCSV, exportTransactionsPDF } from '@/hooks/useTransactions';
import { useActivePaymentMethods } from '@/hooks/usePaymentMethods';
import TransactionCard from '@/components/financial/TransactionCard';
import TransactionForm from '@/components/financial/TransactionForm';
import FinancialSummary from '@/components/financial/FinancialSummary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Filter, X, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function TransactionsPage() {
  // Estados de filtros
  const [filters, setFilters] = useState<TFilters>({
    start_date: '',
    end_date: '',
    type: undefined,
    payment_method: '',
  });

  // Estados de dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  // Queries e mutations
  const { data: transactions, isLoading, error } = useTransactions(filters);
  const { data: paymentMethods } = useActivePaymentMethods();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  // Type helper for error handling
  type AxiosError = { response?: { data?: { detail?: string } } };

  // Handlers
  const handleCreate = async (data: CreateTransactionInput) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success('Transação criada com sucesso!');
      setIsCreateDialogOpen(false);
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      toast.error(axiosError.response?.data?.detail || 'Erro ao criar transação');
    }
  };

  const handleUpdate = async (data: CreateTransactionInput) => {
    if (!selectedTransaction) return;
    
    try {
      await updateMutation.mutateAsync({ id: selectedTransaction.id, ...data });
      toast.success('Transação atualizada com sucesso!');
      setIsEditDialogOpen(false);
      setSelectedTransaction(null);
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      toast.error(axiosError.response?.data?.detail || 'Erro ao atualizar transação');
    }
  };

  const handleDelete = async () => {
    if (!transactionToDelete) return;
    
    try {
      await deleteMutation.mutateAsync(transactionToDelete);
      toast.success('Transação deletada com sucesso!');
      setIsDeleteDialogOpen(false);
      setTransactionToDelete(null);
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      toast.error(axiosError.response?.data?.detail || 'Erro ao deletar transação');
    }
  };

  const openEditDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setTransactionToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleExportCSV = async () => {
    try {
      await exportTransactionsCSV(filters);
      toast.success('Exportação CSV concluída!');
    } catch (error) {
      toast.error('Erro ao exportar CSV');
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportTransactionsPDF(filters);
      toast.success('Exportação PDF concluída!');
    } catch (error) {
      toast.error('Erro ao exportar PDF');
    }
  };

  const clearFilters = () => {
    setFilters({
      start_date: '',
      end_date: '',
      type: undefined,
      payment_method: '',
    });
  };

  const hasActiveFilters = filters.start_date || filters.end_date || filters.type || filters.payment_method;

  return (
    <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header - Compacto mobile */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Transações Financeiras</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gerencie suas receitas e despesas
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => setIsCreateDialogOpen(true)} size="default" className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Nova Transação
          </Button>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button variant="outline" onClick={handleExportPDF} size="sm" className="px-3">
              <FileText className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
            <Button variant="outline" onClick={handleExportCSV} size="sm" className="px-3">
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">CSV</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Resumo Financeiro - Responsivo */}
      <FinancialSummary 
        startDate={filters.start_date} 
        endDate={filters.end_date} 
      />

      {/* Filtros - Grid responsivo */}
      <div className="bg-card border rounded-lg p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <h2 className="text-sm sm:text-base font-semibold">Filtros</h2>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 sm:px-4">
              <X className="h-3.5 w-3.5 sm:mr-2" />
              <span className="hidden sm:inline">Limpar</span>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Data Início */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="start_date" className="text-xs sm:text-sm">Data Início</Label>
            <Input
              id="start_date"
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
              className="h-9 sm:h-10 text-sm"
            />
          </div>

          {/* Data Fim */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="end_date" className="text-xs sm:text-sm">Data Fim</Label>
            <Input
              id="end_date"
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
              className="h-9 sm:h-10 text-sm"
            />
          </div>

          {/* Tipo */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="type" className="text-xs sm:text-sm">Tipo</Label>
            <select
              id="type"
              value={filters.type || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value === '' ? undefined : e.target.value as 'receita' | 'despesa' }))}
              className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Todos</option>
              <option value="receita">💰 Receitas</option>
              <option value="despesa">⚠️ Despesas</option>
            </select>
          </div>

          {/* Método de Pagamento */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="payment_method" className="text-xs sm:text-sm">Método de Pagamento</Label>
            <select
              id="payment_method"
              value={filters.payment_method}
              onChange={(e) => setFilters(prev => ({ ...prev, payment_method: e.target.value }))}
              className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Todos</option>
              {paymentMethods?.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Transações */}
      <div className="space-y-3 sm:space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando transações...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-semibold">Erro ao carregar transações</p>
            <p className="text-red-500 text-sm mt-1">
              {error instanceof Error ? error.message : 'Erro desconhecido'}
            </p>
          </div>
        )}

        {!isLoading && !error && transactions && transactions.length === 0 && (
          <div className="bg-muted rounded-lg p-12 text-center">
            <p className="text-muted-foreground text-lg">
              {hasActiveFilters 
                ? 'Nenhuma transação encontrada com os filtros aplicados'
                : 'Nenhuma transação cadastrada ainda'}
            </p>
            {!hasActiveFilters && (
              <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar primeira transação
              </Button>
            )}
          </div>
        )}

        {!isLoading && !error && transactions && Array.isArray(transactions) && transactions.length > 0 && (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialog - Criar Transação */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
          </DialogHeader>
          <TransactionForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog - Editar Transação */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Transação</DialogTitle>
          </DialogHeader>
          <TransactionForm
            transaction={selectedTransaction || undefined}
            onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setSelectedTransaction(null);
            }}
            isLoading={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog - Confirmar Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta transação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTransactionToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deletando...' : 'Deletar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
