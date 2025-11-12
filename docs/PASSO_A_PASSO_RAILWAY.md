# 🚨 PASSO A PASSO: Configurar Backend no Railway

## Problema Atual
Os cards do dashboard não funcionam porque:
1. ❌ O banco de dados do Railway **não tem superusuário** criado
2. ❌ As **variáveis de ambiente** podem não estar configuradas no Railway
3. ❌ Frontend não consegue fazer login (sem usuário = sem token = sem dados)

---

## 📋 SOLUÇÃO: 3 Passos Simples

### 1️⃣ Instalar Railway CLI

```powershell
# Windows (PowerShell)
npm install -g @railway/cli

# Ou usando winget
winget install railway

# Verificar instalação
railway --version
```

### 2️⃣ Fazer Login e Conectar ao Projeto

```powershell
# Login no Railway
railway login

# Navegar até a pasta do backend
cd c:\Users\carol\my_erp\backend

# Conectar ao projeto (vai abrir navegador para selecionar)
railway link
# Selecione o projeto: myerp-production-4bb9
```

### 3️⃣ Criar Superusuário no Railway

```powershell
# Executar comando de management que criamos
railway run python manage.py create_admin_user

# Deve retornar:
# ✅ Superusuário criado com sucesso!
#    - Email: admin@admin.com
#    - Senha: admin123
```

---

## 🔧 VERIFICAR VARIÁVEIS DE AMBIENTE NO RAILWAY

### Via Dashboard (RECOMENDADO)

1. Acesse: https://railway.app/dashboard
2. Selecione o projeto **myerp-production-4bb9**
3. Clique na aba **Variables**
4. Verifique se TODAS essas variáveis estão configuradas:

#### ✅ Variáveis Essenciais do Backend

```bash
# Database (Railway PostgreSQL)
DATABASE_URL=postgresql://postgres:xKValkeYKpZPSGIkrQyiBLBqvVAogZUb@hopper.proxy.rlwy.net:47349/railway

# Redis Cache (Upstash)
REDIS_URL=redis://default:AXdLAAIncDI2NzhkOTY2MDE1M2Q0YjczOTk5YzgwOGNjYWFjYjkyMHAyMzA1Mzk@sincere-tapir-30539.upstash.io:6379

# Sentry Backend DSN
SENTRY_DSN=https://2e26d7a896e582b7b47c781e0469eaa9@o4510268451717120.ingest.us.sentry.io/4510268455387136

# Sentry API (para Dashboard Superadmin)
SENTRY_AUTH_TOKEN=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
SENTRY_ORG_SLUG=vrbtech
SENTRY_PROJECT_SLUG=python-django

# Railway API
RAILWAY_API_TOKEN=0e53a149-2bff-4444-a95d-bf231e7e2407

# UptimeRobot API
UPTIMEROBOT_API_KEY=ur3172478-fa8255afc3cf6b3fd922edcd

# CORS (incluir domínio do Vercel!)
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://vrb-erp-frontend.vercel.app

# CSRF (incluir domínio do Vercel!)
CSRF_TRUSTED_ORIGINS=http://localhost:3000,https://vrb-erp-frontend.vercel.app,https://myerp-production-4bb9.up.railway.app

# Django
SECRET_KEY=your-secret-key-change-in-production-use-a-long-random-string
DEBUG=False
ALLOWED_HOSTS=myerp-production-4bb9.up.railway.app,localhost
```

### Via CLI (alternativa)

```powershell
# Ver variáveis atuais
railway variables

# Adicionar variável
railway variables set SENTRY_AUTH_TOKEN="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"
```

---

## 🔐 CONFIGURAR FRONTEND NO VERCEL

Após configurar o backend, você TAMBÉM precisa configurar o frontend:

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto do frontend
3. Vá em **Settings** → **Environment Variables**
4. Adicione:

```bash
Key: NEXT_PUBLIC_API_URL
Value: https://myerp-production-4bb9.up.railway.app/api
Environment: Production, Preview, Development (TODOS)
```

5. Clique em **Save**
6. Vá na aba **Deployments** e force um **Redeploy**

---

## ✅ TESTAR SE FUNCIONOU

### 1. Testar Backend Diretamente

```powershell
# Health check (deve retornar 200 OK)
curl https://myerp-production-4bb9.up.railway.app/api/health/

# Fazer login (deve retornar token)
curl -X POST https://myerp-production-4bb9.up.railway.app/api/core/auth/login/ `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@admin.com","password":"admin123"}'

