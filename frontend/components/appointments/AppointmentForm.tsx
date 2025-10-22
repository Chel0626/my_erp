/**
 * Formulário de Agendamento
 * Reutilizável para criar e editar agendamentos
 */
'use client';

import { useState, useEffect } from 'react';
import { Appointment, CreateAppointmentInput } from '@/hooks/useAppointments';
import { useServices } from '@/hooks/useServices';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/lib/api';
import { CustomerSelector } from './CustomerSelector';
import { QuickCreateCustomer } from './QuickCreateCustomer';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface AppointmentFormProps {
  appointment?: Appointment;
  initialDate?: Date | null;
  onSubmit: (data: CreateAppointmentInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AppointmentForm({ appointment, initialDate, onSubmit, onCancel, isLoading }: AppointmentFormProps) {
  const { data: services = [] } = useServices(true); // Apenas serviços ativos
  
  // Busca lista de usuários (profissionais)
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: userApi.list,
  });
  
  // Garante que users é array
  const users = Array.isArray(usersData) ? usersData : (usersData as { results?: unknown[] })?.results || [];
  
  const [formData, setFormData] = useState<CreateAppointmentInput>({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    service_id: '',
    professional_id: '',
    start_time: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Estados para controle de cliente
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  
  // Estado para preço (opcional, override do preço do serviço)
  const [customPrice, setCustomPrice] = useState<string>('');

  // Formata datetime para input datetime-local
  const formatDateTime = (date: Date | string) => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  // Preenche form se estiver editando OU se tiver data inicial
  useEffect(() => {
    if (appointment) {
      setFormData({
        customer_name: appointment.customer_name,
        customer_phone: appointment.customer_phone || '',
        customer_email: appointment.customer_email || '',
        service_id: appointment.service,
        professional_id: appointment.professional,
        start_time: formatDateTime(appointment.start_time),
        notes: appointment.notes || '',
      });
      
      // Se tiver customer_id, preenche
      if (appointment.customer_id) {
        setSelectedCustomerId(appointment.customer_id);
      }
      
      // Se tiver price customizado, preenche
      if (appointment.price) {
        setCustomPrice(appointment.price.toString());
      }
    } else if (initialDate) {
      // Se tiver data inicial (clicou no calendário), preenche apenas a data
      setFormData(prev => ({
        ...prev,
        start_time: formatDateTime(initialDate),
      }));
    }
  }, [appointment, initialDate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Valida se tem customer_id OU customer_name
    if (!selectedCustomerId && !formData.customer_name?.trim()) {
      newErrors.customer_name = 'Selecione ou digite o nome do cliente';
    }

    if (!formData.service_id) {
      newErrors.service_id = 'Selecione um serviço';
    }

    if (!formData.professional_id) {
      newErrors.professional_id = 'Selecione um profissional';
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

    // Prepara dados para envio
    const submitData: CreateAppointmentInput = {
      service_id: formData.service_id,
      professional_id: formData.professional_id,
      start_time: new Date(formData.start_time).toISOString(),
      notes: formData.notes,
    };
    
    // Se tiver customer_id selecionado, envia FK
    if (selectedCustomerId) {
      submitData.customer_id = selectedCustomerId;
    } else {
      // Caso contrário, envia dados manuais
      submitData.customer_name = formData.customer_name;
      submitData.customer_phone = formData.customer_phone;
      submitData.customer_email = formData.customer_email;
    }
    
    // Se tiver preço customizado, envia
    if (customPrice && parseFloat(customPrice) > 0) {
      submitData.price = parseFloat(customPrice);
    }

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
  
  // Handler quando cliente é selecionado
  const handleCustomerSelect = (customerId?: string, customerData?: { name: string; phone: string; email?: string }) => {
    console.log('🎯 handleCustomerSelect chamado:');
    console.log('  - customerId:', customerId);
    console.log('  - customerData:', customerData);
    
    setSelectedCustomerId(customerId || null);
    
    if (customerId && customerData) {
      console.log('✅ Preenchendo dados do cliente selecionado');
      // Preenche dados do cliente selecionado
      setFormData(prev => ({
        ...prev,
        customer_name: customerData.name,
        customer_phone: customerData.phone || '',
        customer_email: customerData.email || '',
      }));
    } else {
      console.log('🔄 Limpando dados do cliente');
      // Limpa dados se desselecionou
      setFormData(prev => ({
        ...prev,
        customer_name: '',
        customer_phone: '',
        customer_email: '',
      }));
    }
    
    // Limpa erro
    if (errors.customer_name) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.customer_name;
        return newErrors;
      });
    }
  };
  
  // Handler quando novo cliente é criado
  const handleQuickCreateSuccess = (newCustomerId: string) => {
    setSelectedCustomerId(newCustomerId);
    // O CustomerSelector vai buscar novamente e selecionar automaticamente
  };
  
  // Pré-preenche preço quando serviço é selecionado
  useEffect(() => {
    if (formData.service_id && !customPrice) {
      const selectedService = services.find(s => s.id === formData.service_id);
      if (selectedService) {
        setCustomPrice(selectedService.price);
      }
    }
  }, [formData.service_id, services, customPrice]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Seletor de Cliente */}
      <div className="space-y-2">
        <Label>
          Cliente <span className="text-red-500">*</span>
        </Label>
        <CustomerSelector
          value={selectedCustomerId || undefined}
          onChange={handleCustomerSelect}
          onCreateNew={() => setShowQuickCreate(true)}
        />
        {errors.customer_name && (
          <p className="text-sm text-red-500">{errors.customer_name}</p>
        )}
      </div>
      
      {/* Campos Manuais (apenas se não tiver cliente selecionado) */}
      {!selectedCustomerId && (
        <>
          <div className="space-y-2">
            <Label htmlFor="customer_name">Ou digite o nome</Label>
            <Input
              id="customer_name"
              value={formData.customer_name || ''}
              onChange={(e) => handleChange('customer_name', e.target.value)}
              placeholder="Ex: João Silva"
              className={errors.customer_name ? 'border-red-500' : ''}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_phone">Telefone</Label>
              <Input
                id="customer_phone"
                type="tel"
                value={formData.customer_phone || ''}
                onChange={(e) => handleChange('customer_phone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_email">Email</Label>
              <Input
                id="customer_email"
                type="email"
                value={formData.customer_email || ''}
                onChange={(e) => handleChange('customer_email', e.target.value)}
                placeholder="cliente@email.com"
              />
            </div>
          </div>
        </>
      )}

      {/* Serviço */}
      <div className="space-y-2">
        <Label htmlFor="service_id">
          Serviço <span className="text-red-500">*</span>
        </Label>
        <select
          id="service_id"
          value={formData.service_id}
          onChange={(e) => handleChange('service_id', e.target.value)}
          className={`flex h-10 w-full rounded-md border ${errors.service_id ? 'border-red-500' : 'border-input'} bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
        >
          <option value="">Selecione um serviço</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} - R$ {parseFloat(service.price).toFixed(2)} ({service.duration_minutes}min)
            </option>
          ))}
        </select>
        {errors.service_id && (
          <p className="text-sm text-red-500">{errors.service_id}</p>
        )}
      </div>
      
      {/* Preço (opcional - override do preço do serviço) */}
      <div className="space-y-2">
        <Label htmlFor="custom_price">
          Preço Cobrado
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">R$</span>
          <Input
            id="custom_price"
            type="number"
            step="0.01"
            min="0"
            value={customPrice}
            onChange={(e) => setCustomPrice(e.target.value)}
            placeholder="0,00"
            className="pl-10"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Deixe em branco para usar o preço padrão do serviço
        </p>
      </div>

      {/* Profissional */}
      <div className="space-y-2">
        <Label htmlFor="professional_id">
          Profissional <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.professional_id}
          onValueChange={(value) => handleChange('professional_id', value)}
        >
          <SelectTrigger className={errors.professional_id ? 'border-red-500' : ''}>
            <SelectValue placeholder="Selecione o profissional" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user: { id: string; name: string; is_staff?: boolean }) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name} {user.is_staff && '👑'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.professional_id && (
          <p className="text-sm text-red-500">{errors.professional_id}</p>
        )}
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
      
      {/* Dialog de Criação Rápida de Cliente */}
      <QuickCreateCustomer
        open={showQuickCreate}
        onOpenChange={setShowQuickCreate}
        onSuccess={handleQuickCreateSuccess}
      />
    </form>
  );
}
