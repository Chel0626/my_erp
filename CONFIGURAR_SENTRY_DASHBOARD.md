# 🔧 Configurar Sentry no Painel do Superusuário

## 📋 Pré-requisitos

1. Conta no Sentry (sentry.io)
2. Projeto criado no Sentry
3. Token de autenticação (Auth Token)

---

## 🔑 Passo 1: Criar Auth Token no Sentry

### 1.1 Acessar Configurações
1. Acesse https://sentry.io
2. Clique no seu avatar (canto superior direito)
3. **Settings** → **Developer Settings** → **Auth Tokens**

### 1.2 Criar Novo Token
1. Clique em **"Create New Token"**
2. **Nome:** `my-erp-superadmin`
3. **Scopes** (permissões):
   - ✅ `project:read`
   - ✅ `event:read`
   - ✅ `org:read`
4. Clique em **"Create Token"**
5. **📋 Copie o token** (só aparece uma vez!)

---

## ⚙️ Passo 2: Configurar Variáveis de Ambiente

### 2.1 Desenvolvimento Local

Edite `.env`:
```bash
# Sentry API Integration
SENTRY_AUTH_TOKEN=seu_token_aqui
SENTRY_ORG_SLUG=seu-organization-slug
SENTRY_PROJECT_SLUG=seu-project-slug
```

**Como encontrar os slugs:**
- URL do Sentry: `https://sentry.io/organizations/SEU-ORG-SLUG/issues/?project=123456`
- Organization Slug: `SEU-ORG-SLUG`
- Project Slug: Ver em Settings → Projects → Nome do projeto

### 2.2 Produção (Railway)

```bash
# Via CLI
railway variables set SENTRY_AUTH_TOKEN="seu_token_aqui"
railway variables set SENTRY_ORG_SLUG="seu-organization-slug"
railway variables set SENTRY_PROJECT_SLUG="seu-project-slug"

# Ou via Dashboard:
# 1. Acesse railway.app/dashboard
# 2. Selecione seu projeto → Backend
# 3. Variables → New Variable
```

---

## 🧪 Passo 3: Testar a Integração

### 3.1 Testar Localmente

```bash
cd backend
python manage.py shell
```

```python
from core.sentry_integration import sentry_client

# Testar conexão
summary = sentry_client.get_dashboard_summary()
print(summary)

# Deve retornar:
# {
#   'is_configured': True,
#   'stats': {...},
#   'recent_issues': [...],
#   'errors_by_module': {...}
# }
```

### 3.2 Testar via API

```bash
# Com usuário superadmin logado
curl -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:8000/api/superadmin/dashboard/sentry_metrics/
```

---

## 📊 Passo 4: Criar Widget no Frontend

Agora que o backend está pronto, vamos criar um widget no painel do superusuário.

### 4.1 Criar Hook para Buscar Métricas

**Arquivo:** `frontend/hooks/useSentryMetrics.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface SentryMetrics {
  is_configured: boolean;
  stats?: {
    total_events: number;
    period: string;
  };
  recent_issues?: Array<{
    id: string;
    title: string;
    count: number;
    userCount: number;
    lastSeen: string;
    level: string;
    status: string;
    permalink: string;
  }>;
  errors_by_module?: Record<string, number>;
  sentry_url?: string;
  message?: string;
}

export function useSentryMetrics() {
  return useQuery({
    queryKey: ['sentry-metrics'],
    queryFn: async () => {
      const { data } = await api.get<SentryMetrics>(
        '/superadmin/dashboard/sentry_metrics/'
      );
      return data;
    },
    refetchInterval: 60000, // Atualiza a cada 1 minuto
  });
}
```

### 4.2 Criar Componente SentryWidget

**Arquivo:** `frontend/components/superadmin/SentryWidget.tsx`

