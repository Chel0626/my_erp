# 🚀 Guia Rápido - SSO Google e Certificado Digital

## ✅ O que foi implementado

### Backend
- ✅ Modelo Tenant expandido (CNPJ, endereço, certificado)
- ✅ SSO Google OAuth 2.0
- ✅ Sistema de certificado digital A1
- ✅ 3 endpoints de certificado (upload, info, remove)
- ✅ Validação e criptografia de certificado

### Frontend
- ✅ Botão "Entrar com Google" na página de login
- ✅ Página de configurações da empresa
- ✅ Gerenciador de certificado digital
- ✅ UI responsiva para mobile/desktop

---

## 📋 Próximos Passos para Testar

### 1. Configurar Google OAuth

#### 1.1. Criar Projeto no Google Cloud Console

Acesse: https://console.cloud.google.com/

1. Crie um novo projeto ou selecione existente
2. Vá em **APIs & Services** > **Credentials**
3. Clique em **Create Credentials** > **OAuth 2.0 Client ID**

#### 1.2. Configurar OAuth Consent Screen

- **User Type**: External
- **App name**: "ERP Multi-Tenant" (ou seu nome)
- **User support email**: Seu email
- **Scopes**: email, profile, openid
- **Authorized domains**: `localhost`, `vercel.app` (seu domínio)

#### 1.3. Criar Client ID

- **Application type**: Web application
- **Name**: "ERP Frontend"
- **Authorized JavaScript origins**:
  ```
  http://localhost:3000
  https://vrb-erp-frontend.vercel.app
  ```
- **Authorized redirect URIs**:
  ```
  http://localhost:3000
  https://vrb-erp-frontend.vercel.app
  ```

#### 1.4. Copiar Credenciais

Após criar, copie:
- **Client ID**: `123456789-abc.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-abc123def456`

---

### 2. Configurar Variáveis de Ambiente

#### Backend (`backend/.env`)

```env
# Adicione estas linhas:
GOOGLE_OAUTH_CLIENT_ID=SEU_CLIENT_ID_AQUI.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=SEU_CLIENT_SECRET_AQUI
```

#### Frontend (`frontend/.env.local`)

```env
# Substitua esta linha:
NEXT_PUBLIC_GOOGLE_CLIENT_ID=SEU_CLIENT_ID_AQUI.apps.googleusercontent.com
```

**⚠️ IMPORTANTE**: Use o **mesmo Client ID** no backend e frontend!

---

### 3. Instalar Dependências

#### Backend

```bash
cd backend
pip install google-auth google-auth-oauthlib social-auth-app-django cryptography pyOpenSSL Pillow
```

#### Frontend

```bash
cd frontend
npm install @react-oauth/google
```

---

### 4. Aplicar Migrations

```bash
cd backend
python manage.py migrate core
```

**Migrations aplicadas:**
- ✅ 0003_tenant_improvements (21 campos Tenant + 3 campos User)

---

### 5. Testar SSO Google

#### 5.1. Iniciar Servidores

**Backend:**
```bash
cd backend
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm run dev
```

#### 5.2. Testar Login

1. Acesse: http://localhost:3000/login
2. Clique em **"Entrar com Google"**
3. Selecione sua conta Google
4. Autorize o aplicativo
5. Você será redirecionado:
   - **Usuário novo** → `/onboarding` (sem tenant)
   - **Usuário existente** → `/dashboard`

#### 5.3. Verificar Backend

Endpoint de teste direto:
```bash
curl -X POST http://localhost:8000/api/core/auth/google/ \
  -H "Content-Type: application/json" \
  -d '{"token": "SEU_ID_TOKEN_DO_GOOGLE"}'
```

---

### 6. Testar Certificado Digital

#### 6.1. Obter Certificado de Teste

**⚠️ Para desenvolvimento:**
- Use um certificado A1 de homologação
- Ou crie um certificado auto-assinado para testes:

```bash
# Criar certificado de teste (Linux/Mac)
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365
openssl pkcs12 -export -out certificate.pfx -inkey key.pem -in cert.pem -password pass:senha123
```

#### 6.2. Upload via Frontend

1. Faça login no sistema
2. Clique no avatar do usuário (canto superior direito)
3. Selecione **"Configurações da Empresa"**
4. Vá para a aba **"Certificado Digital"**
5. Clique em **"Escolher arquivo"**
6. Selecione o arquivo `.pfx`
7. Digite a senha do certificado
8. Clique em **"Instalar Certificado"**

#### 6.3. Upload via API (Postman/cURL)

```bash
curl -X POST http://localhost:8000/api/core/tenants/certificate/upload/ \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -F "certificate_file=@/caminho/para/certificado.pfx" \
  -F "password=senha_do_certificado"
```

#### 6.4. Verificar Certificado

```bash
curl http://localhost:8000/api/core/tenants/certificate/info/ \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

**Resposta esperada:**
```json
{
  "cn": "EMPRESA:12345678000190",
  "issuer": "AC SERASA RFB v5",
  "serial_number": "123456789",
  "not_valid_before": "2024-01-01T00:00:00Z",
  "not_valid_after": "2025-01-01T23:59:59Z",
  "days_until_expiry": 180,
  "is_valid": true
}
```

---

## 🔧 Troubleshooting

### Erro: "No module named 'google'"

```bash
cd backend
pip install google-auth google-auth-oauthlib
```

### Erro: "NEXT_PUBLIC_GOOGLE_CLIENT_ID não configurado"

Adicione ao `frontend/.env.local`:
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
```

