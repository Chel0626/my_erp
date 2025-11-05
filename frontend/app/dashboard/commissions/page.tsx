"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Filter,
  Download,
  FileText,
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
  exportCommissionsCSV,
  exportCommissionsExcel,
  type Commission,
  type CommissionFilters,
} from "@/hooks/useCommissions";

export default function CommissionsPage() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<CommissionFilters>({});
  const [selectedCommissions, setSelectedCommissions] = useState<number[]>([]);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [professionals, setProfessionals] = useState<Array<{id: number, name: string}>>([]);

  const { data: commissions = [], isLoading } = useCommissions(filters);
  const { data: summary } = useCommissionSummary(filters);
  const markAsPaidMutation = useMarkCommissionsAsPaid();
  const cancelMutation = useCancelCommission();

  // Buscar lista de profissionais únicos das comissões
  useEffect(() => {
    if (commissions.length > 0) {
      const uniquePros = Array.from(
        new Map(
          commissions.map((c) => [c.professional, { id: c.professional, name: c.professional_name }])
        ).values()
      );
      setProfessionals(uniquePros);
    }
  }, [commissions]);

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
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      toast({
        title: "Erro ao pagar comissões",
        description: axiosError.response?.data?.error || "Erro ao processar pagamento.",
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
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      toast({
        title: "Erro ao cancelar comissão",
        description: axiosError.response?.data?.error || "Erro ao cancelar.",
        variant: "destructive",
      });
    }
  };

  // Funções de exportação
  const handleExportCSV = async () => {
    try {
      await exportCommissionsCSV(filters);
      toast({
        title: 'Exportação concluída',
        description: 'As comissões foram exportadas para CSV.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao exportar as comissões.',
        variant: 'destructive',
      });
    }
  };

  const handleExportExcel = async () => {
    try {
      await exportCommissionsExcel(filters);
      toast({
        title: 'Exportação concluída',
        description: 'As comissões foram exportadas para Excel.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao exportar as comissões.',
        variant: 'destructive',
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
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold">Comissões</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="flex-1 sm:flex-none">
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel} className="flex-1 sm:flex-none">
            <FileText className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Exportar Excel</span>
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
            <a href="/dashboard/commissions/rules">
              Regras
            </a>
          </Button>
          {selectedCommissions.length > 0 && (
            <Button size="sm" onClick={() => setPaymentDialogOpen(true)} className="w-full sm:w-auto">
              Pagar ({selectedCommissions.length})
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Comissões Pendentes
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold truncate">
                {formatCurrency(summary.total_pending)}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.count_pending} comissão(ões)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Comissões Pagas
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold truncate">
                {formatCurrency(summary.total_paid)}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.count_paid} comissão(ões)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Comissões Canceladas
              </CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold truncate">
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
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="status" className="text-xs sm:text-sm">Status</Label>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  status: value === "all" ? undefined : (value as "pending" | "paid" | "cancelled"),
                }))
              }
            >
              <SelectTrigger id="status" className="h-9 sm:h-10">
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
            <Label htmlFor="professional" className="text-xs sm:text-sm">Profissional</Label>
            <Select
              value={filters.professional?.toString() || "all"}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  professional: value === "all" ? undefined : parseInt(value),
                }))
              }
            >
              <SelectTrigger id="professional" className="h-9 sm:h-10">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {professionals.map((pro) => (
                  <SelectItem key={pro.id} value={pro.id.toString()}>
                    {pro.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_from" className="text-xs sm:text-sm">Data Inicial</Label>
            <Input
              id="date_from"
              type="date"
              className="h-9 sm:h-10 text-sm"
              value={filters.date_from || ""}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, date_from: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_to" className="text-xs sm:text-sm">Data Final</Label>
            <Input
              id="date_to"
              type="date"
              className="h-9 sm:h-10 text-sm"
              value={filters.date_to || ""}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, date_to: e.target.value }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Commissions Table/Cards */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Lista de Comissões</CardTitle>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">
                Nenhuma comissão encontrada.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
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

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              {commissions.map((commission) => (
                <div
                  key={commission.id}
                  className="border rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      {commission.status === "pending" && (
                        <Checkbox
                          checked={selectedCommissions.includes(commission.id)}
                          onCheckedChange={(checked) =>
                            handleSelectCommission(commission.id, checked as boolean)
                          }
                          className="mt-1 flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {commission.service_name}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <User className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{commission.professional_name}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(commission.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Data</p>
                      <p className="font-medium">{formatDate(commission.date)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Valor Serviço</p>
                      <p className="font-medium">{formatCurrency(commission.service_price)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">% Comissão</p>
                      <p className="font-medium">{commission.commission_percentage}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Valor Comissão</p>
                      <p className="font-semibold text-primary">{formatCurrency(commission.commission_amount)}</p>
                    </div>
                  </div>

                  {commission.status === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(commission)}
                      className="w-full"
                    >
                      Cancelar Comissão
                    </Button>
                  )}
                </div>
              ))}
            </div>
            </>
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
