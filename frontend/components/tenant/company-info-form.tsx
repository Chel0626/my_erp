/**
 * Company Info Form Component
 * Formulário para editar informações da empresa (tenant)
 */
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Save, Upload, Building2, MapPin, Phone, Mail } from 'lucide-react';
import { api } from '@/lib/api';

interface TenantData {
  id: number;
  name: string;
  business_name?: string;
  cnpj?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  mobile_phone?: string;
  email?: string;
  website?: string;
  logo?: string;
}

export function CompanyInfoForm() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [formData, setFormData] = useState<Partial<TenantData>>({});

  useEffect(() => {
    loadTenantData();
  }, []);

  const loadTenantData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/core/tenant/');
      setTenant(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('Erro ao carregar dados do tenant:', error);
      toast.error('Erro ao carregar informações da empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const response = await api.patch('/core/tenant/', formData);

      setTenant(response.data);
      setFormData(response.data);
      toast.success('Informações atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar tenant:', error);
      toast.error('Erro ao atualizar informações');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Valida tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    // Valida tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/core/tenant/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Erro ao fazer upload do logo');

      const data = await response.json();
      setTenant(data);
      setFormData(data);
      toast.success('Logo atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload do logo:', error);
      toast.error('Erro ao fazer upload do logo');
    } finally {
      setUploading(false);
    }
  };

  if (loading && !tenant) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações da Empresa</CardTitle>
        <CardDescription>
          Atualize os dados cadastrais da sua empresa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Logo */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {formData.logo && (
                <img
                  src={formData.logo}
                  alt="Logo da empresa"
                  className="h-24 w-24 object-contain rounded-lg border"
                />
              )}
              <div className="flex-1">
                <Label htmlFor="logo">Logo da Empresa</Label>
                <div className="mt-2">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                    className="cursor-pointer"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  PNG, JPG ou GIF até 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Dados Básicos */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Building2 className="h-4 w-4" />
              <span>Dados Básicos</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Fantasia *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Nome da sua empresa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_name">Razão Social</Label>
                <Input
                  id="business_name"
                  value={formData.business_name || ''}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  placeholder="Razão social completa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj || ''}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4" />
              <span>Endereço</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="street">Rua/Avenida</Label>
                <Input
                  id="street"
                  value={formData.street || ''}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="Nome da rua"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  value={formData.number || ''}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="Nº"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  value={formData.complement || ''}
                  onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                  placeholder="Sala, andar, etc"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  value={formData.neighborhood || ''}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  placeholder="Nome do bairro"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postal_code">CEP</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code || ''}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  placeholder="00000-000"
                  maxLength={9}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Nome da cidade"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={formData.state || ''}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="UF"
                  maxLength={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  value={formData.country || 'Brasil'}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="País"
                />
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Phone className="h-4 w-4" />
              <span>Contato</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone Fixo</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(00) 0000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile_phone">Celular</Label>
                <Input
                  id="mobile_phone"
                  type="tel"
                  value={formData.mobile_phone || ''}
                  onChange={(e) => setFormData({ ...formData, mobile_phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="h-4 w-4 inline mr-1" />
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contato@empresa.com.br"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://www.empresa.com.br"
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={loadTenantData}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
