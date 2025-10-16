"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  useCommissions,
  useCommissionSummary,
  useMarkCommissionsAsPaid,
  useCancelCommission,
  type Commission,
  type CommissionFilters,
} from "@/hooks/useCommissions";

export default function CommissionsPage() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<CommissionFilters>({});
  const [selectedCommissions, setSelectedCommissions] = useState<number[]>([]);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentNotes, setPaymentNotes] = useState("");

  const { data: commissions = [], isLoading } = useCommissions(filters);
  const { data: summary } = useCommissionSummary(filters);
  const markAsPaidMutation = useMarkCommissionsAsPaid();
  const cancelMutation = useCancelCommission();

  const handleSelectCommission = (id: number, checked: boolean) => {
    setSelectedCommissions((prev) =>
      checked ? [...prev, id] : prev.filter((cid) => cid !== id)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pendingIds = commissions
        .filter((c) => c.status === "pending")
        .map((c) => c.id);
      setSelectedCommissions(pendingIds);
    } else {
      setSelectedCommissions([]);
    }
  };

  const handleMarkAsPaid = async () => {
    if (selectedCommissions.length === 0) {
      toast({
        title: "Nenhuma comissão selecionada",
        description: "Selecione pelo menos uma comissão para marcar como paga.",
        variant: "destructive",
      });
      return;
    }

    try {
      await markAsPaidMutation.mutateAsync({
        commission_ids: selectedCommissions,
        notes: paymentNotes,
      });
      toast({
        title: "Sucesso!",
        description: `${selectedCommissions.length} comissão(ões) marcada(s) como paga(s).`,
      });
      setSelectedCommissions([]);
      setPaymentDialogOpen(false);
      setPaymentNotes("");
    } catch (error: any) {
      toast({
        title: "Erro ao pagar comissões",
        description: error.response?.data?.error || "Erro ao processar pagamento.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = async (commission: Commission) => {
    if (
      !window.confirm(
        `Tem certeza que deseja cancelar a comissão de ${commission.professional_name}?`
      )
    ) {
      return;
    }

    try {
      await cancelMutation.mutateAsync({
        id: commission.id,
        notes: "Cancelada pelo usuário",
      });
      toast({
        title: "Comissão cancelada",
        description: "A comissão foi cancelada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao cancelar comissão",
        description: error.response?.data?.error || "Erro ao cancelar.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: Commission["status"]) => {
    const variants = {
      pending: { variant: "outline" as const, icon: Clock, label: "Pendente" },
      paid: { variant: "default" as const, icon: CheckCircle, label: "Paga" },
      cancelled: {
        variant: "destructive" as const,
        icon: XCircle,
        label: "Cancelada",
      },
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(value));
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando comissões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Comissões</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="/dashboard/commissions/rules">
              Gerenciar Regras
            </a>
          </Button>
          {selectedCommissions.length > 0 && (
            <Button onClick={() => setPaymentDialogOpen(true)}>
              Marcar como Pagas ({selectedCommissions.length})
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Comissões Pendentes
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.total_pending)}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.count_pending} comissão(ões)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Comissões Pagas
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.total_paid)}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.count_paid} comissão(ões)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Comissões Canceladas
              </CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.total_cancelled)}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.count_cancelled} comissão(ões)
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  status: value === "all" ? undefined : (value as any),
                }))
              }
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="paid">Pagas</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_from">Data Inicial</Label>
            <Input
              id="date_from"
              type="date"
              value={filters.date_from || ""}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, date_from: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_to">Data Final</Label>
            <Input
              id="date_to"
              type="date"
              value={filters.date_to || ""}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, date_to: e.target.value }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Commissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Comissões</CardTitle>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhuma comissão encontrada.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedCommissions.length > 0 &&
                          selectedCommissions.length ===
                            commissions.filter((c) => c.status === "pending")
                              .length
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Valor Serviço</TableHead>
                    <TableHead>% Comissão</TableHead>
                    <TableHead>Valor Comissão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell>
                        {commission.status === "pending" && (
                          <Checkbox
                            checked={selectedCommissions.includes(commission.id)}
                            onCheckedChange={(checked) =>
                              handleSelectCommission(
                                commission.id,
                                checked as boolean
                              )
                            }
                          />
                        )}
                      </TableCell>
                      <TableCell>{formatDate(commission.date)}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {commission.professional_name}
                      </TableCell>
                      <TableCell>{commission.service_name}</TableCell>
                      <TableCell>
                        {formatCurrency(commission.service_price)}
                      </TableCell>
                      <TableCell>{commission.commission_percentage}%</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(commission.commission_amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(commission.status)}</TableCell>
                      <TableCell>
                        {commission.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancel(commission)}
                          >
                            Cancelar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar Comissões como Pagas</DialogTitle>
            <DialogDescription>
              Você está prestes a marcar {selectedCommissions.length}{" "}
              comissão(ões) como pagas. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment-notes">Observações (opcional)</Label>
              <Textarea
                id="payment-notes"
                placeholder="Ex: Pagamento via PIX, comprovante #12345"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPaymentDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleMarkAsPaid}
              disabled={markAsPaidMutation.isPending}
            >
              {markAsPaidMutation.isPending ? "Processando..." : "Confirmar Pagamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
