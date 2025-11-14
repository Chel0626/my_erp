// usePOS hook - React Query hooks for Point of Sale

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { 
  Sale, 
  SaleCreate, 
  SaleDashboard,
  CashRegister,
  CashRegisterCreate,
  CashRegisterClose
} from '@/types/pos';

const POS_API = {
  // Sales
  sales: '/pos/sales/',
  sale: (id: number) => `/pos/sales/${id}/`,
  cancelSale: (id: number) => `/pos/sales/${id}/cancel_sale/`,
  printReceipt: (id: number) => `/pos/sales/${id}/print_receipt/`,
  exportCSV: '/pos/sales/export_csv/',
  exportExcel: '/pos/sales/export_excel/',
  dashboard: '/pos/sales/dashboard/',
  
  // Cash Register
  cashRegisters: '/pos/cash-registers/',
  cashRegister: (id: number) => `/pos/cash-registers/${id}/`,
  closeCash: (id: number) => `/pos/cash-registers/${id}/close/`,
  currentCash: '/pos/cash-registers/current/',
  cashSummary: '/pos/cash-registers/summary/',
};

// ========== SALES ==========

export function useSales(params?: {
  customer?: number;
  user?: number;
  payment_method?: string;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
}) {
  return useQuery({
    queryKey: ['sales', params],
    queryFn: async () => {
      const { data } = await api.get<Sale[]>(POS_API.sales, { params });
      return data;
    },
  });
}

export function useSale(id: number) {
  return useQuery({
    queryKey: ['sale', id],
    queryFn: async () => {
      const { data } = await api.get<Sale>(POS_API.sale(id));
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (saleData: SaleCreate) => {
      const { data } = await api.post<Sale>(POS_API.sales, saleData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['cash-registers'] });
      queryClient.invalidateQueries({ queryKey: ['current-cash'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['sale-dashboard'] });
    },
  });
}

export function useCancelSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post<Sale>(POS_API.cancelSale(id));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['sale-dashboard'] });
    },
  });
}

export function usePrintReceipt(id: number) {
  return useQuery({
    queryKey: ['receipt', id],
    queryFn: async () => {
      const { data } = await api.get(POS_API.printReceipt(id));
      return data;
    },
    enabled: false, // Manual trigger
  });
}

export function useSaleDashboard() {
  return useQuery({
    queryKey: ['sale-dashboard'],
    queryFn: async () => {
      const { data } = await api.get<SaleDashboard>(POS_API.dashboard);
      return data;
    },
  });
}

// ========== CASH REGISTER ==========

export function useCashRegisters(params?: {
  user?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
}) {
  return useQuery({
    queryKey: ['cash-registers', params],
    queryFn: async () => {
      const { data } = await api.get<CashRegister[]>(POS_API.cashRegisters, { params });
      return data;
    },
  });
}

export function useCashRegister(id: number) {
  return useQuery({
    queryKey: ['cash-register', id],
    queryFn: async () => {
      const { data } = await api.get<CashRegister>(POS_API.cashRegister(id));
      return data;
    },
    enabled: !!id,
  });
}

export function useCurrentCashRegister() {
  return useQuery({
    queryKey: ['current-cash'],
    queryFn: async () => {
      try {
        const { data } = await api.get<CashRegister>(POS_API.currentCash);
        return data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
  });
}

export function useOpenCashRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cashData: CashRegisterCreate) => {
      const { data } = await api.post<CashRegister>(POS_API.cashRegisters, cashData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-registers'] });
      queryClient.invalidateQueries({ queryKey: ['current-cash'] });
      queryClient.invalidateQueries({ queryKey: ['cash-summary'] });
    },
  });
}

export function useCloseCashRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CashRegisterClose }) => {
      const response = await api.post<CashRegister>(POS_API.closeCash(id), data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-registers'] });
      queryClient.invalidateQueries({ queryKey: ['current-cash'] });
      queryClient.invalidateQueries({ queryKey: ['cash-summary'] });
    },
  });
}

export function useCashSummary() {
  return useQuery({
    queryKey: ['cash-summary'],
    queryFn: async () => {
      const { data } = await api.get(POS_API.cashSummary);
      return data;
    },
  });
}

// ========== EXPORT FUNCTIONS ==========

export async function exportSalesCSV(params?: any) {
  try {
    const response = await api.get(POS_API.exportCSV, {
      params,
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'vendas.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao exportar CSV:', error);
    throw error;
  }
}

export async function exportSalesPDF(params?: any) {
  try {
    // Importação dinâmica do jsPDF
    const jsPDF = (await import('jspdf')).default;
    await import('jspdf-autotable');
    
    // Buscar dados das vendas
    const { data: sales } = await api.get<Sale[]>(POS_API.sales, { params });
    
    if (!sales || sales.length === 0) {
      throw new Error('Nenhuma venda encontrada para exportar');
    }
    
    // Criar documento PDF
    const doc = new jsPDF() as any;
    
    // Título
    doc.setFontSize(18);
    doc.text('Relatório de Vendas', 14, 22);
    
    // Data de geração
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);
    
    // Criar tabela
    doc.autoTable({
      startY: 35,
      head: [['ID', 'Data', 'Cliente', 'Vendedor', 'Total', 'Pagamento', 'Status']],
      body: sales.map((sale) => [
        `#${sale.id}`,
        new Date(sale.date).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        sale.customer_details?.name || 'Cliente Avulso',
        `${sale.user_details.first_name} ${sale.user_details.last_name}`,
        `R$ ${parseFloat(sale.total).toFixed(2)}`,
        sale.payment_method_display,
        sale.payment_status_display,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105] }, // slate-700
      styles: { fontSize: 9 },
    });
    
    // Total geral
    const totalSales = sales.reduce((acc, sale) => acc + parseFloat(sale.total), 0);
    const finalY = doc.lastAutoTable.finalY || 35;
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total Geral: R$ ${totalSales.toFixed(2)}`, 14, finalY + 10);
    
    // Download
    doc.save('vendas.pdf');
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
}