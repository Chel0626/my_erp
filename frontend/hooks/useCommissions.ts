"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Types
export interface CommissionRule {
  id: number;
  professional: number | null;
  professional_name: string | null;
  service: number | null;
  service_name: string | null;
  commission_percentage: string;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCommissionRuleData {
  professional?: number | null;
  service?: number | null;
  commission_percentage: string;
  is_active?: boolean;
  priority?: number;
}

export interface Commission {
  id: number;
  professional: number;
  professional_name: string;
  appointment: number;
  service: number;
  service_name: string;
  rule: number | null;
  service_price: string;
  commission_percentage: string;
  commission_amount: string;
  status: "pending" | "paid" | "cancelled";
  status_display: string;
  date: string;
  paid_at: string | null;
  paid_by: number | null;
  paid_by_name: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCommissionData {
  professional: number;
  appointment: number;
  service: number;
  rule?: number | null;
  service_price: string;
  commission_percentage: string;
  date: string;
  notes?: string;
}

export interface CommissionSummary {
  total_pending: string;
  total_paid: string;
  total_cancelled: string;
  count_pending: number;
  count_paid: number;
  count_cancelled: number;
}

export interface CommissionFilters {
  status?: "pending" | "paid" | "cancelled";
  professional?: number;
  date_from?: string;
  date_to?: string;
}

// Commission Rules Hooks

export function useCommissionRules() {
  return useQuery<CommissionRule[]>({
    queryKey: ["commission-rules"],
    queryFn: async () => {
      const response = await api.get("/commissions/rules/");
      return response.data.results || response.data;
    },
  });
}

export function useActiveCommissionRules() {
  return useQuery<CommissionRule[]>({
    queryKey: ["commission-rules", "active"],
    queryFn: async () => {
      const response = await api.get("/commissions/rules/active/");
      return response.data.results || response.data;
    },
  });
}

export function useCommissionRulesByProfessional(professionalId: number | null) {
  return useQuery<CommissionRule[]>({
    queryKey: ["commission-rules", "by-professional", professionalId],
    queryFn: async () => {
      const response = await api.get("/commissions/rules/by_professional/", {
        params: { professional_id: professionalId },
      });
      return response.data;
    },
    enabled: !!professionalId,
  });
}

export function useCreateCommissionRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCommissionRuleData) => {
      const response = await api.post("/commissions/rules/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commission-rules"] });
    },
  });
}

export function useUpdateCommissionRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CreateCommissionRuleData>;
    }) => {
      const response = await api.patch(`/commissions/rules/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commission-rules"] });
    },
  });
}

export function useDeleteCommissionRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/commissions/rules/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commission-rules"] });
    },
  });
}

// Commissions Hooks

export function useCommissions(filters?: CommissionFilters) {
  return useQuery<Commission[]>({
    queryKey: ["commissions", filters],
    queryFn: async () => {
      const response = await api.get("/commissions/", {
        params: filters,
      });
      return response.data.results || response.data;
    },
  });
}

export function usePendingCommissions() {
  return useQuery<Commission[]>({
    queryKey: ["commissions", "pending"],
    queryFn: async () => {
      const response = await api.get("/commissions/pending/");
      return response.data.results || response.data;
    },
  });
}

export function useCommissionsByProfessional(professionalId: number | null) {
  return useQuery<Commission[]>({
    queryKey: ["commissions", "by-professional", professionalId],
    queryFn: async () => {
      const response = await api.get("/commissions/by_professional/", {
        params: { professional_id: professionalId },
      });
      return response.data;
    },
    enabled: !!professionalId,
  });
}

export function useCommissionsByPeriod(dateFrom?: string, dateTo?: string) {
  return useQuery<Commission[]>({
    queryKey: ["commissions", "by-period", dateFrom, dateTo],
    queryFn: async () => {
      const response = await api.get("/commissions/by_period/", {
        params: { date_from: dateFrom, date_to: dateTo },
      });
      return response.data;
    },
    enabled: !!dateFrom && !!dateTo,
  });
}

export function useCommissionSummary(filters?: CommissionFilters) {
  return useQuery<CommissionSummary>({
    queryKey: ["commissions", "summary", filters],
    queryFn: async () => {
      const response = await api.get("/commissions/summary/", {
        params: filters,
      });
      return response.data;
    },
  });
}

export function useCreateCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCommissionData) => {
      const response = await api.post("/commissions/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
    },
  });
}

export function useMarkCommissionsAsPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commission_ids,
      notes,
    }: {
      commission_ids: number[];
      notes?: string;
    }) => {
      const response = await api.post("/commissions/mark_as_paid/", {
        commission_ids,
        notes,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
    },
  });
}

export function useCancelCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes?: string }) => {
      const response = await api.post(`/commissions/${id}/cancel/`, {
        notes,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
    },
  });
}

/**
 * Exportar comissões para CSV
 */
export async function exportCommissionsCSV(filters?: {
  status?: string;
  professional?: number;
  date_from?: string;
  date_to?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.professional) params.append('professional', filters.professional.toString());
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);
  
  const response = await api.get(`/commissions/export_csv/?${params.toString()}`, {
    responseType: 'blob',
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'comissoes.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/**
 * Exportar comissões para PDF
 */
export async function exportCommissionsPDF(filters?: {
  status?: string;
  professional?: number;
  date_from?: string;
  date_to?: string;
}) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.professional) params.append('professional', filters.professional.toString());
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);

  // Buscar dados da API
  const response = await api.get(`/commissions/commissions/?${params.toString()}`);
  const commissions = response.data.results || response.data || [];

  // Criar PDF
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(18);
  doc.text('Relatório de Comissões', 14, 20);
  
  // Data de geração
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 28);

  // Mapear status
  const statusMap: Record<string, string> = {
    pending: 'Pendente',
    paid: 'Paga',
    cancelled: 'Cancelada',
  };

  // Preparar dados da tabela
  const tableData = commissions.map((comm: Commission) => {
    const date = new Date(comm.date);
    return [
      date.toLocaleDateString('pt-BR'),
      comm.professional_name || '-',
      comm.service_name || '-',
      `R$ ${parseFloat(comm.service_price).toFixed(2)}`,
      `${parseFloat(comm.commission_percentage).toFixed(1)}%`,
      `R$ ${parseFloat(comm.commission_amount).toFixed(2)}`,
      statusMap[comm.status] || comm.status,
    ];
  });

  // Criar tabela
  autoTable(doc, {
    startY: 35,
    head: [['Data', 'Profissional', 'Serviço', 'Valor Serv.', '%', 'Comissão', 'Status']],
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
      0: { cellWidth: 22 }, // Data
      1: { cellWidth: 35 }, // Profissional
      2: { cellWidth: 35 }, // Serviço
      3: { cellWidth: 25 }, // Valor Serviço
      4: { cellWidth: 18 }, // %
      5: { cellWidth: 25 }, // Comissão
      6: { cellWidth: 25 }, // Status
    },
  });

  // Salvar PDF
  doc.save('comissoes.pdf');
}
