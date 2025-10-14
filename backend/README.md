# Backend - Django REST API

Sistema Multi-Tenant construído com Django e Django REST Framework.

## 🚀 Setup Inicial

### 1. Criar ambiente virtual e instalar dependências

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

pip install -r requirements.txt
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Edite o .env conforme necessário
```

### 3. Executar migrações

```bash
python manage.py migrate
```

### 4. (Opcional) Popular banco com dados de teste

```bash
python manage.py shell < populate_db.py
```

### 5. Criar superusuário (para acessar Django Admin)

```bash
python manage.py createsuperuser
```

### 6. Executar servidor de desenvolvimento

```bash
python manage.py runserver
```

A API estará disponível em: `http://localhost:8000`

Django Admin: `http://localhost:8000/admin/`

## 📁 Estrutura do Projeto

```
backend/
├── config/                 # Configurações do Django
│   ├── settings.py        # Configurações principais
│   ├── urls.py            # URLs principais
│   └── wsgi.py
├── core/                   # App núcleo Multi-Tenant
│   ├── models.py          # Tenant, User, TenantAwareModel
│   ├── serializers.py     # Serializers de autenticação
│   ├── views.py           # Views de Sign Up, Login, Users
│   ├── permissions.py     # Permissões Multi-Tenant
│   ├── middleware.py      # Middleware de Tenant
│   └── urls.py
├── scheduling/             # App de Agendamentos
│   ├── models.py          # Service, Appointment
│   ├── serializers.py     # Serializers de agendamentos
│   ├── views.py           # ViewSets de agendamentos
│   └── urls.py
├── manage.py
├── requirements.txt
├── populate_db.py         # Script para dados de teste
└── .env
```

## 🎯 Apps Principais

### Core (Multi-Tenant)
- **Models:** Tenant, User
- **Funcionalidades:**
  - Sign Up de novos clientes
  - Autenticação JWT
  - Gerenciamento de usuários
  - Convite de membros da equipe
  - Isolamento de dados por tenant

### Scheduling (Agendamentos)
- **Models:** Service, Appointment
- **Funcionalidades:**
  - Catálogo de serviços
  - Agendamentos
  - Filtros por data, profissional, status
  - Mudança de status (confirmar, iniciar, concluir, cancelar)

## 🔐 Autenticação

O sistema usa **JWT (JSON Web Tokens)** para autenticação.

### Obter Token

```bash
POST /api/auth/login/
{
  "email": "user@example.com",
  "password": "senha123"
}
```

### Usar Token

Adicione o header em todas as requisições:

```
Authorization: Bearer {access_token}
```

## 📚 Documentação da API

Consulte a [API Reference](../docs/API_REFERENCE.md) para detalhes de todos os endpoints.

## 🧪 Testes

```bash
python manage.py test
```

## 🗄️ Banco de Dados

### SQLite (Desenvolvimento)
O projeto usa SQLite por padrão para facilitar o desenvolvimento.

### PostgreSQL (Produção)

Para usar PostgreSQL, instale as dependências:

```bash
pip install psycopg2-binary
```

Atualize o `.env`:

```env
DB_ENGINE=django.db.backends.postgresql
DB_NAME=my_erp_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
```

## 🛠️ Comandos Úteis

```bash
# Criar nova migração
python manage.py makemigrations

# Aplicar migrações
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser

# Shell interativo
python manage.py shell

# Coletar arquivos estáticos
python manage.py collectstatic

# Executar servidor
python manage.py runserver

# Popular banco com dados de teste
python manage.py shell < populate_db.py
```

## 🔒 Segurança Multi-Tenant

O sistema implementa **isolamento de dados em múltiplas camadas**:

1. **Middleware:** Captura o tenant do usuário autenticado
2. **Permissions:** Valida acesso aos recursos
3. **QuerySets:** Filtra automaticamente por tenant
4. **Validations:** Verifica relacionamentos entre tenants

### Checklist de Segurança

- ✅ Todo modelo de negócio herda de `TenantAwareModel`
- ✅ `TenantMiddleware` está configurado
- ✅ Permissões `IsSameTenant` aplicadas nas views
- ✅ `get_queryset()` filtra por tenant
- ✅ Validações de tenant em serializers
- ✅ Testes de isolamento implementados

## 📝 Credenciais de Teste

Após executar `populate_db.py`:

**Admin:**
- Email: `joao@barbearia.com`
- Senha: `senha123`

**Barbeiro 1:**
- Email: `pedro@barbearia.com`
- Senha: `senha123`

**Barbeiro 2:**
- Email: `carlos@barbearia.com`
- Senha: `senha123`

## 🐛 Troubleshooting

### Erro: "No module named 'psycopg2'"

Solução: Use SQLite ou instale psycopg2:
```bash
pip install psycopg2-binary
```

### Erro: "table already exists"

Solução: Delete as migrações e o banco:
```bash
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
rm db.sqlite3
python manage.py makemigrations
python manage.py migrate
```

### Erro: CORS

Solução: Verifique se o frontend está em `CORS_ALLOWED_ORIGINS` no `.env`

## 📄 Licença

MIT
