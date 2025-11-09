import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// ==============================
// TYPES
// ==============================

export interface PaymentMethod {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  type: 'receita' | 'despesa';
  description: string;
  amount: string;
  date: string;
  payment_method: string;
  payment_method_details: PaymentMethod;
  appointment?: string;
  appointment_details?: any;
  notes: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionInput {
  type: 'receita' | 'despesa';
  description: string;
  amount: string | number;
  date: string;
  payment_method_id: string;
  appointment_id?: string;
  notes?: string;
}

export interface UpdateTransactionInput extends CreateTransactionInput {
  id: string;
}

export interface TransactionFilters {
  date?: string;
  start_date?: string;
  end_date?: string;
  type?: 'receita' | 'despesa';
  payment_method?: string;
}

export interface TransactionSummary {
  start_date: string;
  end_date: string;
  total_revenue: string;
  total_expenses: string;
  balance: string;
  transaction_count: number;
}

// ==============================
// QUERIES (Leitura)
// ==============================

/**
 * Hook para listar transações com filtros opcionais
 */
export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.date) params.append('date', filters.date);
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.payment_method) params.append('payment_method', filters.payment_method);

      const response = await api.get(`/financial/transactions/?${params.toString()}`);
      return response.data as Transaction[];
    },
  });
}

/**
 * Hook para buscar uma transação específica
 */
export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      const response = await api.get(`/financial/transactions/${id}/`);
      return response.data as Transaction;
    },
    enabled: !!id,
  });
}

/**
 * Hook para buscar transações de hoje
 */
export function useTransactionsToday() {
  return useQuery({
    queryKey: ['transactions', 'today'],
    queryFn: async () => {
      const response = await api.get('/financial/transactions/today/');
      return response.data as Transaction[];
    },
  });
}

/**
 * Hook para buscar resumo financeiro
 */
export function useTransactionSummary(filters?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: ['transactions', 'summary', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);

      const response = await api.get(`/financial/transactions/summary/?${params.toString()}`);
      return response.data as TransactionSummary;
    },
  });
}

/**
 * Hook para buscar resumo por método de pagamento
 */
export function useTransactionsByPaymentMethod(filters?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: ['transactions', 'by-payment-method', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);

      const response = await api.get(`/financial/transactions/by_payment_method/?${params.toString()}`);
      return response.data;
    },
  });
}

// ==============================
// MUTATIONS (Escrita)
// ==============================

/**
 * Hook para criar nova transação
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTransactionInput) => {
      const response = await api.post('/financial/transactions/', data);
      return response.data as Transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

/**
 * Hook para atualizar transação
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateTransactionInput) => {
      const response = await api.put(`/financial/transactions/${id}/`, data);
      return response.data as Transaction;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction', data.id] });
    },
  });
}

/**
 * Hook para deletar transação
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/financial/transactions/${id}/`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

// ==============================
// EXPORTAÇÕES
// ==============================

/**
 * Exporta transações em formato CSV
 */
export async function exportTransactionsCSV(filters?: TransactionFilters) {
  try {
    const params = new URLSearchParams();
    if (filters?.date) params.append('date', filters.date);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.payment_method) params.append('payment_method', filters.payment_method);

    const response = await api.get(`/financial/transactions/export_csv/?${params.toString()}`, {
      responseType: 'blob',
    });

    if (!response.data) {
      throw new Error('Resposta vazia da API');
    }

    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transacoes_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao exportar CSV de transações:', error);
    throw error;
  }
}

/**
 * Exporta transações em formato PDF
 */
export async function exportTransactionsPDF(filters?: TransactionFilters) {
  try {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    
    const params = new URLSearchParams();
    if (filters?.date) params.append('date', filters.date);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.payment_method) params.append('payment_method', filters.payment_method);

    // Buscar dados da API
    const response = await api.get(`/financial/transactions/?${params.toString()}`);
    const transactions = response.data.results || response.data || [];

    if (!transactions || transactions.length === 0) {
      throw new Error('Nenhuma transação encontrada para exportar');
    }

    // Criar PDF
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text('Relatório de Transações', 14, 20);
    
    // Data de geração
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 28);

  // Mapear tipos
  const typeMap: Record<string, string> = {
    receita: 'Receita',
    despesa: 'Despesa',
  };

  // Preparar dados da tabela
  const tableData = transactions.map((trans: Transaction) => {
    const date = new Date(trans.date);
    const amount = parseFloat(trans.amount);
    const isReceita = trans.type === 'receita';
    
    return [
      date.toLocaleDateString('pt-BR'),
      typeMap[trans.type] || trans.type,
      trans.description || '-',
      trans.payment_method_details?.name || '-',
      `${isReceita ? '+' : '-'} R$ ${amount.toFixed(2)}`,
      trans.notes || '-',
    ];
  });

  // Criar tabela
  autoTable(doc, {
    startY: 35,
    head: [['Data', 'Tipo', 'Descrição', 'Forma Pgto.', 'Valor', 'Observações']],
    body: tableData,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [79, 70, 229], // Indigo
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 25 }, // Data
      1: { cellWidth: 22 }, // Tipo
      2: { cellWidth: 45 }, // Descrição
      3: { cellWidth: 30 }, // Forma Pgto
      4: { cellWidth: 30 }, // Valor
      5: { cellWidth: 38 }, // Observações
    },
    // Colorir linhas de acordo com tipo
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        const value = data.cell.text[0];
        if (value.startsWith('+')) {
          data.cell.styles.textColor = [16, 185, 129]; // green
        } else if (value.startsWith('-')) {
          data.cell.styles.textColor = [239, 68, 68]; // red
        }
      }
    },
  });

  // Salvar PDF
  const filename = `transacoes_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
  } catch (error) {
    console.error('Erro ao exportar PDF de transações:', error);
    throw error;
  }
}
