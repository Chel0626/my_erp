/**
 * Formulário de Agendamento
 * Reutilizável para criar e editar agendamentos
 */
'use client';

import { useState, useEffect } from 'react';
import { Appointment, CreateAppointmentInput } from '@/hooks/useAppointments';
import { useServices } from '@/hooks/useServices';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface AppointmentFormProps {
  appointment?: Appointment;
  onSubmit: (data: CreateAppointmentInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AppointmentForm({ appointment, onSubmit, onCancel, isLoading }: AppointmentFormProps) {
  const { data: services = [] } = useServices(true); // Apenas serviços ativos
  
  const [formData, setFormData] = useState<CreateAppointmentInput>({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    service: '',
    professional: '',
    start_time: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preenche form se estiver editando
  useEffect(() => {
    if (appointment) {
      // Formata datetime para input datetime-local
      const formatDateTime = (dateString: string) => {
        try {
          const date = new Date(dateString);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch {
          return '';
        }
      };

      setFormData({
        customer_name: appointment.customer_name,
        customer_phone: appointment.customer_phone || '',
        customer_email: appointment.customer_email || '',
        service: appointment.service,
        professional: appointment.professional,
        start_time: formatDateTime(appointment.start_time),
        notes: appointment.notes || '',
      });
    }
  }, [appointment]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Nome do cliente é obrigatório';
    }

    if (!formData.service) {
      newErrors.service = 'Selecione um serviço';
    }

    if (!formData.professional) {
      newErrors.professional = 'Selecione um profissional';
    }

    if (!formData.start_time) {
      newErrors.start_time = 'Data e hora são obrigatórias';
    } else {
      // Validar se não é no passado
      const selectedDate = new Date(formData.start_time);
      const now = new Date();
      if (selectedDate < now && !appointment) {
        newErrors.start_time = 'Não é possível agendar no passado';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Converte para formato ISO antes de enviar
    const submitData = {
      ...formData,
      start_time: new Date(formData.start_time).toISOString(),
    };

    onSubmit(submitData);
  };

  const handleChange = (field: keyof CreateAppointmentInput, value: string) => {
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
      {/* Nome do Cliente */}
      <div className="space-y-2">
        <Label htmlFor="customer_name">
          Nome do Cliente <span className="text-red-500">*</span>
        </Label>
        <Input
          id="customer_name"
          value={formData.customer_name}
          onChange={(e) => handleChange('customer_name', e.target.value)}
          placeholder="Ex: João Silva"
          className={errors.customer_name ? 'border-red-500' : ''}
        />
        {errors.customer_name && (
          <p className="text-sm text-red-500">{errors.customer_name}</p>
        )}
      </div>

      {/* Telefone e Email (lado a lado) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customer_phone">Telefone</Label>
          <Input
            id="customer_phone"
            type="tel"
            value={formData.customer_phone}
            onChange={(e) => handleChange('customer_phone', e.target.value)}
            placeholder="(11) 99999-9999"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer_email">Email</Label>
          <Input
            id="customer_email"
            type="email"
            value={formData.customer_email}
            onChange={(e) => handleChange('customer_email', e.target.value)}
            placeholder="cliente@email.com"
          />
        </div>
      </div>

      {/* Serviço */}
      <div className="space-y-2">
        <Label htmlFor="service">
          Serviço <span className="text-red-500">*</span>
        </Label>
        <select
          id="service"
          value={formData.service}
          onChange={(e) => handleChange('service', e.target.value)}
          className={`flex h-10 w-full rounded-md border ${errors.service ? 'border-red-500' : 'border-input'} bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
        >
          <option value="">Selecione um serviço</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} - R$ {parseFloat(service.price).toFixed(2)} ({service.duration_minutes}min)
            </option>
          ))}
        </select>
        {errors.service && (
          <p className="text-sm text-red-500">{errors.service}</p>
        )}
      </div>

      {/* Profissional (temporário - depois integraremos com API de users) */}
      <div className="space-y-2">
        <Label htmlFor="professional">
          Profissional <span className="text-red-500">*</span>
        </Label>
        <Input
          id="professional"
          value={formData.professional}
          onChange={(e) => handleChange('professional', e.target.value)}
          placeholder="ID do profissional (temporário)"
          className={errors.professional ? 'border-red-500' : ''}
        />
        {errors.professional && (
          <p className="text-sm text-red-500">{errors.professional}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Por enquanto, use o ID do usuário do profissional
        </p>
      </div>

      {/* Data e Hora */}
      <div className="space-y-2">
        <Label htmlFor="start_time">
          Data e Hora <span className="text-red-500">*</span>
        </Label>
        <Input
          id="start_time"
          type="datetime-local"
          value={formData.start_time}
          onChange={(e) => handleChange('start_time', e.target.value)}
          className={errors.start_time ? 'border-red-500' : ''}
        />
        {errors.start_time && (
          <p className="text-sm text-red-500">{errors.start_time}</p>
        )}
      </div>

      {/* Observações */}
      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Informações adicionais sobre o agendamento..."
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
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
              {appointment ? 'Salvando...' : 'Criando...'}
            </>
          ) : (
            <>{appointment ? 'Salvar Alterações' : 'Criar Agendamento'}</>
          )}
        </Button>
      </div>
    </form>
  );
}
