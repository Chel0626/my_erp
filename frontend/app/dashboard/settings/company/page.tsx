/**
 * Company Settings Page
 * Configurações da empresa (tenant) incluindo certificado digital
 */
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CertificateManager } from '@/components/tenant/certificate-manager';
import { CompanyInfoForm } from '@/components/tenant/company-info-form';
import { CompanySettings } from '@/components/tenant/company-settings';
import { Building2, FileKey, Settings } from 'lucide-react';

export default function CompanySettingsPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Configurações da Empresa</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie as informações e certificados da sua empresa
        </p>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info" className="gap-2">
            <Building2 className="h-4 w-4" />
            Informações
          </TabsTrigger>
          <TabsTrigger value="certificate" className="gap-2">
            <FileKey className="h-4 w-4" />
            Certificado Digital
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <CompanyInfoForm />
        </TabsContent>

        <TabsContent value="certificate">
          <CertificateManager />
        </TabsContent>

        <TabsContent value="settings">
          <CompanySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