### Erro: "Token inválido" no login Google

1. Verifique se o **Client ID** está correto no `.env.local`
2. Verifique se o domínio está autorizado no Google Cloud Console
3. Limpe o cache do navegador e tente novamente

### Certificado não aceito

Verifique:
- ✅ Arquivo é .pfx
- ✅ Senha está correta
- ✅ Certificado não está expirado
- ✅ Certificado tem mais de 30 dias de validade

---

## 📊 Status dos Componentes

### ✅ Pronto para Uso
- [x] Login tradicional (email/senha)
- [x] Login com Google OAuth
- [x] Upload de certificado digital
- [x] Validação de certificado
- [x] Exibição de informações do certificado
- [x] Remoção de certificado
- [x] Avisos de expiração

### 🚧 Em Desenvolvimento
- [ ] Página de cadastro completo da empresa
- [ ] Edição de informações da empresa
- [ ] Renovação automática de certificado
- [ ] Emissão de NF-e (próxima etapa)

---

## 📱 Preview das Telas

### Tela de Login
```
┌─────────────────────────────────┐
│   🪒 Bem-vindo de volta         │
│                                 │
│   Email: ________________       │
│   Senha: ________________       │
│                                 │
│   [ Entrar ]                    │
│                                 │
│   ─── Ou continue com ───       │
│                                 │
│   [ 🔵 Entrar com Google ]      │
│                                 │
│   Ainda não tem conta? Criar    │
└─────────────────────────────────┘
```

### Gerenciador de Certificado
```
┌─────────────────────────────────────────┐
│  📜 Certificado Digital                 │
│                                         │
│  ✅ Certificado Instalado   [Válido]   │
│                                         │
│  CN: EMPRESA:12345678000190             │
│  Serial: 123456789                      │
│  Válido de: 01/01/2024                  │
│  Válido até: 01/01/2025                 │
│  Emissor: AC SERASA RFB v5              │
│                                         │
│  ⚠️ Expira em 180 dias                  │
│                                         │
│  [ 🗑️  Remover Certificado ]            │
└─────────────────────────────────────────┘
```

---

## 🎯 Próximas Implementações

### Fase 1: Emissão de NF-e (Prioridade Alta)
- [ ] Integração com SEFAZ
- [ ] Assinatura XML com certificado
- [ ] Geração de DANFE (PDF)
- [ ] Consulta de status
- [ ] Cancelamento de nota

### Fase 2: Melhorias (Prioridade Média)
- [ ] Cadastro completo da empresa (frontend)
- [ ] Upload de logo
- [ ] Customização de cores
- [ ] Múltiplos certificados (A1 e A3)

### Fase 3: Avançado (Prioridade Baixa)
- [ ] Renovação automática via webhook
- [ ] Dashboard de certificados
- [ ] Histórico de uploads
- [ ] Notificações de expiração

---

## 📚 Documentação Adicional

- **Guia Completo**: `docs/SSO_CERTIFICADO_DIGITAL.md`
- **API Reference**: Ver endpoints em `backend/core/urls.py`
- **Google OAuth**: https://developers.google.com/identity/protocols/oauth2
- **NF-e**: https://www.nfe.fazenda.gov.br/portal/principal.aspx

---

## ✅ Checklist de Teste

### Backend
- [ ] Migration aplicada sem erros
- [ ] Endpoint `/api/core/auth/google/` funcionando
- [ ] Endpoint `/api/core/tenants/certificate/upload/` funcionando
- [ ] Endpoint `/api/core/tenants/certificate/info/` funcionando
- [ ] Endpoint `/api/core/tenants/certificate/remove/` funcionando
- [ ] Certificado criptografado no banco

### Frontend
- [ ] Dependência `@react-oauth/google` instalada
- [ ] Botão Google aparece na tela de login
- [ ] Login com Google funciona
- [ ] Redirect para onboarding (novo usuário)
- [ ] Redirect para dashboard (usuário existente)
- [ ] Página de configurações acessível
- [ ] Upload de certificado funciona
- [ ] Informações do certificado exibidas
- [ ] Remoção de certificado funciona

### Integração
- [ ] Token JWT gerado após login Google
- [ ] Token armazenado no localStorage
- [ ] Certificado validado corretamente
- [ ] Avisos de expiração funcionando
- [ ] UI responsiva em mobile

---

## 🆘 Suporte

Qualquer dúvida:
1. Verifique os logs do backend: `python manage.py runserver`
2. Verifique o console do navegador (F12)
3. Consulte a documentação: `docs/SSO_CERTIFICADO_DIGITAL.md`
4. Teste os endpoints diretamente via Postman/cURL

---

**Última atualização**: 14/11/2025  
**Versão**: 2.0.0  
**Status**: ✅ Backend completo | ✅ Frontend completo | 🚧 NF-e em desenvolvimento
