# Integração Sentry - Frontend Dashboard

## 📋 Resumo

Dashboard do superadmin agora integrado com o Sentry para monitoramento de erros em tempo real.

## ✅ Implementado

### 1. Hook personalizado (`useSentry.ts`)

**Localização:** `frontend/hooks/useSentry.ts`

**Funcionalidades:**
- ✅ `useSentryMetrics()` - Hook React Query com auto-refresh a cada 60 segundos
- ✅ `formatSentryDate()` - Formata timestamps em formato relativo (5m, 2h, 3d atrás)
- ✅ `getSentryLevelColor()` - Retorna cores baseadas na severidade
- ✅ `getSentryLevelBadgeVariant()` - Retorna variantes de badge por nível

**Tipos TypeScript:**
```typescript
interface SentryIssue {
  id: string;
  title: string;
  culprit: string;
  count: string;
  userCount: number;
  lastSeen: string;
  firstSeen: string;
  level: 'error' | 'warning' | 'info' | 'fatal';
  status: 'resolved' | 'unresolved' | 'ignored';
  permalink: string;
  metadata: {
    value: string;
    type: string;
    filename: string;
    function: string;
  };
}

interface SentryMetrics {
  is_configured: boolean;
  stats: SentryStats;
  recent_issues: SentryIssue[];
  errors_by_module: Record<string, number>;
  sentry_url: string;
}
```

### 2. Dashboard atualizado (`superadmin/page.tsx`)

**Card "Erros Críticos":**
- ✅ Mostra total de eventos nas últimas 24h do Sentry
- ✅ Contador de issues detectadas
- ✅ Loading state durante fetch

**Seção "Erros Recentes (Sentry)":**
- ✅ Lista top 5 issues com maior ocorrência
- ✅ Badge com nível de severidade (fatal, error, warning)
- ✅ Link direto para issue no Sentry (abre em nova aba)
- ✅ Informações exibidas:
  - Tipo de erro
  - Quantidade de ocorrências
  - Título da issue
  - Arquivo/função onde ocorreu
  - Timestamp relativo (ex: "5m atrás")
- ✅ Estados:
  - Loading: spinner
  - Não configurado: alerta para configurar variáveis
  - Sem erros: mensagem de sucesso com emoji 🎉
  - Com erros: lista clicável

**Nova Seção "Erros por Módulo (24h)":**
- ✅ Breakdown visual dos erros por módulo da API
- ✅ Barra de progresso mostrando porcentagem
- ✅ Ordenado por quantidade decrescente
- ✅ Mostra apenas quando há dados disponíveis

### 3. UI/UX Melhorias

**Design:**
- ✅ Cards clicáveis com hover effect
- ✅ Ícone `ExternalLink` indicando link externo
- ✅ Cores contextuais por severidade:
  - Fatal/Error: vermelho
  - Warning: amarelo
  - Info: azul
- ✅ Responsivo (mobile-first)
- ✅ Truncamento de textos longos com `line-clamp-2`

**Interatividade:**
- ✅ Auto-refresh a cada 60 segundos
- ✅ Mantém dados anteriores durante reload (placeholderData)
- ✅ Link direto para Sentry dashboard
- ✅ Cada issue clicável leva para página específica

## 🔧 Como funciona

### Fluxo de Dados

1. **Frontend** → Hook `useSentryMetrics()` chama API a cada 60s
2. **Backend** → Endpoint `/api/superadmin/dashboard/sentry_metrics/`
3. **Backend** → `sentry_client.get_dashboard_summary()` consulta Sentry API
4. **Sentry API** → Retorna issues, stats e contagem por módulo
5. **Frontend** → Renderiza dados no dashboard

### Auto-Refresh

```typescript
refetchInterval: 60000, // 60 segundos
placeholderData: (previousData) => previousData, // Mantém dados antigos
```

## 📊 Dados Exibidos

### Card "Erros Críticos"
- Total de eventos nas últimas 24h
- Quantidade de issues únicas

### Seção "Erros Recentes"
- Top 5 issues mais frequentes
- Para cada issue:
  - Severidade (badge)
  - Tipo de erro
  - Quantidade de ocorrências
  - Título descritivo
  - Local (arquivo/função)
  - Tempo desde última ocorrência

### Seção "Erros por Módulo"
- Distribuição de erros por módulo da API
- Porcentagem visual com barra de progresso
- Ordenação por quantidade

## 🎨 Estados da UI

### 1. Loading
```tsx
<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
```

