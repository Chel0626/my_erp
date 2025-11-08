# Reorganização do Sentry no Painel Superadmin

## 📋 Resumo das Mudanças

Reorganização da exibição de métricas do Sentry no painel superadmin para melhor UX e separação de responsabilidades.

## 🎯 Objetivo

- **Dashboard**: Visão geral rápida com card resumido
- **Página Erros**: Análise detalhada e completa do Sentry

## 🔄 Mudanças Implementadas

### 1. Dashboard Superadmin (`/superadmin`)

#### ❌ Removido:
- Seção "Erros por Módulo (24h)" com barras de progresso
- Seção "Erros Recentes (Sentry)" com lista de 5 issues
- Imports não utilizados: `useRecentErrors`, `formatSentryDate`, `getSentryLevelColor`, `getSentryLevelBadgeVariant`
- Ícones não utilizados: `CheckCircle2`, `XCircle`, `ExternalLink`
- Função `getSeverityColor()`

#### ✅ Mantido/Melhorado:
```tsx
{/* Card Erros Críticos - Clicável */}
<Link href="/superadmin/errors" className="block">
  <Card className="hover:shadow-md transition-shadow hover:border-red-200 cursor-pointer">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 sm:pb-2">
      <CardTitle className="text-xs sm:text-sm font-medium">Erros Críticos</CardTitle>
      <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" />
    </CardHeader>
    <CardContent>
      <div className="text-xl sm:text-2xl font-bold text-red-600">
        {sentryLoading ? '...' : sentryTotalEvents}
      </div>
      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
        {sentryLoading ? 'Carregando...' : `${sentryIssues.length} issues ativas`}
      </p>
    </CardContent>
  </Card>
</Link>
```

**Benefícios**:
- Card clicável leva direto para `/superadmin/errors`
- Hover com borda vermelha indica interatividade
- Ícone `AlertTriangle` vermelho para destaque visual
- Métricas resumidas: total eventos + issues ativas

### 2. Página Erros do Sistema (`/superadmin/errors`)

#### ✅ Adicionado Seção Sentry:

**Header com Link Externo**:
```tsx
<div className="flex items-center justify-between">
  <h2 className="text-xl font-semibold flex items-center gap-2">
    <TrendingUp className="h-5 w-5" />
    Monitoramento em Tempo Real (Sentry)
  </h2>
  <a href={sentryMetrics.sentry_url} target="_blank" rel="noopener noreferrer">
    Ver no Sentry <ExternalLink className="h-4 w-4" />
  </a>
</div>
```

**Cards de Métricas (4 colunas)**:
1. **Eventos 24h**: `stats.total_events` + `issues.length` únicas
2. **Issues Ativas**: `sentryIssues.length` (últimas 24h)
3. **Não Resolvidas**: `filter(i => i.status !== 'resolved').length`
4. **Resolvidas**: `filter(i => i.status === 'resolved').length`

**Erros por Módulo**:
```tsx
{sentryMetrics.errors_by_module && Object.keys(...).length > 0 && (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Erros por Módulo</CardTitle>
    </CardHeader>
    <CardContent>
      {/* Barras de progresso com percentuais */}
      {Object.entries(sentryMetrics.errors_by_module)
        .sort((a, b) => b[1] - a[1])
        .map(([module, count]) => (
          <div key={module} className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline">{module}</Badge>
              <span>{count} erros</span>
              <span>{percentage}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-primary rounded-full h-2" style={{ width: `${percentage}%` }} />
            </div>
          </div>
        ))}
    </CardContent>
  </Card>
)}
```

**Erros Recentes do Sentry**:
```tsx
{sentryIssues.length > 0 && (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Erros Recentes do Sentry</CardTitle>
    </CardHeader>
    <CardContent>
      {sentryIssues.map((issue) => (
        <a key={issue.id} href={issue.permalink} target="_blank">
          {/* Badge com nível, contador, timestamp, link externo */}
        </a>
      ))}
    </CardContent>
  </Card>
)}
```

**Alerta de Não Configurado**:
```tsx
{sentryMetrics && !sentryMetrics.is_configured && (
  <Card className="border-yellow-600">
    <CardContent className="flex flex-col items-center justify-center py-8">
      <AlertTriangle className="h-10 w-10 text-yellow-600 mb-3" />
      <p className="font-medium mb-1">Sentry não configurado</p>
      <p className="text-sm text-muted-foreground text-center">
        Configure as variáveis de ambiente SENTRY_AUTH_TOKEN, SENTRY_ORG_SLUG e SENTRY_PROJECT_SLUG
      </p>
    </CardContent>
  </Card>
)}
```

