# 🎯 Como Acessar o Super Admin Dashboard

## 📍 O que é o Super Admin Dashboard?

É um painel administrativo **customizado** (não o Django Admin padrão) onde você pode gerenciar:

- 🏢 **Tenants (Assinantes)**: Visualizar e gerenciar todos os clientes que usam seu ERP
- 💳 **Assinaturas**: Planos (Free, Basic, Professional, Enterprise)
- 💰 **Pagamentos**: Histórico de pagamentos, cobranças pendentes
- ⚠️ **Erros**: Monitoramento de erros do sistema
- 📊 **Estatísticas**: Uso de recursos, receita, usuários ativos

---

## 🚀 Passo a Passo para Acessar

### 1️⃣ Criar Usuário Super Admin (Primeiro Acesso)

No Railway, execute o script para criar o usuário:

```bash
railway run python backend/create_super_admin.py
```

Isso criará um usuário com:
- **Email**: `superadmin@myerp.com`
- **Senha**: `SuperAdmin@123`
- **Role**: `superadmin`

### 2️⃣ Fazer Login no Frontend

Acesse a página de login:

**Produção:** https://vrb-erp-frontend.vercel.app/login

Faça login com as credenciais:
```
Email: superadmin@myerp.com
Senha: SuperAdmin@123
```

### 3️⃣ Acessar o Painel Super Admin

Após o login, acesse diretamente:

**URL:** https://vrb-erp-frontend.vercel.app/superadmin

Ou clique no menu lateral (se houver link).

---

## 📋 Páginas Disponíveis

### Dashboard Principal
**URL:** `/superadmin`

Visão geral com:
- Total de tenants (ativos, trial, suspensos)
- Receita do mês e anual
- Pagamentos pendentes e atrasados
- Erros críticos não resolvidos
- Total de usuários na plataforma

### Gestão de Tenants
**URL:** `/superadmin/tenants`

- Listar todos os tenants
- Suspender/Ativar tenants
- Ver detalhes de cada tenant
- Filtrar por status

### Gestão de Assinaturas
**URL:** `/superadmin/subscriptions`

- Visualizar planos de cada tenant
- Alterar planos
- Suspender/Ativar assinaturas
- Ver limites de uso

### Histórico de Pagamentos
**URL:** `/superadmin/payments`

- Ver todos os pagamentos
- Filtrar por status (pago, pendente, atrasado)
- Marcar pagamentos como pagos manualmente
- Exportar relatórios

### Monitoramento de Erros
**URL:** `/superadmin/errors`

- Ver erros do sistema
- Filtrar por severidade (crítico, alto, médio, baixo)
- Marcar erros como resolvidos
- Ver stack trace completo

### Estatísticas de Uso
**URL:** `/superadmin/usage`

- Uso de recursos por tenant
- Usuários ativos
- API calls
- Storage usado
- Receita por período

---

## 🔐 Segurança

O acesso ao Super Admin Dashboard é protegido por:

1. **Autenticação obrigatória**: Precisa estar logado
2. **Verificação de role**: Apenas usuários com `role = 'superadmin'` podem acessar
3. **Redirecionamento automático**: Se não for super admin, é redirecionado para `/dashboard`

---

## 🛠️ Endpoints da API

Todos os endpoints requerem autenticação e role `superadmin`:

```
GET  /api/superadmin/subscriptions/          # Listar assinaturas
GET  /api/superadmin/subscriptions/{id}/     # Detalhes da assinatura
POST /api/superadmin/subscriptions/{id}/suspend/   # Suspender
POST /api/superadmin/subscriptions/{id}/activate/  # Ativar

GET  /api/superadmin/payments/               # Listar pagamentos
GET  /api/superadmin/payments/overdue/       # Pagamentos atrasados
POST /api/superadmin/payments/{id}/mark_paid/      # Marcar como pago

GET  /api/superadmin/errors/                 # Listar erros
GET  /api/superadmin/errors/critical/        # Erros críticos
PATCH /api/superadmin/errors/{id}/resolve/   # Resolver erro

GET  /api/superadmin/usage/                  # Estatísticas de uso
GET  /api/superadmin/dashboard/              # Métricas gerais
```

---

## 🔄 Executar Script de Criação (Railway)

### Opção 1: Via Railway CLI (Local)

```bash
# Fazer login no Railway
railway login

# Conectar ao projeto
railway link

# Executar o script
railway run python backend/create_super_admin.py
```

### Opção 2: Via Deploy Automático

Adicione o script ao `railway.toml` para criar automaticamente no deploy:

```toml
[deploy]
startCommand = "cd backend && python create_super_admin.py && python manage.py migrate && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT"
```

### Opção 3: Via Django Shell Remoto

```bash
railway run python backend/manage.py shell

# Dentro do shell:
from django.contrib.auth import get_user_model
User = get_user_model()

user = User.objects.create_user(
    email='superadmin@myerp.com',
    password='SuperAdmin@123',
    name='Super Administrador',
    role='superadmin',
    tenant=None,
    is_staff=True,
    is_superuser=True
)
print(f"✅ Super Admin criado: {user.email}")
```

---

## ✅ Checklist de Acesso

- [ ] Script `create_super_admin.py` executado
- [ ] Usuário criado com role `superadmin`
- [ ] Login feito em `/login`
- [ ] Redirecionado para `/superadmin` (não `/dashboard`)
- [ ] Sidebar mostra opções de super admin (Tenants, Subscriptions, etc)

---

## 🐛 Troubleshooting

### Não consigo acessar `/superadmin`
- Verifique se o usuário tem `role = 'superadmin'`
- Confirme que está logado
- Limpe cookies e faça login novamente

### Sou redirecionado para `/dashboard`
- Seu usuário não tem role `superadmin`
- Execute o script de criação novamente

### Endpoints retornam 403 Forbidden
- Verifique o token JWT no localStorage
- Confirme que o backend está verificando o role corretamente

---

## 📞 Credenciais Padrão

```
Email: superadmin@myerp.com
Senha: SuperAdmin@123
```

**⚠️ IMPORTANTE:** Altere a senha após o primeiro acesso!
