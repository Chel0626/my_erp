# Configuração de Login Social (Google e Microsoft)

## 📋 Visão Geral

O sistema agora suporta login social com **Google** e **Microsoft** usando django-allauth. Esta documentação explica como configurar cada provider.

---

## ✅ Funcionalidades Implementadas

1. **Validação de Conflitos de Agendamento** ✅
   - Verifica automaticamente se há conflito de horários ao criar/editar agendamento
   - Ignora agendamentos cancelados ou com falta
   - Retorna mensagem clara do horário conflitante

2. **Sistema de Envio de Emails** ✅
   - Email de convite para novos usuários com senha temporária
   - Email de confirmação de agendamento para clientes
   - Templates HTML profissionais
   - Configurável via `.env` (Gmail, SMTP, etc.)

3. **Login Social** ✅
   - Google OAuth 2.0
   - Microsoft OAuth 2.0
   - Integração com JWT tokens
   - Auto-criação de conta no primeiro login

---

## 🔐 Configuração do Google OAuth

### Passo 1: Criar Projeto no Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente
3. Ative a **Google+ API** (APIs & Services > Library)

### Passo 2: Criar Credenciais OAuth

1. Vá em **APIs & Services > Credentials**
2. Clique em **Create Credentials > OAuth 2.0 Client ID**
3. Configure a tela de consentimento (OAuth consent screen) se solicitado:
   - User Type: **External**
   - App name: **My ERP**
   - User support email: seu-email@example.com
   - Developer contact: seu-email@example.com

4. Criar OAuth Client ID:
   - Application type: **Web application**
   - Name: **My ERP Web Client**
   - Authorized JavaScript origins:
     ```
     http://localhost:3000
     http://localhost:8000
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:8000/api/auth/social/google/callback/
     http://localhost:3000/auth/google/callback
     ```

5. Copie o **Client ID** e **Client Secret**

### Passo 3: Configurar no Backend

Adicione no arquivo `.env`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=seu-client-id-aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret-aqui
```

### Passo 4: Configurar no Django Admin

1. Inicie o servidor: `python manage.py runserver`
2. Acesse: http://localhost:8000/admin/
3. Vá em **Sites** e edite o site padrão:
   - Domain name: `localhost:8000`
   - Display name: `My ERP`

4. Vá em **Social applications** e clique em **Add**:
   - Provider: **Google**
   - Name: **Google OAuth**
   - Client id: (cole o Client ID)
   - Secret key: (cole o Client Secret)
   - Sites: Adicione `localhost:8000`

---

## 🔐 Configuração do Microsoft OAuth

### Passo 1: Registrar App no Azure AD

1. Acesse: https://portal.azure.com/
2. Vá em **Microsoft Entra ID** (antigo Azure Active Directory)
3. Clique em **App registrations > New registration**

### Passo 2: Configurar o Aplicativo

1. **Nome**: My ERP
2. **Supported account types**: 
   - Accounts in any organizational directory and personal Microsoft accounts
3. **Redirect URI**:
   - Platform: **Web**
   - URL: `http://localhost:8000/api/auth/social/microsoft/callback/`

4. Após criar, copie:
   - **Application (client) ID**
   - Em **Certificates & secrets**, crie um novo **Client secret** e copie o valor

### Passo 3: Configurar API Permissions

1. Vá em **API permissions**
2. Adicione permissões:
   - **Microsoft Graph > Delegated permissions**
   - Adicione: `User.Read`, `email`, `profile`, `openid`
3. Clique em **Grant admin consent** (se aplicável)

### Passo 4: Configurar no Backend

Adicione no arquivo `.env`:

```env
# Microsoft OAuth
MICROSOFT_CLIENT_ID=seu-application-id-aqui
MICROSOFT_CLIENT_SECRET=seu-client-secret-aqui
```

### Passo 5: Configurar no Django Admin

1. Acesse: http://localhost:8000/admin/
2. Vá em **Social applications** e clique em **Add**:
   - Provider: **Microsoft**
   - Name: **Microsoft OAuth**
   - Client id: (cole o Application ID)
   - Secret key: (cole o Client Secret)
   - Sites: Adicione `localhost:8000`

---

## 📧 Configuração de Email

### Opção 1: Console Backend (Desenvolvimento)

Já está configurado por padrão. Emails aparecerão no terminal.

