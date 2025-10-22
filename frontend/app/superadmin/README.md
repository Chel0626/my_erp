# 🎯 Painel Super Admin - Frontend

Interface completa de administração para gestão multi-tenant do sistema ERP.

## 📁 Estrutura

```
frontend/
├── app/superadmin/
│   ├── layout.tsx          # Layout com sidebar e proteção de rota
│   ├── page.tsx            # Dashboard principal
│   ├── tenants/
│   │   └── page.tsx        # Gestão de tenants
│   ├── subscriptions/
│   │   └── page.tsx        # Gestão de assinaturas
│   ├── payments/
│   │   └── page.tsx        # Histórico de pagamentos
│   ├── errors/
│   │   └── page.tsx        # Monitoramento de erros
│   └── usage/
│       └── page.tsx        # Estatísticas de uso
├── hooks/
│   └── useSuperAdmin.ts    # Hooks React Query para API
└── types/
    └── index.ts            # Types TypeScript (User com role superadmin)
```

## 🚀 Funcionalidades

### 1. Dashboard Principal (`/superadmin`)

**Métricas em Tempo Real:**
- Total de tenants (ativos, trial, suspensos)
- Receita do mês e do ano
- Pagamentos pendentes e em atraso
- Erros críticos não resolvidos
- Total de usuários na plataforma
- Agendamentos do mês

**Visualizações:**
- Receita por plano (Free, Básico, Profissional, Enterprise)
- Erros recentes com severidade
- Ações rápidas para outras páginas

### 2. Gestão de Tenants (`/superadmin/tenants`)

**Ações Disponíveis:**
- Visualizar todos os tenants cadastrados
- Suspender tenant (bloqueia acesso)
- Ativar tenant (restaura acesso)
- Visualizar número de usuários por tenant
- Ver plano e status da assinatura

**Informações Exibidas:**
- Nome da empresa
- ID único
- Plano contratado
- Status (Ativa/Trial/Suspensa/Expirada)
- Número de usuários
- Data de criação

### 3. Assinaturas (`/superadmin/subscriptions`)

**Funcionalidades:**
- Visualizar todas as assinaturas
- Ver detalhes de cada plano
- Suspender/ativar assinaturas
- Alertas para assinaturas próximas do vencimento
- Upgrade de planos (preparado para integração)

**Informações Detalhadas:**
- Valor mensal
- Máximo de usuários permitidos
- Máximo de agendamentos/mês
- Status de pagamento (Pago/Pendente/Atrasado)
- Datas importantes (início, trial, próxima cobrança)
- Recursos incluídos no plano
- Dias até expiração

### 4. Pagamentos (`/superadmin/payments`)

**Recursos:**
- Histórico completo de transações
- Filtros por status
- Confirmar pagamentos manualmente
- Resumo financeiro (Total, Recebido, Pendente, Não Recebido)

**Detalhes por Pagamento:**
- Tenant
- Valor
- Método (Cartão, PIX, Boleto, Transferência)
- Status (Pago, Pendente, Processando, Falhou, Reembolsado)
- Mês de referência
- Data de pagamento
- ID da transação
- Notas

### 5. Erros do Sistema (`/superadmin/errors`)

**Monitoramento:**
- Visualizar todos os erros registrados
- Filtrar por severidade (Crítico, Alto, Médio, Baixo)
- Filtrar por status (Novo, Investigando, Resolvido, Ignorado)
- Estatísticas resumidas

**Ações:**
- Marcar erro como resolvido (com notas)
- Ignorar erro
- Ver stack trace completo
- Informações de contexto:
  - Tenant afetado
  - Endpoint que gerou o erro
  - Número de ocorrências
  - IP e User Agent
  - Usuário que encontrou o erro
  - Primeira e última ocorrência

### 6. Estatísticas de Uso (`/superadmin/usage`)

**Métricas por Tenant:**
- Total de usuários / Usuários ativos
- Total de agendamentos / Concluídos
- Receita gerada
- Total de clientes / Novos clientes
- Chamadas API
- Armazenamento usado (MB)

**Visualizações:**
- Dados do mês atual
- Histórico mensal
- Comparação entre tenants

## 🔐 Segurança

### Proteção de Rota

O layout verifica automaticamente:
```typescript
if (!user || user.role !== 'superadmin') {
  // Redireciona para login ou dashboard normal
}
```

### Permissões no Backend

Todos os endpoints `/api/superadmin/*` exigem:
- Usuário autenticado
- Role = 'superadmin'

## 🎨 Interface

### Tecnologias
- **Next.js 15** (App Router)
- **TailwindCSS** (Estilização)
- **shadcn/ui** (Componentes)
- **Lucide Icons** (Ícones)
- **React Query** (Gerenciamento de estado)

### Tema
- Suporte a modo claro e escuro
- Design responsivo (mobile-friendly)
- Sidebar fixa com navegação
- Cards informativos com ícones
- Badges coloridos por status

## 📊 Hooks Disponíveis

### Dashboard
```typescript
useDashboardStats()      // Métricas gerais
useRevenueByPlan()       // Receita por plano
useRecentErrors()        // Erros recentes
```