**Separador Visual**:
```tsx
{/* System Errors Section */}
<div className="border-t pt-6">
  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
    <AlertTriangle className="h-5 w-5" />
    Erros do Sistema Interno
  </h2>
</div>
```

## 📊 Estrutura da Página Erros

```
┌─────────────────────────────────────────┐
│ Header: "Erros do Sistema"             │
│ Total: X erro(s) registrado(s)          │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ Stats Cards: Total | Críticos | Novos | │
│              Resolvidos                  │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 🔵 SENTRY INTEGRATION SECTION           │
├─────────────────────────────────────────┤
│ Header: "Monitoramento em Tempo Real"  │
│ Link: "Ver no Sentry" →                 │
├─────────────────────────────────────────┤
│ Sentry Stats (4 cards):                 │
│ • Eventos 24h                           │
│ • Issues Ativas                         │
│ • Não Resolvidas                        │
│ • Resolvidas                            │
├─────────────────────────────────────────┤
│ Erros por Módulo:                       │
│ [████████████░░░░] pos - 150 (60%)      │
│ [███████░░░░░░░░] inventory - 75 (30%)  │
│ [███░░░░░░░░░░░] other - 25 (10%)      │
├─────────────────────────────────────────┤
│ Erros Recentes do Sentry:               │
│ ⚠️ ERROR | TypeError: ...               │
│    50 ocorrências • há 2 horas →        │
│ ⚠️ WARNING | ValidationError: ...       │
│    15 ocorrências • há 5 horas →        │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 🟢 SYSTEM ERRORS SECTION (separador)    │
├─────────────────────────────────────────┤
│ Header: "Erros do Sistema Interno"     │
├─────────────────────────────────────────┤
│ [Lista de erros internos do Django]     │
│ • Expandible com stack trace            │
│ • Ações: Resolver | Ignorar             │
└─────────────────────────────────────────┘
```

## 🎨 UX Improvements

### Dashboard
- ✅ Menos poluído, foco em KPIs principais
- ✅ Card "Erros Críticos" destaca visualmente (vermelho)
- ✅ Clique direto leva para análise detalhada
- ✅ Hover com borda vermelha indica ação possível

### Página Erros
- ✅ Dados do Sentry **no topo** (prioridade)
- ✅ 4 métricas rápidas (Eventos, Ativas, Não Resolvidas, Resolvidas)
- ✅ Análise por módulo com gráficos visuais
- ✅ Links diretos para issues no Sentry (novo tab)
- ✅ Separador claro entre Sentry e Sistema Interno
- ✅ Alerta amigável se Sentry não configurado

## 🔍 Métricas Calculadas Localmente

Como a API Sentry retorna apenas `total_events`, algumas métricas são calculadas no frontend:

```typescript
// Issues únicas
sentryIssues.length

// Não resolvidas
sentryIssues.filter(i => i.status !== 'resolved').length

// Resolvidas
sentryIssues.filter(i => i.status === 'resolved').length

// Percentual por módulo
const total = Object.values(errors_by_module).reduce((a, b) => a + b, 0);
const percentage = Math.round((count / total) * 100);
```

## 📈 Fluxo do Usuário

1. **Dashboard** → Vê "42 Erros Críticos"
2. **Clica no card** → Navega para `/superadmin/errors`
3. **Página Erros**:
   - Vê métricas do Sentry no topo (tempo real)
   - Identifica módulos problemáticos (barras de progresso)
   - Clica em issue específica → Abre Sentry em novo tab
   - Rola para baixo → Vê erros internos do Django
   - Resolve/ignora erros conforme necessário

## 🚀 Deploy

- ✅ Commit: `3388cf54`
- ✅ Push: `main` branch
- ✅ Arquivos alterados: 2 (dashboard + errors page)
- ✅ TypeScript: Sem erros de compilação
- ✅ Build: Railway auto-deploy ativo

## 📝 Próximos Passos

- [ ] Adicionar filtros na página de erros (por módulo, nível, status)
- [ ] Implementar paginação se lista de erros ficar muito grande
- [ ] Cache de métricas do Sentry (evitar requisições repetidas)
- [ ] Gráfico de tendência (últimos 7 dias)

---

✅ **Status**: Implementado e em produção (commit 3388cf54)
