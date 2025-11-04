'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateGoal } from '@/hooks/useGoals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import type { GoalCreateData, GoalType, TargetType, GoalPeriod } from '@/types/goals';
import {
  GOAL_TYPE_OPTIONS,
  TARGET_TYPE_OPTIONS,
  PERIOD_OPTIONS,
} from '@/types/goals';

export default function NewGoalPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createGoal = useCreateGoal();

  const [formData, setFormData] = useState<Partial<GoalCreateData>>({
    type: 'individual',
    period: 'monthly',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação
    if (!formData.name || !formData.target_type || !formData.target_value ||
        !formData.start_date || !formData.end_date) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createGoal.mutateAsync(formData as GoalCreateData);
      toast({
        title: 'Sucesso!',
        description: 'Meta criada com sucesso',
      });
      router.push('/dashboard/goals');
    } catch (error: any) {
      toast({
        title: 'Erro ao criar meta',
        description: error.response?.data?.detail || 'Tente novamente',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/goals">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nova Meta</h1>
          <p className="text-muted-foreground">
            Crie uma nova meta individual ou de equipe
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações da Meta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nome da Meta <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ex: Aumentar vendas em 20%"
                value={formData.name || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva os detalhes da meta..."
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
              />
            </div>

            {/* Tipo e Período */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">
                  Tipo <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, type: value as GoalType }))
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="period">
                  Período <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.period}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, period: value as GoalPeriod }))
                  }
                >
                  <SelectTrigger id="period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIOD_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tipo de Meta e Valor Alvo */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="target_type">
                  Tipo de Meta <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.target_type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, target_type: value as TargetType }))
                  }
                >
                  <SelectTrigger id="target_type">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGET_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_value">
                  Valor Alvo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="target_value"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.target_value || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      target_value: parseFloat(e.target.value),
                    }))
                  }
                  required
                />
              </div>
            </div>

            {/* Datas */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_date">
                  Data Início <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, start_date: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">
                  Data Fim <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, end_date: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={createGoal.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {createGoal.isPending ? 'Salvando...' : 'Criar Meta'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/goals">Cancelar</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