### 2. Não Configurado
```tsx
<AlertTriangle className="text-yellow-600" />
<p>Sentry não configurado. Configure as variáveis de ambiente.</p>
```

### 3. Sem Erros
```tsx
<CheckCircle2 className="text-green-600" />
<p>Nenhum erro registrado nas últimas 24 horas! 🎉</p>
```

### 4. Com Erros
- Lista de cards clicáveis
- Cada card com ícone de severidade + detalhes + link externo

## 🔐 Permissões

- ✅ Apenas **superadmins** podem acessar
- ✅ Endpoint protegido no backend: `IsSuperAdmin` permission class
- ✅ Frontend protegido pela estrutura de rotas do Next.js

## 🌐 Links Externos

Todos os links do Sentry abrem em nova aba com `target="_blank"` e `rel="noopener noreferrer"` para segurança.

## 📱 Responsividade

- **Mobile:** Layout vertical, textos menores, cards compactos
- **Tablet:** Grid 2 colunas onde aplicável
- **Desktop:** Layout otimizado com grid 4 colunas nos stats

## 🚀 Próximos Passos

### Melhorias Futuras (Opcional)
- [ ] Gráfico de linha com histórico de erros (24h)
- [ ] Filtros por severidade e módulo
- [ ] Notificações push quando erro crítico ocorre
- [ ] Dashboard detalhado em `/superadmin/errors` com paginação
- [ ] Exportar relatório de erros (CSV/PDF)
- [ ] Integração com webhooks do Sentry para alertas em tempo real

## 🧪 Teste Local

1. Certifique-se que o backend está configurado:
   ```bash
   # Backend .env deve ter:
   SENTRY_AUTH_TOKEN=sntryu_...
   SENTRY_ORG_SLUG=vrbtech
   SENTRY_PROJECT_SLUG=python-django
   ```

2. Inicie o backend:
   ```bash
   cd backend
   python manage.py runserver
   ```

3. Inicie o frontend:
   ```bash
   cd frontend
   npm run dev
   ```

4. Acesse como superadmin:
   ```
   http://localhost:3000/superadmin
   ```

5. Verifique:
   - ✅ Card "Erros Críticos" mostra números do Sentry
   - ✅ Seção "Erros Recentes" lista issues reais
   - ✅ Seção "Erros por Módulo" mostra distribuição
   - ✅ Clique em qualquer issue abre Sentry em nova aba
   - ✅ Auto-refresh funciona (aguarde 60s)

## 📸 Preview da Interface

### Card Erros Críticos
```
┌─────────────────────────────┐
│ Erros Críticos         [!]  │
│                             │
│ 2                           │
│ 10 issues no Sentry         │
└─────────────────────────────┘
```

### Seção Erros Recentes
```
┌──────────────────────────────────────────────┐
│ Erros Recentes (Sentry)  Ver no Sentry ↗    │
│                                              │
│ ┌───────────────────────────────────────┐   │
│ │ [!] ERROR  • OperationalError         │   │
│ │     99 ocorrências                    │   │
│ │                                       │   │
│ │     connection to server failed       │   │
│ │     __main__ in main • 2h atrás    ↗  │   │
│ └───────────────────────────────────────┘   │
│                                              │
│ ┌───────────────────────────────────────┐   │
│ │ [!] ERROR  • FieldError               │   │
│ │     28 ocorrências                    │   │
│ │                                       │   │
│ │     Cannot resolve keyword...         │   │
│ │     inventory/views.py • 5h atrás  ↗  │   │
│ └───────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

### Seção Erros por Módulo
```
┌──────────────────────────────────────────────┐
│ Erros por Módulo (24h)                       │
│                                              │
│ [other] 209 erros                      100%  │
│ ██████████████████████████████████████       │
│                                              │
│ [pos] 15 erros                          7%   │
│ ████                                         │
└──────────────────────────────────────────────┘
```

## 🔍 Debug

### Verificar se Sentry está configurado:
```bash
cd backend
python -c "from core.sentry_integration import sentry_client; print(sentry_client.get_dashboard_summary())"
```

### Verificar endpoint da API:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/superadmin/dashboard/sentry_metrics/
```

## ✨ Conclusão

Dashboard agora exibe erros reais do Sentry com:
- ✅ Auto-refresh a cada 60 segundos
- ✅ Links diretos para issues
- ✅ Breakdown visual por módulo
- ✅ UI responsiva e intuitiva
- ✅ Estados claros (loading, vazio, erro, sucesso)
- ✅ Integração completa backend ↔ frontend

**Status:** ✅ Pronto para produção
