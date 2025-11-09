/**
 * Formulário de Serviço
 * Reutilizável para criar e editar serviços
 */
'use client';

import { useState, useEffect } from 'react';
import { Service, CreateServiceInput } from '@/hooks/useServices';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ServiceFormProps {
  service?: Service; // Se fornecido, modo edição
  onSubmit: (data: CreateServiceInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ServiceForm({ service, onSubmit, onCancel, isLoading }: ServiceFormProps) {
  const [formData, setFormData] = useState<CreateServiceInput>({
    name: '',
    description: '',
    price: '',
    duration_minutes: 30,
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preenche form se estiver editando
  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description,
        price: service.price,
        duration_minutes: service.duration_minutes,
        is_active: service.is_active,
      });
    }
  }, [service]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Preço deve ser maior que zero';
    }

    if (!formData.duration_minutes || formData.duration_minutes <= 0) {
      newErrors.duration_minutes = 'Duração deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (field: keyof CreateServiceInput, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpa erro do campo ao digitar
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nome */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Nome do Serviço <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Ex: Corte Masculino"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Ex: Corte tradicional masculino com máquina e tesoura"
        />
      </div>

      {/* Preço e Duração (lado a lado) */}
      <div className="grid grid-cols-2 gap-4">
        {/* Preço */}
        <div className="space-y-2">
          <Label htmlFor="price">
            Preço <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              R$
            </span>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              placeholder="35,00"
              className={`pl-10 ${errors.price ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.price && (
            <p className="text-sm text-red-500">{errors.price}</p>
          )}
        </div>

        {/* Duração */}
        <div className="space-y-2">
          <Label htmlFor="duration">
            Duração (min) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="duration"
            type="number"
            min="5"
            step="5"
            value={formData.duration_minutes}
            onChange={(e) => handleChange('duration_minutes', parseInt(e.target.value))}
            placeholder="30"
            className={errors.duration_minutes ? 'border-red-500' : ''}
          />
          {errors.duration_minutes && (
            <p className="text-sm text-red-500">{errors.duration_minutes}</p>
          )}
        </div>
      </div>

      {/* Status Ativo */}
      <div className="flex items-center space-x-2">
        <input
          id="is_active"
          type="checkbox"
          checked={formData.is_active}
          onChange={(e) => handleChange('is_active', e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="is_active" className="cursor-pointer">
          Serviço ativo (disponível para agendamentos)
        </Label>
      </div>

      {/* Botões */}
      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Cancelar
        </Button>
        
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {service ? 'Salvando...' : 'Criando...'}
            </>
          ) : (
            <>{service ? 'Salvar Alterações' : 'Criar Serviço'}</>
          )}
        </Button>
      </div>
    </form>
  );
}
