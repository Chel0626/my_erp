# 🚀 GUIA RÁPIDO - SISTEMA MULTI-TENANT

## ⚡ START EM 30 SEGUNDOS

```bash
# Terminal 1 - Backend
cd /workspaces/my_erp/backend && python manage.py runserver

# Terminal 2 - Frontend  
cd /workspaces/my_erp/frontend && npm run dev
```

🌐 **Acesse**: http://localhost:3000  
🔑 **Login**: joao@barbearia.com / senha123

---

## 📊 O QUE VOCÊ VAI VER

### 1. Tela de Login
```
┌─────────────────────────────────┐
│         🔧 (Ícone)              │
│    Bem-vindo de volta          │
│                                 │
│  Email: [____________]          │
│  Senha: [____________]          │
│                                 │
│      [  ENTRAR  ]              │
│                                 │
│  Ainda não tem conta?          │
│       Criar conta              │
│                                 │
│  Credenciais de teste:         │
│  joao@barbearia.com            │
│  senha123                      │
└─────────────────────────────────┘
```

### 2. Dashboard (Desktop)
```
┌──────────┬───────────────────────────────────────────────────┐
│          │  Barbearia do João          👤 João Silva ▼      │
│          ├───────────────────────────────────────────────────┤
│ 📊 Dash  │  Dashboard                                        │
│ 📅 Agen  │  Quarta-feira, 15 de janeiro de 2025             │
│ ✂️  Serv  │                                                   │
│ 👥 Equip │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────┐│
│ 👤 Clien │  │📅 Hoje   │ │✅ Concl. │ │💰 Receita│ │📈 Serv││
│          │  │    8     │ │    5     │ │R$ 200,00 │ │   4   ││
│          │  └──────────┘ └──────────┘ └──────────┘ └───────┘│
│          │                                                   │
│          │  Próximos Agendamentos                           │
│          │  ┌────────────────────────────────────────────┐  │
│          │  │ 🕐 Corte Masculino                         │  │
│          │  │    15/01/2025 • 14:00 • R$ 40,00  [CONF]  │  │
│          │  ├────────────────────────────────────────────┤  │
│          │  │ 🕐 Barba                                    │  │
│          │  │    15/01/2025 • 15:30 • R$ 30,00  [CONF]  │  │
│          │  └────────────────────────────────────────────┘  │
└──────────┴───────────────────────────────────────────────────┘
```

### 3. Dashboard (Mobile)
```
┌───────────────────────────┐
│ ☰  Barbearia do João  👤 │
├───────────────────────────┤
│                           │
│ Dashboard                 │
│ Quarta, 15 de jan de 2025│
│                           │
│ ┌───────────────────────┐ │
│ │ 📅 Agendamentos Hoje  │ │
│ │       8               │ │
│ │ 5 confirmados         │ │
│ └───────────────────────┘ │
│                           │
│ ┌───────────────────────┐ │
│ │ ✅ Concluídos Hoje    │ │
│ │       5               │ │
│ │ 1 cancelado           │ │
│ └───────────────────────┘ │
│                           │
│ ┌───────────────────────┐ │
│ │ 💰 Receita Hoje       │ │
│ │   R$ 200,00           │ │
│ │ 5 serviços            │ │
│ └───────────────────────┘ │
│                           │
│ ┌───────────────────────┐ │
│ │ 📈 Serviços Ativos    │ │
│ │       4               │ │
│ │ Disponíveis           │ │
│ └───────────────────────┘ │
│                           │
│ Próximos Agendamentos     │
│ ┌───────────────────────┐ │
│ │ 🕐 Corte Masculino    │ │
│ │ 15/01 • 14:00 [CONF] │ │
│ └───────────────────────┘ │
│                           │
├───────────────────────────┤
│ 📊  📅  ✂️   👥  👤    │  ← Bottom Nav
└───────────────────────────┘
```

---

## 🎯 FLUXO DE USO

### 1️⃣ Primeiro Acesso (Cadastro)
```
Signup → Cria Tenant → Cria Usuário Owner → Redireciona Dashboard
```

### 2️⃣ Login Normal
```
Login → Valida JWT → Carrega Tenant + User → Dashboard
```

### 3️⃣ Navegação
```
Dashboard → Ver KPIs → Próximos Agendamentos → [Em breve: outras páginas]
```

---

## 🎨 CORES DOS STATUS