```typescript
'use client';

import { useSentryMetrics } from '@/hooks/useSentryMetrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, ExternalLink, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export function SentryWidget() {
  const { data, isLoading } = useSentryMetrics();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monitoramento de Erros</CardTitle>
        </CardHeader>
        <CardContent>Carregando...</CardContent>
      </Card>
    );
  }

  if (!data?.is_configured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monitoramento de Erros</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {data?.message || 'Sentry não configurado'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Card de Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Erros (24h)</span>
            <AlertCircle className="h-5 w-5 text-red-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {data.stats?.total_events || 0}
          </div>
          <p className="text-sm text-muted-foreground">
            eventos registrados
          </p>

          {/* Erros por módulo */}
          {data.errors_by_module && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium">Por módulo:</p>
              {Object.entries(data.errors_by_module).map(([module, count]) => (
                <div key={module} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{module}</span>
                  <Badge variant="destructive">{count}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card de Issues Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Issues Recentes</span>
            {data.sentry_url && (
              <Link href={data.sentry_url} target="_blank">
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.recent_issues?.slice(0, 5).map((issue) => (
              <div
                key={issue.id}
                className="flex items-start justify-between border-b pb-2 last:border-0"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium truncate">
                    {issue.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={
                        issue.level === 'error' ? 'destructive' : 'secondary'
                      }
                      className="text-xs"
                    >
                      {issue.level}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {issue.count}x
                    </span>
                    {issue.userCount > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {issue.userCount} usuários
                      </span>
                    )}
                  </div>
                </div>
                {issue.permalink && (
                  <Link href={issue.permalink} target="_blank">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>

          {data.recent_issues && data.recent_issues.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              ✅ Nenhum erro nas últimas 24h
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

### 4.3 Adicionar ao Dashboard do Superadmin

**Arquivo:** `frontend/app/superadmin/dashboard/page.tsx`

```typescript
import { SentryWidget } from '@/components/superadmin/SentryWidget';

export default function SuperAdminDashboard() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Painel do Superadmin</h1>
      
      {/* Outras métricas... */}
      
      {/* Widget do Sentry */}
      <SentryWidget />
    </div>
  );
}
```

---

## 🎯 Resultado Final

Você terá um dashboard com:

✅ **Total de erros nas últimas 24h**
✅ **Erros agrupados por módulo** (PDV, Inventário, etc)
✅ **5 issues mais recentes** com:
  - Título do erro
  - Severidade (error, warning)
  - Quantas vezes aconteceu
  - Quantos usuários foram afetados
  - Link direto para o Sentry

✅ **Atualização automática** a cada 1 minuto
✅ **Link para abrir no Sentry** para investigação detalhada

---

## 📊 Métricas Disponíveis

A API retorna:

```json
{
  "is_configured": true,
  "stats": {
    "total_events": 42,
    "period": "24h"
  },
  "recent_issues": [
    {
      "id": "12345",
      "title": "ProgrammingError: column updated_at does not exist",
      "count": 15,
      "userCount": 3,
      "lastSeen": "2025-11-07T22:10:00Z",
      "level": "error",
      "status": "unresolved",
      "permalink": "https://sentry.io/issues/12345"
    }
  ],
  "errors_by_module": {
    "pos": 20,
    "inventory": 15,
    "customers": 7
  },
  "sentry_url": "https://sentry.io/organizations/seu-org/issues/"
}
```

---

## 🔐 Segurança

- ✅ Apenas usuários com `role='superadmin'` têm acesso
- ✅ Token do Sentry fica no backend (não exposto ao frontend)
- ✅ Frontend só recebe dados agregados
- ✅ Links para Sentry exigem login separado

---

## 🚀 Próximos Passos

1. **Alertas em Tempo Real:**
   - Webhook do Sentry → seu backend
   - Notificações push no painel

2. **Gráficos de Tendência:**
   - Erros por hora/dia
   - Comparação com períodos anteriores

3. **Ações Rápidas:**
   - Resolver issue direto do painel
   - Atribuir issue a dev
   - Comentar na issue

---

## ❓ Troubleshooting

### Erro: "SENTRY_AUTH_TOKEN não configurado"
- Verifique se o token está nas variáveis de ambiente
- Reinicie o servidor após adicionar variáveis

### Erro: 401 Unauthorized
- Token inválido ou expirado
- Crie um novo token no Sentry

### Erro: 404 Not Found
- Organization slug ou project slug incorretos
- Verifique a URL do seu projeto no Sentry

### Dados não aparecem
- Verifique se o token tem permissões `project:read` e `event:read`
- Verifique se há erros reais no Sentry para exibir