# Deve retornar algo como:
# {"access":"eyJ0eXAiOiJKV1QiLCJh...","refresh":"eyJ0eXAiOiJKV1QiLC..."}
```

### 2. Executar Script de Diagnóstico

```powershell
cd c:\Users\carol\my_erp\backend
python test_health_endpoints.py
```

Deve retornar:
```
✅ Health Check (público)
✅ Sentry Health
✅ Sentry Performance
✅ Redis Metrics
✅ Infra Metrics
✅ Uptime Status
✅ Online Users
```

### 3. Testar no Frontend (Vercel)

1. Acesse: https://vrb-erp-frontend.vercel.app/login
2. Faça login com:
   - **Email:** admin@admin.com
   - **Senha:** admin123
3. Vá para: https://vrb-erp-frontend.vercel.app/superadmin
4. Os cards devem mostrar dados REAIS (não "Carregando..."):
   - ✅ **Saúde do Código (Sentry):** 95.0% Crash-free
   - ✅ **Performance APM:** 0 ms (ou tempo real)
   - ✅ **Cache Redis:** Hit Ratio, Memory, Keys
   - ✅ **Infraestrutura:** CPU %, RAM %
   - ✅ **Uptime & Usuários:** ONLINE (LED verde piscando)

---

## 🐛 TROUBLESHOOTING

### Card do Sentry mostra 95% mas sem dados reais

**Causa:** SENTRY_AUTH_TOKEN não configurado no Railway

**Solução:**
```powershell
railway variables set SENTRY_AUTH_TOKEN="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"
```

### Card Redis fica carregando

**Causa:** REDIS_URL não configurado no Railway

**Solução:**
```powershell
railway variables set REDIS_URL="redis://default:AXdLAAIncDI2NzhkOTY2MDE1M2Q0YjczOTk5YzgwOGNjYWFjYjkyMHAyMzA1Mzk@sincere-tapir-30539.upstash.io:6379"
```

### Card Uptime mostra OFFLINE

**Causas possíveis:**
1. UPTIMEROBOT_API_KEY não configurado
2. Monitor do UptimeRobot com URL errada

**Solução:**
```powershell
# 1. Configurar variável
railway variables set UPTIMEROBOT_API_KEY="ur3172478-fa8255afc3cf6b3fd922edcd"

# 2. Atualizar monitor no UptimeRobot Dashboard:
# https://uptimerobot.com/dashboard
# URL do monitor: https://myerp-production-4bb9.up.railway.app/api/health/
```

### Erro CORS ao fazer requisição do Frontend

**Causa:** CORS_ALLOWED_ORIGINS não inclui domínio do Vercel

**Solução:**
```powershell
railway variables set CORS_ALLOWED_ORIGINS="http://localhost:3000,https://vrb-erp-frontend.vercel.app"
railway variables set CSRF_TRUSTED_ORIGINS="http://localhost:3000,https://vrb-erp-frontend.vercel.app,https://myerp-production-4bb9.up.railway.app"
```

### Build do Vercel falhou

**Causa:** Commit anterior tinha erros TypeScript (já corrigido no commit 60b6d07c)

**Solução:** Aguarde o build atual completar (levará ~2-3 min após configurar NEXT_PUBLIC_API_URL)

---

## 📊 RESUMO DOS COMANDOS

```powershell
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login e conectar
railway login
cd c:\Users\carol\my_erp\backend
railway link

# 3. Criar superusuário
railway run python manage.py create_admin_user

# 4. Verificar variáveis (opcional)
railway variables

# 5. Testar endpoints
python test_health_endpoints.py
```

---

## 🎯 CHECKLIST FINAL

### Backend (Railway)
- [ ] Railway CLI instalado
- [ ] Conectado ao projeto myerp-production-4bb9
- [ ] Superusuário admin@admin.com criado
- [ ] Variáveis de ambiente configuradas:
  - [ ] DATABASE_URL
  - [ ] REDIS_URL
  - [ ] SENTRY_DSN
  - [ ] SENTRY_AUTH_TOKEN
  - [ ] SENTRY_ORG_SLUG
  - [ ] SENTRY_PROJECT_SLUG
  - [ ] RAILWAY_API_TOKEN
  - [ ] UPTIMEROBOT_API_KEY
  - [ ] CORS_ALLOWED_ORIGINS
  - [ ] CSRF_TRUSTED_ORIGINS
- [ ] Health check responde 200 OK
- [ ] Login retorna token JWT

### Frontend (Vercel)
- [ ] NEXT_PUBLIC_API_URL configurada
- [ ] Redeploy forçado
- [ ] Build completou com sucesso
- [ ] Login funciona
- [ ] Dashboard /superadmin carrega dados

### Cards do Dashboard
- [ ] Sentry Health mostra crash-free rate real
- [ ] Sentry Performance mostra response time real
- [ ] Redis mostra hit ratio e memory
- [ ] Infra mostra CPU e RAM %
- [ ] Uptime mostra ONLINE (LED verde)

---

**Próximo Passo:** Execute o passo 1️⃣ (instalar Railway CLI) e me avise quando terminar! 🚀
