# 🔑 Credenciais e Acesso ao Sistema

## ✅ Superusuário Django Admin Criado!

### Acesso ao Django Admin

**URL:** http://localhost:8000/admin/

**Credenciais:**
- **Email:** `admin@admin.com`
- **Senha:** `admin123`

---

## 👥 Usuários de Teste (Via API)

### Admin da Barbearia
- **Email:** `joao@barbearia.com`
- **Senha:** `senha123`
- **Empresa:** Barbearia do João
- **Role:** admin

### Barbeiro 1
- **Email:** `pedro@barbearia.com`
- **Senha:** `senha123`
- **Empresa:** Barbearia do João
- **Role:** barbeiro

### Barbeiro 2
- **Email:** `carlos@barbearia.com`
- **Senha:** `senha123`
- **Empresa:** Barbearia do João
- **Role:** barbeiro

### Caixa
- **Email:** `maria@barbearia.com`
- **Senha:** `senha123`
- **Empresa:** Barbearia do João
- **Role:** caixa

---

## 📊 Módulos Registrados no Django Admin

### ✅ Core (Multi-Tenant)
- **Tenants** - Gerenciamento de empresas
- **Users** - Gerenciamento de usuários

### ✅ Scheduling (Agendamentos)
- **Services** - Catálogo de serviços
- **Appointments** - Agendamentos

---

## 🎯 Como Usar o Django Admin

### 1. Acessar o Admin

```bash
# Certifique-se de que o servidor está rodando
cd /workspaces/my_erp/backend
source venv/bin/activate
python manage.py runserver
```

Acesse: http://localhost:8000/admin/

### 2. Login

Use as credenciais do superusuário:
- Email: `admin@admin.com`
- Senha: `admin123`

### 3. Navegar pelos Módulos

No painel administrativo você verá:

**CORE**
- Tenants
- Usuários

**SCHEDULING**
- Appointments
- Services

**AUTHENTICATION AND AUTHORIZATION**
- Groups
- Permissions

### 4. Funcionalidades Disponíveis

**Tenants:**
- Visualizar todas as empresas cadastradas
- Editar planos (Básico/Premium)
- Ativar/desativar empresas
- Ver proprietário de cada empresa

**Usuários:**
- Visualizar todos os usuários
- Filtrar por tenant, role, status
- Editar permissões
- Gerenciar senhas
- Ver a empresa de cada usuário

**Services:**
- Gerenciar catálogo de serviços
- Editar preços e duração
- Ativar/desativar serviços
- Ver qual tenant possui o serviço

**Appointments:**
- Visualizar todos os agendamentos
- Filtrar por status, profissional, data
- Editar agendamentos
- Ver informações completas do cliente
- Alterar status manualmente

---

## 🔐 Segurança

⚠️ **IMPORTANTE:** As credenciais acima são apenas para **desenvolvimento**.

Em **produção**, certifique-se de:
1. Alterar todas as senhas
2. Usar senhas fortes
3. Configurar HTTPS
4. Habilitar autenticação de dois fatores
5. Revisar permissões de usuários

---

## 🧪 Testando o Admin

### 1. Visualizar Tenants

1. Acesse: http://localhost:8000/admin/core/tenant/
2. Você verá "Barbearia do João"
3. Clique para ver detalhes

### 2. Visualizar Usuários

1. Acesse: http://localhost:8000/admin/core/user/
2. Você verá os 4 usuários de teste + o superusuário
3. Filtre por tenant: "Barbearia do João"

### 3. Visualizar Serviços

1. Acesse: http://localhost:8000/admin/scheduling/service/
2. Você verá 4 serviços (Corte, Barba, etc.)
3. Edite preços e duração se desejar

### 4. Visualizar Agendamentos

1. Acesse: http://localhost:8000/admin/scheduling/appointment/
2. Você verá 8 agendamentos
3. Filtre por status, profissional ou data

---

## 📝 Comandos Úteis

### Criar Novo Superusuário

```bash
cd backend
source venv/bin/activate
python manage.py shell < create_superuser.py
```

### Resetar Senha de Usuário

```bash
python manage.py shell
>>> from core.models import User
>>> user = User.objects.get(email='joao@barbearia.com')
>>> user.set_password('nova_senha')
>>> user.save()
>>> exit()
```

### Popular Banco Novamente

```bash
python manage.py shell < populate_db.py
```

---

## 🎉 Pronto!

Agora você tem:
- ✅ Superusuário criado
- ✅ Módulos registrados no admin
- ✅ Banco de dados populado
- ✅ Servidor rodando
- ✅ Pronto para desenvolver o frontend!

**Próximo passo:** Implementar frontend Next.js 🚀