```env
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

### Opção 2: Gmail (Produção)

1. Ative a verificação em duas etapas na sua conta Google
2. Crie uma **App Password**: https://myaccount.google.com/apppasswords
3. Configure no `.env`:

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seu-email@gmail.com
EMAIL_HOST_PASSWORD=sua-app-password-aqui
DEFAULT_FROM_EMAIL=noreply@seu-dominio.com
```

### Opção 3: Outros Provedores SMTP

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.seu-provedor.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seu-usuario
EMAIL_HOST_PASSWORD=sua-senha
DEFAULT_FROM_EMAIL=noreply@seu-dominio.com
```

---

## 🔧 APIs Disponíveis

### Login Social

```bash
# Google Login - Redireciona para página de autenticação
GET /api/auth/social/google/login/

# Microsoft Login - Redireciona para página de autenticação
GET /api/auth/social/microsoft/login/

# Callback (processado automaticamente após login)
GET /api/auth/social/google/callback/?code=...
GET /api/auth/social/microsoft/callback/?code=...
```

### Endpoints dj-rest-auth

```bash
# Login tradicional
POST /api/auth/login/
{
  "email": "user@example.com",
  "password": "senha123"
}

# Logout
POST /api/auth/logout/

# Refresh token
POST /api/auth/token/refresh/
{
  "refresh": "refresh-token-aqui"
}

# User info
GET /api/auth/user/
```

---

## 🧪 Testando

### 1. Teste de Conflito de Agendamento

```bash
# Criar primeiro agendamento
POST /api/scheduling/appointments/
{
  "customer_name": "João Silva",
  "service_id": "uuid-do-servico",
  "professional_id": "uuid-do-profissional",
  "start_time": "2025-10-23T10:00:00Z"
}

# Tentar criar segundo agendamento no mesmo horário
# (deve retornar erro de conflito)
POST /api/scheduling/appointments/
{
  "customer_name": "Maria Santos",
  "service_id": "uuid-do-servico",
  "professional_id": "uuid-do-profissional",  # mesmo profissional
  "start_time": "2025-10-23T10:15:00Z"  # dentro do horário anterior
}
```

### 2. Teste de Email de Convite

```bash
# Convidar novo usuário (email será enviado)
POST /api/users/invite/
Authorization: Bearer seu-token-jwt
{
  "email": "novousuario@example.com",
  "name": "Novo Usuário",
  "role": "profissional"
}

# Verifique o terminal para ver o email (se usando console backend)
```

### 3. Teste de Login Social

1. Acesse no navegador:
   ```
   http://localhost:8000/api/auth/social/google/login/
   ```

2. Você será redirecionado para o Google

3. Após autenticar, será redirecionado de volta com um token JWT

---

## 🚀 Próximos Passos para Produção

1. **Configurar domínio real**:
   - Alterar URLs de callback no Google Cloud Console
   - Alterar URLs de callback no Azure Portal
   - Atualizar `SITE_ID` no Django Admin

2. **Usar HTTPS**:
   - Obrigatório para produção
   - Configurar certificado SSL

3. **Configurar Email Production**:
   - Usar serviço profissional (SendGrid, AWS SES, etc.)
   - Configurar SPF/DKIM no DNS

4. **Migrar para AWS Cognito** (opcional):
   - Usar Cognito User Pools
   - Integrar com API Gateway
   - Remover django-allauth se preferir

---

## 📝 Notas Importantes

- **Segurança**: Nunca commite as credenciais (Client ID/Secret) no código
- **CORS**: Certifique-se que o frontend está na lista `CORS_ALLOWED_ORIGINS`
- **Tokens**: Os tokens JWT expiram em 1 hora por padrão
- **First Login**: No primeiro login social, uma conta é criada automaticamente
- **Email Verification**: Está em modo `optional` - configure como `mandatory` em produção

---

## 🐛 Troubleshooting

### Erro: "redirect_uri_mismatch"
- Verifique se a URL de callback está exatamente igual no console do provider

### Email não está sendo enviado
- Verifique as configurações SMTP no `.env`
- Para Gmail, certifique-se de usar App Password, não a senha normal

### Erro: "User has no field named 'username'"
- Já corrigido! Configuração `ACCOUNT_USER_MODEL_USERNAME_FIELD = None` resolve

### Login social não funciona
- Verifique se adicionou o site em Social Applications no admin
- Confirme que as credenciais estão corretas no `.env`
