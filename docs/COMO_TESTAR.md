# 🚀 Como Testar o Backend

O backend está **rodando** e pronto para ser testado!

## 📍 URLs Disponíveis

- **API Base:** http://localhost:8000/api/
- **Django Admin:** http://localhost:8000/admin/
- **API Documentation:** Ver `docs/API_REFERENCE.md`

## 🧪 Testando a API

### 1. Teste de Sign Up (Criar Nova Empresa)

```bash
curl -X POST http://localhost:8000/api/auth/signup/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@empresa.com",
    "password": "senha123",
    "name": "Teste Silva",
    "company_name": "Empresa Teste Ltda"
  }'
```

### 2. Teste de Login

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@barbearia.com",
    "password": "senha123"
  }'
```

**Salve o `access` token retornado!**

### 3. Teste de Listar Usuários (com autenticação)

```bash
curl -X GET http://localhost:8000/api/users/ \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 4. Teste de Listar Agendamentos

```bash
curl -X GET http://localhost:8000/api/scheduling/appointments/ \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 5. Teste de Criar Agendamento

Primeiro, pegue os IDs de um serviço e profissional:

```bash
# Listar serviços
curl -X GET http://localhost:8000/api/scheduling/services/ \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# Listar usuários (profissionais)
curl -X GET http://localhost:8000/api/users/ \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

Depois crie o agendamento:

```bash
curl -X POST http://localhost:8000/api/scheduling/appointments/ \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Cliente Teste",
    "customer_phone": "(11) 99999-9999",
    "service_id": "UUID_DO_SERVICO",
    "professional_id": "UUID_DO_PROFISSIONAL",
    "start_time": "2025-10-15T14:00:00Z"
  }'
```

## 🔐 Credenciais de Teste

```
Admin:
Email: joao@barbearia.com
Senha: senha123

Barbeiro 1:
Email: pedro@barbearia.com
Senha: senha123

Barbeiro 2:
Email: carlos@barbearia.com
Senha: senha123
```

## 🎯 Testando Multi-Tenant

### Cenário de Teste:

1. **Crie duas empresas diferentes:**
   - Use Sign Up para criar "Empresa A"
   - Use Sign Up para criar "Empresa B"

2. **Faça login em cada uma:**
   - Login com usuário da Empresa A (salve o token A)
   - Login com usuário da Empresa B (salve o token B)

3. **Crie serviços em cada empresa:**
   - Use token A para criar serviço na Empresa A
   - Use token B para criar serviço na Empresa B

4. **Verifique o isolamento:**
   - Com token A, liste serviços (deve ver apenas da Empresa A)
   - Com token B, liste serviços (deve ver apenas da Empresa B)
   - Tente acessar um recurso da Empresa A usando token B (deve dar erro 404 ou 403)

## 🐛 Troubleshooting

### Servidor não está rodando?

```bash
cd /workspaces/my_erp/backend
source venv/bin/activate
python manage.py runserver
```

### Erro de autenticação?

Certifique-se de incluir o header:
```
Authorization: Bearer SEU_TOKEN_AQUI
```

### Token expirado?

Use o endpoint de refresh:
```bash
curl -X POST http://localhost:8000/api/auth/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "SEU_REFRESH_TOKEN"
  }'
```

## 📱 Testando com Postman/Insomnia

1. Importe a coleção base:
   - Base URL: `http://localhost:8000/api/`
   - Authorization Type: Bearer Token

2. Configure variáveis de ambiente:
   - `base_url`: http://localhost:8000/api/
   - `access_token`: (será preenchido após login)

3. Teste a sequência:
   - Sign Up → Login → Get Users → Create Appointment

## 🎉 Próximo Passo: Frontend

Agora que o backend está funcionando perfeitamente, você pode:

1. Criar o frontend Next.js
2. Integrar com a API
3. Implementar as páginas de:
   - Login
   - Sign Up
   - Dashboard
   - Agendamentos
   - Serviços
   - Usuários

**Documentação completa da API:** `docs/API_REFERENCE.md`

---

✅ **Backend Multi-Tenant 100% Funcional!**
