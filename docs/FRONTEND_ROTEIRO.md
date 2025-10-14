# 🎨 Frontend Next.js - Roteiro de Implementação

## ✅ O Que Já Foi Feito

1. ✅ Projeto Next.js 15 criado com TypeScript e Tailwind CSS
2. ✅ Dependências instaladas (axios, react-query, date-fns, lucide-react, etc.)
3. ✅ Shadcn/UI configurado
4. ✅ Variáveis de ambiente configuradas (.env.local)
5. ✅ Types TypeScript criados (baseados na API Django)
6. ✅ Canvas de Design UX/UI documentado

## 📋 Próximos Passos (Implementação Completa)

### 1. **Configuração da API (lib/api.ts)**
Criar cliente Axios com interceptors para JWT

### 2. **Context de Autenticação (contexts/AuthContext.tsx)**
- Login/Logout
- Armazenar tokens no localStorage
- Refresh token automático
- Proteção de rotas

### 3. **Context de Tenant (contexts/TenantContext.tsx)**
- Dados do tenant atual
- Dados do usuário logado

### 4. **Componentes Shadcn/UI**
Instalar componentes necessários:
```bash
npx shadcn@latest add button card dialog input label select table calendar
```

### 5. **Páginas Principais**

#### a) **Login (`app/login/page.tsx`)**
- Formulário simples
- Validação
- Redirecionamento após login

#### b) **Sign Up (`app/signup/page.tsx`)**
- Cadastro de nova empresa
- Workflow do Canvas (BLOCO 2)

#### c) **Dashboard (`app/dashboard/page.tsx`)**
- Cards com KPIs
- Gráficos (usar recharts ou similar)
- Visão da Carla

#### d) **Agenda (`app/agenda/page.tsx`)**
- Calendário semanal
- Cards de agendamento
- Drag & Drop (react-dnd ou dnd-kit)
- Modal de novo agendamento
- Visão do Zé

#### e) **Clientes (`app/clientes/page.tsx`)**
- Lista de clientes
- Busca
- Histórico

#### f) **Configurações**
- `/app/configuracoes/servicos/page.tsx` - CRUD de serviços
- `/app/configuracoes/equipe/page.tsx` - Gerenciar usuários
- `/app/configuracoes/conta/page.tsx` - Dados do tenant

### 6. **Componentes Compartilhados**

#### `components/layout/Sidebar.tsx`
- Menu lateral (desktop)
- Navegação principal

#### `components/layout/BottomNav.tsx`
- Barra inferior (mobile)
- 4 ícones principais

#### `components/layout/Header.tsx`
- Barra superior
- Nome do usuário/tenant
- Botão de logout

#### `components/appointments/AppointmentCard.tsx`
- Card de agendamento
- Status com cores

#### `components/appointments/NewAppointmentDialog.tsx`
- Modal para criar agendamento

#### `components/dashboard/KPICard.tsx`
- Card de KPI reutilizável

### 7. **Hooks Personalizados**

#### `hooks/useAuth.ts`
- Hook para acessar contexto de autenticação

#### `hooks/useApi.ts`
- Wrapper do react-query para chamadas à API

#### `hooks/useAppointments.ts`
- Lógica de agendamentos

## 🎯 Estrutura de Pastas Sugerida

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Layout com sidebar/bottomnav
│   │   ├── page.tsx             # Dashboard
│   │   ├── agenda/
│   │   ├── clientes/
│   │   └── configuracoes/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                      # Componentes shadcn/ui
│   ├── layout/
│   ├── appointments/
│   └── dashboard/
├── contexts/
│   ├── AuthContext.tsx
│   └── TenantContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useApi.ts
│   └── useAppointments.ts
├── lib/
│   ├── api.ts
│   └── utils.ts
├── types/
│   └── index.ts
└── .env.local
```

## 🚀 Comandos para Iniciar o Desenvolvimento

```bash
# Navegar para o frontend
cd frontend

# Adicionar componentes shadcn/ui
npx shadcn@latest add button card dialog input label select table

# Iniciar servidor de desenvolvimento
npm run dev
```

O frontend rodará em: **http://localhost:3000**

## 🎨 Design System

### Cores (Seguindo o Canvas)
- **Primary:** Azul elétrico (#3B82F6)
- **Background:** Cinza claro (#F9FAFB)
- **Text:** Cinza escuro (#111827)
- **Success:** Verde (#10B981)
- **Warning:** Amarelo (#F59E0B)
- **Danger:** Vermelho (#EF4444)

### Tipografia
- **Heading:** font-bold text-2xl
- **Body:** font-normal text-base
- **Small:** font-normal text-sm

### Espaçamento
- Mobile: padding p-4
- Desktop: padding p-6

## 📱 Mobile-First Approach

Sempre começar com mobile e adaptar para desktop:

```tsx
// Exemplo
<div className="p-4 md:p-6">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Cards */}
  </div>
</div>
```

## 🔐 Fluxo de Autenticação

1. Usuário faz login
2. Backend retorna tokens (access + refresh)
3. Frontend armazena no localStorage
4. Todas as requisições incluem token no header
5. Se token expirar, usa refresh para renovar

## ✅ Checklist de Implementação

- [ ] Configurar API client (axios)
- [ ] Criar AuthContext
- [ ] Criar TenantContext
- [ ] Adicionar componentes shadcn/ui
- [ ] Criar página de Login
- [ ] Criar página de Sign Up
- [ ] Criar layout com sidebar/bottom nav
- [ ] Implementar Dashboard
- [ ] Implementar Agenda
- [ ] Implementar CRUD de Serviços
- [ ] Implementar lista de Clientes
- [ ] Implementar gerenciamento de Equipe
- [ ] Testes de integração com backend
- [ ] Responsividade mobile
- [ ] Deploy

---

**Backend está 100% pronto e rodando!**  
**Siga este roteiro para construir o frontend alinhado com o Canvas de UX/UI.**
