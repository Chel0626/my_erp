# API Reference - My ERP

Base URL (Development): `http://localhost:8000/api/`

## Autenticação

Todas as rotas (exceto Sign Up e Login) requerem autenticação via JWT.

**Headers:**
```
Authorization: Bearer {access_token}
```

### 1. Sign Up (Cadastro de Novo Cliente)

**Workflow:** BLOCO 2 - Novo Cliente - Sign Up

```http
POST /api/auth/signup/
```

**Body:**
```json
{
  "email": "dono@barbearia.com",
  "password": "senha123",
  "name": "João Silva",
  "company_name": "Barbearia do João"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "dono@barbearia.com",
    "name": "João Silva",
    "tenant": "uuid",
    "tenant_name": "Barbearia do João",
    "role": "admin",
    "is_active": true,
    "created_at": "2025-10-14T10:00:00Z"
  },
  "tenant": {
    "id": "uuid",
    "name": "Barbearia do João",
    "plan": "basico",
    "is_active": true,
    "created_at": "2025-10-14T10:00:00Z"
  },
  "tokens": {
    "refresh": "...",
    "access": "..."
  }
}
```

### 2. Login

```http
POST /api/auth/login/
```

**Body:**
```json
{
  "email": "dono@barbearia.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "refresh": "...",
  "access": "..."
}
```

### 3. Refresh Token

```http
POST /api/auth/refresh/
```

**Body:**
```json
{
  "refresh": "..."
}
```

**Response (200):**
```json
{
  "access": "..."
}
```

## Usuários

### 4. Listar Usuários do Tenant

```http
GET /api/users/
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Nome do Usuário",
    "tenant": "uuid",
    "tenant_name": "Barbearia do João",
    "role": "barbeiro",
    "is_active": true,
    "created_at": "2025-10-14T10:00:00Z"
  }
]
```

### 5. Dados do Usuário Autenticado

```http
GET /api/users/me/
```

### 6. Convidar Membro da Equipe

**Workflow:** BLOCO 2 - Convidar Membro da Equipe  
**Permissão:** Apenas Admin

```http
POST /api/users/invite/
```

**Body:**
```json
{
  "email": "barbeiro@example.com",
  "name": "Pedro Santos",
  "role": "barbeiro"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "barbeiro@example.com",
    "name": "Pedro Santos",
    "tenant": "uuid",
    "tenant_name": "Barbearia do João",
    "role": "barbeiro",
    "is_active": true,
    "created_at": "2025-10-14T10:00:00Z"
  },
  "temporary_password": "XYZ123abc",
  "message": "Usuário convidado com sucesso! Senha temporária gerada."
}
```

### 7. Alterar Senha

```http
POST /api/users/change_password/
```

**Body:**
```json
{
  "old_password": "senha_antiga",
  "new_password": "senha_nova"
}
```

## Tenant

### 8. Dados do Meu Tenant

```http
GET /api/tenants/my_tenant/
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Barbearia do João",
  "plan": "basico",
  "is_active": true,
  "created_at": "2025-10-14T10:00:00Z"
}
```

## Serviços

### 9. Listar Serviços

```http
GET /api/scheduling/services/
```

**Query Params:**
- `is_active`: boolean (filtrar por ativos/inativos)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Corte Masculino",
    "description": "Corte simples",
    "price": "50.00",
    "duration_minutes": 30,
    "is_active": true,
    "created_at": "2025-10-14T10:00:00Z"
  }
]
```

### 10. Criar Serviço

```http
POST /api/scheduling/services/
```

**Body:**
```json
{
  "name": "Corte Masculino",
  "description": "Corte simples",
  "price": 50.00,
  "duration_minutes": 30,
  "is_active": true
}
```

### 11. Serviços Ativos

```http
GET /api/scheduling/services/active/
```

### 12. Atualizar Serviço

```http
PATCH /api/scheduling/services/{id}/
```

### 13. Deletar Serviço

```http
DELETE /api/scheduling/services/{id}/
```

## Agendamentos

### 14. Listar Agendamentos

**Workflow:** BLOCO 4 - Módulo de Agendamentos

```http
GET /api/scheduling/appointments/
```

**Query Params:**
- `status`: string (marcado, confirmado, em_atendimento, concluido, cancelado, falta)
- `professional`: uuid (filtrar por profissional)
- `service`: uuid (filtrar por serviço)
- `date`: date (YYYY-MM-DD - agendamentos de um dia específico)
- `start_date`: date (YYYY-MM-DD)
- `end_date`: date (YYYY-MM-DD)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "customer_name": "Maria Silva",
    "customer_phone": "(11) 99999-9999",
    "customer_email": "maria@example.com",
    "service": "uuid",
    "service_details": {
      "id": "uuid",
      "name": "Corte Masculino",
      "price": "50.00",
      "duration_minutes": 30
    },
    "professional": "uuid",
    "professional_details": {
      "id": "uuid",
      "name": "Pedro Santos",
      "email": "pedro@example.com"
    },
    "start_time": "2025-10-14T14:00:00Z",
    "end_time": "2025-10-14T14:30:00Z",
    "status": "marcado",
    "notes": "Cliente preferencial",
    "created_at": "2025-10-14T10:00:00Z",
    "updated_at": "2025-10-14T10:00:00Z"
  }
]
```

### 15. Criar Agendamento

**Workflow:** BLOCO 4 - Workflow: Criar Novo Agendamento

```http
POST /api/scheduling/appointments/
```

**Body:**
```json
{
  "customer_name": "Maria Silva",
  "customer_phone": "(11) 99999-9999",
  "customer_email": "maria@example.com",
  "service_id": "uuid",
  "professional_id": "uuid",
  "start_time": "2025-10-14T14:00:00Z",
  "notes": "Cliente preferencial"
}
```

### 16. Agendamentos de Hoje

```http
GET /api/scheduling/appointments/today/
```

### 17. Agendamentos da Semana

```http
GET /api/scheduling/appointments/week/
```

### 18. Confirmar Agendamento

```http
POST /api/scheduling/appointments/{id}/confirm/
```

### 19. Iniciar Atendimento

```http
POST /api/scheduling/appointments/{id}/start/
```

### 20. Concluir Agendamento

```http
POST /api/scheduling/appointments/{id}/complete/
```

### 21. Cancelar Agendamento

```http
POST /api/scheduling/appointments/{id}/cancel/
```

### 22. Atualizar Agendamento

```http
PATCH /api/scheduling/appointments/{id}/
```

### 23. Deletar Agendamento

```http
DELETE /api/scheduling/appointments/{id}/
```

## Códigos de Status HTTP

- `200 OK` - Requisição bem-sucedida
- `201 Created` - Recurso criado com sucesso
- `204 No Content` - Requisição bem-sucedida sem retorno
- `400 Bad Request` - Erro de validação
- `401 Unauthorized` - Não autenticado
- `403 Forbidden` - Sem permissão
- `404 Not Found` - Recurso não encontrado
- `500 Internal Server Error` - Erro no servidor

## Segurança Multi-Tenant

✅ Todos os endpoints implementam isolamento automático por tenant  
✅ Usuário só acessa dados da própria empresa  
✅ Validação em múltiplas camadas (Middleware, Permissions, QuerySet)