| Status | Cor | Badge |
|--------|-----|-------|
| **Confirmed** | 🔵 Azul | `bg-blue-100 text-blue-800` |
| **Completed** | 🟢 Verde | `bg-green-100 text-green-800` |
| **Cancelled** | 🔴 Vermelho | `bg-red-100 text-red-800` |
| **Pending** | 🟡 Amarelo | `bg-yellow-100 text-yellow-800` |

---

## 📱 NAVEGAÇÃO

### Desktop (Sidebar)
- 📊 Dashboard
- 📅 Agenda
- ✂️ Serviços
- 👥 Equipe
- 👤 Clientes

### Mobile (Bottom Nav + Hambúrguer)
- Mesmos 5 itens
- Ícones grandes
- Texto pequeno
- Ativo = azul + background

---

## 🔐 SEGURANÇA

### Multi-Tenant Isolation
```
Tenant A          Tenant B
   ↓                 ↓
Users A          Users B
   ↓                 ↓
Services A       Services B
   ↓                 ↓
Appointments A   Appointments B
```

**Regra**: Usuário do Tenant A **NUNCA** vê dados do Tenant B

### Camadas de Proteção
1. **Middleware** - Filtra automaticamente por tenant
2. **Permissions** - Valida cargo do usuário
3. **QuerySets** - Filtra no banco de dados
4. **Serializers** - Valida tenant nos dados enviados
5. **Models** - Validação na criação de objetos

---

## 📊 CÁLCULO DOS KPIs

### Agendamentos Hoje
```python
appointments.filter(date=today).count()
```

### Concluídos Hoje
```python
appointments.filter(date=today, status='completed').count()
```

### Receita Hoje
```python
sum([apt.service.price for apt in appointments 
     if apt.date == today and apt.status == 'completed'])
```

### Serviços Ativos
```python
services.filter(is_active=True).count()
```

---

## 🎨 DESIGN TOKENS

### Cores Principais
```css
--primary: hsl(222.2 47.4% 11.2%)      /* Azul escuro */
--primary-foreground: white

--destructive: hsl(0 84.2% 60.2%)      /* Vermelho */
--muted: hsl(210 40% 96.1%)            /* Cinza claro */
--border: hsl(214.3 31.8% 91.4%)       /* Border cinza */
```

### Espaçamentos
```css
gap-3  = 12px
gap-4  = 16px
gap-6  = 24px

p-4    = 16px padding
p-6    = 24px padding
p-8    = 32px padding
```

### Breakpoints
```css
sm:  640px   /* Tablets pequenos */
md:  768px   /* Tablets */
lg:  1024px  /* Desktop (sidebar aparece) */
xl:  1280px  /* Desktop large */
2xl: 1536px  /* Desktop XL */
```

---

## 🚀 PERFORMANCE

### React Query Cache
- **Stale Time**: 60 segundos
- **Cache Time**: 5 minutos
- **Refetch on Focus**: Desabilitado

### Next.js Optimizations
- **Turbopack**: Build ultrarrápido
- **Server Components**: Renderização no servidor
- **Code Splitting**: Automático

### Axios Interceptors
- **Request**: Adiciona token JWT
- **Response**: Refresh automático se expirar

---

## 🐛 DEBUG RÁPIDO

### Ver requisições da API
```
F12 → Network → XHR → Ver headers e response
```

### Ver estado do Auth
```javascript
// No Console do navegador
JSON.parse(localStorage.getItem('user'))
localStorage.getItem('access_token')
```

### Ver erros do React Query
```javascript
// Adicione ao QueryProvider
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// No JSX
<ReactQueryDevtools initialIsOpen={false} />
```

---

## 📝 CHANGELOG RÁPIDO

### v0.1 - MVP Funcional ✅
- ✅ Backend Multi-Tenant
- ✅ API REST completa
- ✅ Login/Signup
- ✅ Dashboard com KPIs
- ✅ Navegação mobile-first

### v0.2 - Próxima 🚧
- 🚧 Agenda com calendário
- 🚧 CRUD de Serviços
- 🚧 Gestão de Equipe

---

## 🎯 MÉTRICAS RÁPIDAS

| Métrica | Valor |
|---------|-------|
| **Endpoints Backend** | 23+ |
| **Modelos Django** | 6 |
| **Páginas Frontend** | 4 |
| **Componentes UI** | 11 |
| **Linhas de Código** | ~3.500 |
| **Tempo de Build** | < 2s (Turbopack) |

---

## 🎉 PRONTO PARA USAR!

**Inicie os servidores e acesse http://localhost:3000** 🚀

**Próximo passo**: Implementar a página de Agenda! 📅
