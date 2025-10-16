/**
 * Formulário de Cliente
 * Criação e edição de clientes com validação
 */
'use client';

import { useForm } from 'react-hook-form';
import { Customer } from '@/hooks/useCustomers';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: Partial<Customer>) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

// Validação de CPF (formato básico)
function validateCPF(cpf: string): boolean {
  if (!cpf) return true; // CPF é opcional
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.length === 11 || /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf);
}

// Formata CPF
function formatCPF(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 11) {
    return cleaned
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return value;
}

// Formata telefone
function formatPhone(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 11) {
    return cleaned
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4,5})(\d{4})$/, '$1-$2');
  }
  return value;
}

// Formata CEP
function formatCEP(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  return cleaned.replace(/(\d{5})(\d{3})$/, '$1-$2');
}

export function CustomerForm({
  customer,
  onSubmit,
  onCancel,
  isLoading,
}: CustomerFormProps) {
  const form = useForm<Partial<Customer>>({
    defaultValues: customer || {
      name: '',
      cpf: '',
      email: '',
      phone: '',
      phone_secondary: '',
      birth_date: '',
      gender: 'M',
      address_street: '',
      address_number: '',
      address_complement: '',
      address_neighborhood: '',
      address_city: '',
      address_state: '',
      address_zipcode: '',
      preferences: '',
      notes: '',
      tag: 'NOVO',
      is_active: true,
    },
  });

  const handleSubmit = (data: Partial<Customer>) => {
    // Remove formatação antes de enviar
    if (data.cpf) {
      data.cpf = data.cpf.replace(/\D/g, '');
    }
    if (data.phone) {
      data.phone = data.phone.replace(/\D/g, '');
    }
    if (data.phone_secondary) {
      data.phone_secondary = data.phone_secondary.replace(/\D/g, '');
    }
    if (data.address_zipcode) {
      data.address_zipcode = data.address_zipcode.replace(/\D/g, '');
    }
    
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Informações Pessoais */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Informações Pessoais</h3>
            <p className="text-sm text-muted-foreground">
              Dados básicos do cliente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: 'Nome é obrigatório' }}
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Nome Completo *</FormLabel>
                  <FormControl>
                    <Input placeholder="João da Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cpf"
              rules={{
                validate: (value) =>
                  !value || validateCPF(value) || 'CPF inválido',
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="000.000.000-00"
                      {...field}
                      onChange={(e) => {
                        field.onChange(formatCPF(e.target.value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birth_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Nascimento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gênero</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Feminino</SelectItem>
                      <SelectItem value="O">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              rules={{
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido',
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="joao@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              rules={{ required: 'Telefone é obrigatório' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone Principal *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="(11) 98765-4321"
                      {...field}
                      onChange={(e) => {
                        field.onChange(formatPhone(e.target.value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone_secondary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone Secundário</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="(11) 3456-7890"
                      {...field}
                      onChange={(e) => {
                        field.onChange(formatPhone(e.target.value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Endereço */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Endereço</h3>
            <p className="text-sm text-muted-foreground">
              Endereço completo do cliente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="address_zipcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="00000-000"
                      {...field}
                      onChange={(e) => {
                        field.onChange(formatCEP(e.target.value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address_street"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Rua</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua das Flores" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número</FormLabel>
                  <FormControl>
                    <Input placeholder="123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address_complement"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Complemento</FormLabel>
                  <FormControl>
                    <Input placeholder="Apto 302" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address_neighborhood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bairro</FormLabel>
                  <FormControl>
                    <Input placeholder="Centro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address_city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input placeholder="São Paulo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address_state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AC">AC</SelectItem>
                      <SelectItem value="AL">AL</SelectItem>
                      <SelectItem value="AP">AP</SelectItem>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="BA">BA</SelectItem>
                      <SelectItem value="CE">CE</SelectItem>
                      <SelectItem value="DF">DF</SelectItem>
                      <SelectItem value="ES">ES</SelectItem>
                      <SelectItem value="GO">GO</SelectItem>
                      <SelectItem value="MA">MA</SelectItem>
                      <SelectItem value="MT">MT</SelectItem>
                      <SelectItem value="MS">MS</SelectItem>
                      <SelectItem value="MG">MG</SelectItem>
                      <SelectItem value="PA">PA</SelectItem>
                      <SelectItem value="PB">PB</SelectItem>
                      <SelectItem value="PR">PR</SelectItem>
                      <SelectItem value="PE">PE</SelectItem>
                      <SelectItem value="PI">PI</SelectItem>
                      <SelectItem value="RJ">RJ</SelectItem>
                      <SelectItem value="RN">RN</SelectItem>
                      <SelectItem value="RS">RS</SelectItem>
                      <SelectItem value="RO">RO</SelectItem>
                      <SelectItem value="RR">RR</SelectItem>
                      <SelectItem value="SC">SC</SelectItem>
                      <SelectItem value="SP">SP</SelectItem>
                      <SelectItem value="SE">SE</SelectItem>
                      <SelectItem value="TO">TO</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Preferências */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Preferências e Categorização</h3>
            <p className="text-sm text-muted-foreground">
              Informações adicionais e preferências do cliente
            </p>
          </div>

          <FormField
            control={form.control}
            name="tag"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="VIP">⭐ VIP</SelectItem>
                    <SelectItem value="REGULAR">👤 Regular</SelectItem>
                    <SelectItem value="NOVO">✨ Novo</SelectItem>
                    <SelectItem value="INATIVO">💤 Inativo</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Classifique o cliente para melhor segmentação
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferences"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferências</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ex: Prefere corte degradê, alérgico a produtos com amônia..."
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Serviços preferidos, alergias, observações sobre estilo
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observações gerais sobre o cliente..."
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Cliente Ativo</FormLabel>
                  <FormDescription>
                    Desative para clientes que não frequentam mais o estabelecimento
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : customer ? 'Atualizar' : 'Criar Cliente'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
