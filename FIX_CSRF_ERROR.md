# ⚠️ CORREÇÃO URGENTE - Erro 403 CSRF no Railway

## 🐛 Problema

Erro ao fazer login e acessar Django Admin:
```
403 Forbidden - CSRF verification failed
400 Bad Request - Login failed
```

## 🔧 Solução

### 1️⃣ Adicionar Variáveis de Ambiente no Railway

Acesse: https://railway.app → Seu projeto → Serviço backend → **Variables**

Adicione ou **ATUALIZE** estas variáveis:

```bash
# CSRF - Permitir origens confiáveis
CSRF_TRUSTED_ORIGINS=https://vrb-erp-frontend.vercel.app,https://myerp-production-4bb9.up.railway.app,https://*.railway.app

# CORS - Permitir requests do frontend
CORS_ALLOWED_ORIGINS=https://vrb-erp-frontend.vercel.app,http://localhost:3000

# ALLOWED_HOSTS - Permitir acesso ao backend
ALLOWED_HOSTS=localhost,127.0.0.1,myerp-production-4bb9.up.railway.app,.railway.app
```

### 2️⃣ Forçar Redeploy

Após adicionar as variáveis:

**Opção A: Automático**
- As variáveis serão aplicadas automaticamente
- Railway vai fazer redeploy

**Opção B: Manual**
- Vá em **Deployments**
- Clique nos 3 pontinhos do último deploy
- Clique em **Redeploy**

### 3️⃣ Aguardar Deploy (2-3 minutos)

O Railway vai:
1. Aplicar as novas variáveis de ambiente
2. Rodar migrations
3. Criar super admin
4. Iniciar o servidor

### 4️⃣ Testar

**Login API:**
```bash
# Deve retornar 200 OK (não 400)
curl -X POST https://myerp-production-4bb9.up.railway.app/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@teste.com","password":"Admin@123"}'
```

**Django Admin:**
```
https://myerp-production-4bb9.up.railway.app/admin/
```
Deve carregar sem erro 403.

**Frontend Login:**
```
https://vrb-erp-frontend.vercel.app/login
```
Deve funcionar normalmente.

---

## 📋 Checklist

- [ ] Variáveis adicionadas no Railway
- [ ] Deploy concluído (verde no dashboard)
- [ ] Login funcionando no frontend
- [ ] Django Admin acessível
- [ ] Super Admin criado

---

## 🔍 Como Verificar se Funcionou

### Via Railway Logs:

```bash
railway logs --service my_erp | Select-String "CSRF|CORS"
```

Deve aparecer:
```
CSRF_TRUSTED_ORIGINS: ['https://vrb-erp-frontend.vercel.app', ...]
```

### Via Curl:

```bash
# Deve retornar cookies CSRF
curl -I https://myerp-production-4bb9.up.railway.app/api/auth/login/
```

---

## 🚨 Se o Erro Persistir

### 1. Verificar se as variáveis foram aplicadas:

```bash
railway variables
```

### 2. Verificar logs de erro:

```bash
railway logs | Select-String "403|CSRF|error" -Context 3
```

### 3. Forçar rebuild completo:

No Railway Dashboard:
1. Settings → Deployment
2. "Redeploy" com "Clear Build Cache"

---

## 📝 Variáveis Completas para Railway

Copie e cole estas variáveis no Railway (Variables → Raw Editor):

```env
DATABASE_URL=postgresql://...  # Já existe, não alterar
SECRET_KEY=django-insecure-...  # Já existe ou gerar novo
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,myerp-production-4bb9.up.railway.app,.railway.app
CORS_ALLOWED_ORIGINS=https://vrb-erp-frontend.vercel.app,http://localhost:3000
CSRF_TRUSTED_ORIGINS=https://vrb-erp-frontend.vercel.app,https://myerp-production-4bb9.up.railway.app,https://*.railway.app
SENTRY_DSN=  # Deixe vazio ou configure depois
SENTRY_ENVIRONMENT=production
```

---

## ✅ Resultado Esperado

Após configurar:

- ✅ Login no frontend funciona
- ✅ Django Admin acessível
- ✅ API responde 200 (não 400)
- ✅ Sem erros 403 CSRF
- ✅ Super Admin criado automaticamente