### Tenants
```typescript
useTenants()             // Listar todos
useTenant(id)            // Detalhes de um
useSuspendTenant()       // Suspender (mutation)
useActivateTenant()      // Ativar (mutation)
```

### Assinaturas
```typescript
useSubscriptions()       // Listar todas
useSubscription(id)      // Detalhes de uma
useSuspendSubscription() // Suspender
useActivateSubscription() // Ativar
useUpgradeSubscription() // Fazer upgrade
```

### Pagamentos
```typescript
usePayments()            // Listar todos
useMarkPaymentPaid()     // Confirmar pagamento
```

### Erros
```typescript
useSystemErrors()        // Listar todos
useCriticalErrors()      // Apenas críticos
useResolveError()        // Resolver erro
useIgnoreError()         // Ignorar erro
```

### Estatísticas
```typescript
useUsageStats()          // Estatísticas de uso
```

## 🚀 Como Usar

### 1. Login como Super Admin

```
Email: superadmin@erp.com
Senha: admin123
```

### 2. Acessar Painel

Após login, acesse: `http://localhost:3001/superadmin`

### 3. Navegar pelas Páginas

Use a sidebar para navegar entre:
- Dashboard
- Tenants
- Assinaturas
- Pagamentos
- Erros do Sistema
- Estatísticas

## 🔄 Integração com Backend

Todos os hooks consomem a API Django:

```
GET    /api/superadmin/dashboard/stats/
GET    /api/superadmin/dashboard/revenue_by_plan/
GET    /api/superadmin/dashboard/recent_errors/

GET    /api/superadmin/tenants/
GET    /api/superadmin/tenants/{id}/
POST   /api/superadmin/tenants/{id}/suspend/
POST   /api/superadmin/tenants/{id}/activate/

GET    /api/superadmin/subscriptions/
GET    /api/superadmin/subscriptions/{id}/
POST   /api/superadmin/subscriptions/{id}/suspend/
POST   /api/superadmin/subscriptions/{id}/activate/
POST   /api/superadmin/subscriptions/{id}/upgrade/

GET    /api/superadmin/payments/
POST   /api/superadmin/payments/{id}/mark_paid/

GET    /api/superadmin/errors/
GET    /api/superadmin/errors/critical/
POST   /api/superadmin/errors/{id}/resolve/
POST   /api/superadmin/errors/{id}/ignore/

GET    /api/superadmin/usage/
GET    /api/superadmin/usage/summary/
```

## 🎯 Próximos Passos

### Integração de Pagamento
1. Adicionar botão "Criar Checkout" nas assinaturas
2. Integrar com Stripe/Mercado Pago
3. Processar webhooks automaticamente

### Notificações
1. Email quando assinatura expira
2. Email de boas-vindas para novos tenants
3. Alertas de pagamentos em atraso

### Analytics Avançado
1. Gráficos de receita (Chart.js ou Recharts)
2. Análise de churn
3. Métricas de LTV (Lifetime Value)
4. Previsão de receita

### Automações
1. Suspensão automática após X dias de inadimplência
2. Downgrade automático quando limite excedido
3. Upgrade automático baseado em uso

## 🐛 Troubleshooting

### Erro de permissão
**Problema:** Usuário não consegue acessar `/superadmin`
**Solução:** Verificar se `user.role === 'superadmin'` no banco

### Dados não carregam
**Problema:** Páginas ficam em loading infinito
**Solução:** 
1. Verificar se backend está rodando
2. Verificar CORS no backend
3. Verificar `NEXT_PUBLIC_API_URL` no `.env`

### TypeScript errors
**Problema:** Erros de tipo ao compilar
**Solução:** Executar `npm run build` e verificar logs

## 📝 Notas Importantes

- **Acesso Exclusivo:** Apenas usuários com `role='superadmin'` podem acessar
- **Tempo Real:** Dados atualizam automaticamente via React Query
- **Responsivo:** Funciona em desktop, tablet e mobile
- **Preparado para Produção:** Otimizado com SSR e caching

## 🎨 Customização

### Cores por Plano
```typescript
// Em subscriptions/page.tsx
const getPlanBadge = (plan: string) => {
  switch (plan.toLowerCase()) {
    case 'free': return <Badge variant="outline">Grátis</Badge>;
    case 'basic': return <Badge className="bg-blue-600">Básico</Badge>;
    case 'professional': return <Badge className="bg-purple-600">Profissional</Badge>;
    case 'enterprise': return <Badge className="bg-orange-600">Enterprise</Badge>;
  }
}
```

### Adicionar Nova Métrica
```typescript
// 1. Adicionar no backend (views.py)
// 2. Adicionar tipo em useSuperAdmin.ts
// 3. Criar hook
export const useNewMetric = () => {
  return useQuery({
    queryKey: ['superadmin', 'new-metric'],
    queryFn: getNewMetric,
  });
};
// 4. Usar no componente
const { data } = useNewMetric();
```

---

**Desenvolvido com ❤️ para facilitar a gestão multi-tenant**
