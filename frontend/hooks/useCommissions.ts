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
      return response.data;
    },
  });
}

export function useActiveCommissionRules() {
  return useQuery<CommissionRule[]>({
    queryKey: ["commission-rules", "active"],
    queryFn: async () => {
      const response = await api.get("/commissions/rules/active/");
      return response.data;
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
