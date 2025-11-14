/**
 * Digital Certificate Manager Component
 * Gerenciamento de certificado digital A1 para NF-e
 */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileCheck, 
  FileX, 
  Trash2, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface CertificateInfo {
  cn: string;
  issuer: string;
  serial_number: string;
  not_valid_before: string;
  not_valid_after: string;
  days_until_expiry: number;
  is_valid: boolean;
  error?: string;
}

export function CertificateManager() {
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [certificateInfo, setCertificateInfo] = useState<CertificateInfo | null>(null);

  // Carrega informações do certificado ao montar
  useEffect(() => {
    loadCertificateInfo();
  }, []);

  const loadCertificateInfo = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/core/tenants/certificate/info/');
      setCertificateInfo(response.data);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Erro ao carregar certificado:', error);
      }
      setCertificateInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.pfx')) {
        toast.error('Por favor, selecione um arquivo .pfx');
        return;
      }
      setCertificateFile(file);
    }
  };

  const handleUpload = async () => {
    if (!certificateFile || !password) {
      toast.error('Selecione um arquivo e informe a senha');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('certificate_file', certificateFile);
      formData.append('password', password);

      const response = await api.post('/core/tenants/certificate/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Certificado instalado com sucesso!');
      setCertificateInfo(response.data.certificate);
      setCertificateFile(null);
      setPassword('');
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error(error.response?.data?.error || 'Erro ao instalar certificado');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Tem certeza que deseja remover o certificado digital?')) {
      return;
    }

    try {
      await api.delete('/core/tenants/certificate/remove/');
      toast.success('Certificado removido com sucesso');
      setCertificateInfo(null);
    } catch (error: any) {
      console.error('Erro ao remover certificado:', error);
      toast.error('Erro ao remover certificado');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = () => {
    if (!certificateInfo?.is_valid) {
      return <Badge variant="destructive" className="gap-1"><FileX className="h-3 w-3" /> Inválido</Badge>;
    }
    
    if (certificateInfo.days_until_expiry < 30) {
      return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" /> Expira em breve</Badge>;
    }
    
    if (certificateInfo.days_until_expiry < 90) {
      return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Atenção</Badge>;
    }
    
    return <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Válido</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Certificado Digital</CardTitle>
          <CardDescription>Gerenciamento de certificado A1 para emissão de NF-e</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Certificado Digital</CardTitle>
        <CardDescription>Gerenciamento de certificado A1 para emissão de NF-e</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {certificateInfo ? (
          <>
            {/* Informações do Certificado Instalado */}
            <Alert className={certificateInfo.is_valid ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
              <FileCheck className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Certificado Instalado</span>
                    {getStatusBadge()}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">CN:</span>
                      <span className="ml-2 font-mono">{certificateInfo.cn}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Serial:</span>
                      <span className="ml-2 font-mono">{certificateInfo.serial_number}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Válido de:</span>
                      <span className="ml-2">{formatDate(certificateInfo.not_valid_before)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Válido até:</span>
                      <span className="ml-2">{formatDate(certificateInfo.not_valid_after)}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Emissor:</span>
                      <span className="ml-2 text-xs">{certificateInfo.issuer}</span>
                    </div>
                  </div>

                  {certificateInfo.days_until_expiry < 90 && (
                    <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm">
                      <AlertCircle className="inline h-4 w-4 mr-1" />
                      Certificado expira em <strong>{certificateInfo.days_until_expiry} dias</strong>. 
                      Providencie a renovação com antecedência.
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            <Button
              variant="destructive"
              onClick={handleRemove}
              className="w-full"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remover Certificado
            </Button>
          </>
        ) : (
          <>
            {/* Upload de Novo Certificado */}
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Nenhum certificado digital instalado. Faça o upload de um certificado A1 (.pfx) 
                  para habilitar a emissão de NF-e.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="certificate">Arquivo do Certificado (.pfx)</Label>
                <Input
                  id="certificate"
                  type="file"
                  accept=".pfx"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                {certificateFile && (
                  <p className="text-sm text-muted-foreground">
                    Arquivo selecionado: {certificateFile.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha do Certificado</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite a senha do certificado"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isUploading}
                />
                <p className="text-xs text-muted-foreground">
                  A senha será armazenada de forma criptografada
                </p>
              </div>

              <Button
                onClick={handleUpload}
                disabled={!certificateFile || !password || isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Instalando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Instalar Certificado
                  </>
                )}
              </Button>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-900">
                <strong>Requisitos:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Certificado digital A1 em formato .pfx</li>
                  <li>Senha do certificado</li>
                  <li>Validade mínima de 30 dias</li>
                  <li>Certificado emitido por autoridade certificadora credenciada</li>
                </ul>
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
    </Card>
  );
}
