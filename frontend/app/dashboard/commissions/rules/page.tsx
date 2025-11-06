"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Settings } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  useCommissionRules,
  useCreateCommissionRule,
  useUpdateCommissionRule,
  useDeleteCommissionRule,
  type CommissionRule,
  type CreateCommissionRuleData,
} from "@/hooks/useCommissions";
import { useServices } from "@/hooks/useServices";

export default function CommissionRulesPage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CommissionRule | null>(null);
  const [deletingRule, setDeletingRule] = useState<CommissionRule | null>(null);
  const [formData, setFormData] = useState<CreateCommissionRuleData>({
    professional: null,
    service: null,
    commission_percentage: "30",
    is_active: true,
    priority: 0,
  });

  const { data: rules = [], isLoading } = useCommissionRules();
  const { data: services = [] } = useServices();
  const createMutation = useCreateCommissionRule();
  const updateMutation = useUpdateCommissionRule();
  const deleteMutation = useDeleteCommissionRule();

  const handleOpenDialog = (rule?: CommissionRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        professional: rule.professional,
        service: rule.service,
        commission_percentage: rule.commission_percentage,
        is_active: rule.is_active,
        priority: rule.priority,
      });
    } else {
      setEditingRule(null);
      setFormData({
        professional: null,
        service: null,
        commission_percentage: "30",
        is_active: true,
        priority: 0,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRule(null);
    setFormData({
      professional: null,
      service: null,
      commission_percentage: "30",
      is_active: true,
      priority: 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.commission_percentage || parseFloat(formData.commission_percentage) < 0 || parseFloat(formData.commission_percentage) > 100) {
      toast({
        title: "Erro de validação",
        description: "A porcentagem deve estar entre 0 e 100.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingRule) {
        await updateMutation.mutateAsync({
          id: editingRule.id,
          data: formData,
        });
        toast({
          title: "Regra atualizada!",
          description: "A regra de comissão foi atualizada com sucesso.",
        });
      } else {
        await createMutation.mutateAsync(formData);
        toast({
          title: "Regra criada!",
          description: "A nova regra de comissão foi criada com sucesso.",
        });
      }
      handleCloseDialog();
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      toast({
        title: "Erro ao salvar regra",
        description: axiosError.response?.data?.error || "Erro ao processar a solicitação.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingRule) return;

    try {
      await deleteMutation.mutateAsync(deletingRule.id);
      toast({
        title: "Regra excluída!",
        description: "A regra de comissão foi removida com sucesso.",
      });
      setDeleteDialogOpen(false);
      setDeletingRule(null);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      toast({
        title: "Erro ao excluir regra",
        description: axiosError.response?.data?.error || "Erro ao excluir.",
        variant: "destructive",
      });
    }
  };

  const getRuleDescription = (rule: CommissionRule) => {
    const parts: string[] = [];

    if (rule.professional_name) {
      parts.push(`Profissional: ${rule.professional_name}`);
    } else {
      parts.push("Todos os profissionais");
    }

    if (rule.service_name) {
      parts.push(`Serviço: ${rule.service_name}`);
    } else {
      parts.push("Todos os serviços");
    }

    return parts.join(" | ");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando regras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Regras de Comissão</h1>
          <p className="text-muted-foreground mt-2">
            Configure as porcentagens de comissão por profissional e serviço
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Regra
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Settings className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">Como funcionam as regras?</h3>
              <p className="text-sm text-blue-700 mt-1">
                As regras são aplicadas por prioridade (maior número = maior prioridade).
                Regras específicas (profissional + serviço) têm precedência sobre regras genéricas.
                Se nenhuma regra for encontrada, a comissão não será calculada.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Regras Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhuma regra cadastrada. Crie uma regra para começar.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <Badge variant="outline">{rule.priority}</Badge>
                      </TableCell>
                      <TableCell>{getRuleDescription(rule)}</TableCell>
                      <TableCell className="font-semibold">
                        {rule.commission_percentage}%
                      </TableCell>
                      <TableCell>
                        {rule.is_active ? (
                          <Badge variant="default">Ativa</Badge>
                        ) : (
                          <Badge variant="secondary">Inativa</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(rule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeletingRule(rule);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingRule ? "Editar Regra" : "Nova Regra de Comissão"}
              </DialogTitle>
              <DialogDescription>
                Configure a porcentagem de comissão e os critérios de aplicação.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="service">Serviço (opcional)</Label>
                <Select
                  value={formData.service !== null && formData.service !== undefined ? formData.service.toString() : "all"}
                  onValueChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      service: value === "all" ? null : parseInt(value),
                    }));
                  }}
                >
                  <SelectTrigger id="service">
                    <SelectValue placeholder="Todos os serviços" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os serviços</SelectItem>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="percentage">Porcentagem de Comissão (%)</Label>
                <Input
                  id="percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  required
                  value={formData.commission_percentage}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      commission_percentage: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Input
                  id="priority"
                  type="number"
                  min="0"
                  required
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      priority: parseInt(e.target.value) || 0,
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Maior número = maior prioridade
                </p>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Regra ativa</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_active: checked }))
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Salvando..."
                  : editingRule
                  ? "Atualizar"
                  : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A regra de comissão será
              permanentemente removida.
              {deletingRule && (
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <p className="text-sm font-medium text-gray-900">
                    {getRuleDescription(deletingRule)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Comissão: {deletingRule.commission_percentage}%
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
