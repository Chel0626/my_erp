/**
 * Company Settings Page
 * Configurações da empresa (tenant) incluindo certificado digital
 */
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CertificateManager } from '@/components/tenant/certificate-manager';
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

      <Tabs defaultValue="certificate" className="space-y-6">
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
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>
                Dados cadastrais e contato da empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificate">
          <CertificateManager />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Preferências e personalizações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
