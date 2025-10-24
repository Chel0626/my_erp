# 🚀 Guia Completo de Deploy em Produção

## 📋 CHECKLIST COMPLETO PARA PRODUÇÃO

### **FASE 1: Infraestrutura e Serviços Externos**

#### **1.1 Banco de Dados**
- [ ] **PostgreSQL em Produção**
  - Opções recomendadas:
    - **Supabase** (gratuito até 500MB) - Mais fácil
    - **Neon** (gratuito com limitações)
    - **Railway** ($5-10/mês)
    - **DigitalOcean Managed Database** ($15/mês)
  - Criar database com SSL habilitado
  - Anotar: `DATABASE_URL`

#### **1.2 Storage de Arquivos (Uploads)**
- [ ] **AWS S3** ou alternativas
  - AWS S3 (pago por uso, ~$0.023/GB)
  - Cloudflare R2 (10GB grátis)
  - Backblaze B2 (10GB grátis)
  - Supabase Storage (incluído no plano)
  - Anotar: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_STORAGE_BUCKET_NAME`

#### **1.3 Email (Notificações e Recuperação de Senha)**
- [ ] **Provedor de Email**
  - SendGrid (100 emails/dia grátis)
  - Mailgun (1000 emails/mês grátis)
  - AWS SES (~$0.10/1000 emails)
  - Resend (3000 emails/mês grátis) - **RECOMENDADO**
  - Anotar: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`

#### **1.4 Gateway de Pagamento**
- [ ] **Mercado Pago** (Brasil)
  - Criar conta business
  - Obter credenciais de produção
  - Anotar: `MERCADOPAGO_PUBLIC_KEY`, `MERCADOPAGO_ACCESS_TOKEN`
  - Configurar webhooks
- [ ] **Stripe** (Internacional - opcional)
  - Criar conta
  - Obter API keys
  - Configurar webhooks

#### **1.5 Monitoramento e Logs**
- [ ] **Sentry** (Rastreamento de Erros)
  - Criar projeto Django e Next.js
  - Anotar: `SENTRY_DSN`
- [ ] **Logflare/Logtail** (Logs centralizados) - Opcional

#### **1.6 Cache e Performance**
- [ ] **Redis** (Cache e Filas)
  - Upstash (10k comandos/dia grátis) - **RECOMENDADO**
  - Redis Labs (30MB grátis)
  - Railway Redis
  - Anotar: `REDIS_URL`

---

### **FASE 2: Deploy do Backend (Django)**

#### **2.1 Preparação do Código**

**Criar `backend/requirements-prod.txt`:**
```txt
# requirements.txt base
-r requirements.txt

# Produção
gunicorn==21.2.0
whitenoise==6.6.0
django-storages==1.14.2
boto3==1.34.34
psycopg2-binary==2.9.9
redis==5.0.1
celery==5.3.6
django-celery-beat==2.5.0
sentry-sdk==1.40.0
```

**Criar `backend/Procfile` (para Railway/Heroku):**
```
web: gunicorn config.wsgi --bind 0.0.0.0:$PORT
worker: celery -A config worker -l info
beat: celery -A config beat -l info
```

**Criar `backend/runtime.txt`:**
```
python-3.11.7
```

#### **2.2 Configurações de Produção**

**Criar `backend/config/settings_prod.py`:**
```python
from .settings import *
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

DEBUG = False
ALLOWED_HOSTS = [
    'api.seuerp.com',  # Seu domínio backend
    '.railway.app',     # Se usar Railway
    '.herokuapp.com',   # Se usar Heroku
]

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT', '5432'),
        'OPTIONS': {
            'sslmode': 'require',
        },
    }
}

# Security
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# CORS
CORS_ALLOWED_ORIGINS = [
    'https://seuerp.com',  # Seu domínio frontend
    'https://www.seuerp.com',
]

# Static Files (WhiteNoise)
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media Files (S3)
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME')
AWS_S3_REGION_NAME = os.getenv('AWS_S3_REGION_NAME', 'us-east-1')
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
AWS_DEFAULT_ACL = 'public-read'

# Email
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.getenv('EMAIL_HOST')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'noreply@seuerp.com')

# Redis (Cache)
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': os.getenv('REDIS_URL'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Celery
CELERY_BROKER_URL = os.getenv('REDIS_URL')
CELERY_RESULT_BACKEND = os.getenv('REDIS_URL')

# Sentry
sentry_sdk.init(
    dsn=os.getenv('SENTRY_DSN'),
    integrations=[DjangoIntegration()],
    traces_sample_rate=0.1,
    send_default_pii=True,
    environment='production',
)

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}
```

#### **2.3 Opções de Deploy Backend**

##### **OPÇÃO A: Railway (RECOMENDADO - Fácil)**
1. Criar conta em https://railway.app
2. Instalar Railway CLI: `npm i -g @railway/cli`
3. Login: `railway login`
4. Criar projeto: `railway init`
5. Adicionar PostgreSQL: Railway Dashboard → New → Database → PostgreSQL
6. Adicionar Redis: Railway Dashboard → New → Database → Redis
7. Configurar variáveis de ambiente no Dashboard
8. Deploy: `railway up`

**Custo estimado:** $5-10/mês

##### **OPÇÃO B: DigitalOcean App Platform**
1. Criar conta DigitalOcean
2. App Platform → Create App
3. Conectar GitHub
4. Selecionar branch `main`
5. Configurar build: Python, Django
6. Adicionar Managed Database (PostgreSQL)
7. Configurar variáveis de ambiente
8. Deploy automático

**Custo estimado:** $12/mês

##### **OPÇÃO C: AWS Elastic Beanstalk**
1. Criar conta AWS
2. Instalar EB CLI: `pip install awsebcli`
3. Inicializar: `eb init`
4. Criar ambiente: `eb create production`
5. Configurar RDS (PostgreSQL)
6. Configurar ElastiCache (Redis)
7. Deploy: `eb deploy`

**Custo estimado:** $20-40/mês

##### **OPÇÃO D: VPS (DigitalOcean, Linode, Vultr)**
- Mais controle, mais complexo
- Requer conhecimento de DevOps
- Configurar Nginx, Gunicorn, systemd
- **Custo:** $6-12/mês

---

### **FASE 3: Deploy do Frontend (Next.js)**

#### **3.1 Preparação do Código**

**Atualizar `frontend/.env.production`:**
```env
NEXT_PUBLIC_API_URL=https://api.seuerp.com/api
NEXT_PUBLIC_WS_URL=wss://api.seuerp.com/ws
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

**Otimizar `next.config.ts`:**
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['seuerp-bucket.s3.amazonaws.com'], // Seu bucket S3
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
};

export default nextConfig;
```

#### **3.2 Opções de Deploy Frontend**

##### **OPÇÃO A: Vercel (RECOMENDADO - Grátis para começar)**
1. Criar conta em https://vercel.com
2. Conectar GitHub
3. Importar repositório
4. Configurar:
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Adicionar Environment Variables
6. Deploy automático a cada push

**Custo:** Grátis (Hobby), $20/mês (Pro)

##### **OPÇÃO B: Netlify**
- Similar ao Vercel
- Grátis para começar
- Bom para sites estáticos

##### **OPÇÃO C: Cloudflare Pages**
- Grátis ilimitado
- CDN global integrado
- Excelente performance

##### **OPÇÃO D: Railway/DigitalOcean (junto com backend)**
- Tudo em um lugar
- Mais controle

---

### **FASE 4: Domínio e DNS**

#### **4.1 Registrar Domínio**
- [ ] Comprar domínio (R$ 40/ano)
  - Registro.br (Brasil - .com.br)
  - Namecheap (Internacional - .com)
  - GoDaddy

#### **4.2 Configurar DNS**
```
# Frontend (Vercel)
Type: CNAME
Name: @
Value: cname.vercel-dns.com

Type: CNAME
Name: www
Value: cname.vercel-dns.com

# Backend (Railway)
Type: CNAME
Name: api
Value: xxx.up.railway.app
```

#### **4.3 SSL/TLS**
- Vercel e Railway proveem SSL automático
- Certificados Let's Encrypt gratuitos

---

### **FASE 5: CI/CD e Automação**

#### **5.1 GitHub Actions**

**Criar `.github/workflows/deploy.yml`:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd backend
          python manage.py test

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      - name: Run tests
        run: |
          cd frontend
          npm run test

  deploy:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy Backend
        run: echo "Backend deployed to Railway"
      - name: Deploy Frontend
        run: echo "Frontend deployed to Vercel"
```

---

### **FASE 6: Configurações Finais**

#### **6.1 Variáveis de Ambiente - Backend**
```env
# Django
DJANGO_SETTINGS_MODULE=config.settings_prod
SECRET_KEY=seu-secret-key-super-seguro-aqui
DEBUG=False
ALLOWED_HOSTS=api.seuerp.com,.railway.app

# Database
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=xxx
DB_HOST=xxx.railway.internal
DB_PORT=5432

# Redis
REDIS_URL=redis://default:xxx@xxx.railway.internal:6379

# Email
EMAIL_HOST=smtp.resend.com
EMAIL_PORT=587
EMAIL_HOST_USER=resend
EMAIL_HOST_PASSWORD=re_xxx

# Storage
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_STORAGE_BUCKET_NAME=seuerp-media
AWS_S3_REGION_NAME=us-east-1

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxx

# Sentry
SENTRY_DSN=https://xxx@sentry.io/xxx
```

#### **6.2 Comandos Pós-Deploy**
```bash
# Conectar ao Railway/servidor
railway run bash  # ou SSH no VPS

# Migrar database
python manage.py migrate

# Criar superadmin
python manage.py createsuperuser --email superadmin@seuerp.com

# Coletar arquivos estáticos
python manage.py collectstatic --noinput

# Popular dados iniciais (se necessário)
python manage.py loaddata initial_data.json
```

---

### **FASE 7: Monitoramento Pós-Deploy**

#### **7.1 Uptime Monitoring**
- [ ] UptimeRobot (50 monitores grátis)
- [ ] Pingdom
- [ ] Better Uptime

#### **7.2 Analytics**
- [ ] Google Analytics 4
- [ ] Plausible (privacidade)
- [ ] Mixpanel (eventos de usuário)

#### **7.3 Performance**
- [ ] Google PageSpeed Insights
- [ ] WebPageTest
- [ ] Lighthouse CI

---

## 💰 **RESUMO DE CUSTOS MENSAIS**

### **Plano Econômico (Início)**
- Domínio: R$ 40/ano (~R$ 3,33/mês)
- Backend (Railway Starter): $5/mês
- Frontend (Vercel Hobby): Grátis
- Database (Supabase): Grátis
- Storage (Cloudflare R2): Grátis (10GB)
- Email (Resend): Grátis (3k emails/mês)
- Redis (Upstash): Grátis
- **TOTAL: ~$8/mês (R$ 40/mês)**

### **Plano Crescimento**
- Domínio: R$ 40/ano
- Backend (Railway Pro): $20/mês
- Frontend (Vercel Pro): $20/mês
- Database (DigitalOcean): $15/mês
- Storage (AWS S3): ~$5/mês
- Email (SendGrid): $15/mês (40k emails)
- Redis (Upstash Pay): $10/mês
- Sentry: $26/mês
- **TOTAL: ~$111/mês (R$ 555/mês)**

---

## 📋 **CHECKLIST FINAL ANTES DO LANÇAMENTO**

### **Segurança**
- [ ] SSL/HTTPS em todos os domínios
- [ ] Senhas fortes em todos os serviços
- [ ] 2FA habilitado em contas críticas
- [ ] Backup automático do database configurado
- [ ] Rate limiting configurado
- [ ] CORS configurado corretamente
- [ ] Headers de segurança configurados
- [ ] Dependências atualizadas

### **Performance**
- [ ] CDN configurado (Cloudflare)
- [ ] Images otimizadas
- [ ] Caching configurado (Redis)
- [ ] Lazy loading implementado
- [ ] Minificação de assets
- [ ] Gzip/Brotli habilitado

### **SEO**
- [ ] Meta tags configuradas
- [ ] Sitemap.xml
- [ ] Robots.txt
- [ ] OpenGraph tags
- [ ] Schema.org markup

### **Legal**
- [ ] Termos de Uso
- [ ] Política de Privacidade
- [ ] LGPD compliance
- [ ] Cookie consent
- [ ] Contrato de SaaS

### **Testes**
- [ ] Testes unitários passando
- [ ] Testes de integração
- [ ] Teste de carga (com ferramentas como k6, Locust)
- [ ] Teste em diferentes navegadores
- [ ] Teste em mobile
- [ ] Teste de pagamento em sandbox

---

## 🚀 **PLANO DE LANÇAMENTO SUGERIDO**

### **Semana 1-2: Preparação**
1. Contratar infraestrutura
2. Configurar todos os serviços externos
3. Deploy em ambiente de staging
4. Testes completos

### **Semana 3: Soft Launch**
1. Deploy em produção
2. Convidar 5-10 beta testers
3. Coletar feedback
4. Corrigir bugs críticos

### **Semana 4: Launch**
1. Marketing e divulgação
2. Monitorar métricas
3. Suporte ativo
4. Iterações rápidas

---

## 📞 **SUPORTE E RECURSOS**

- **Documentação Django Deploy**: https://docs.djangoproject.com/en/5.0/howto/deployment/
- **Documentação Next.js Deploy**: https://nextjs.org/docs/deployment
- **Railway Docs**: https://docs.railway.app/
- **Vercel Docs**: https://vercel.com/docs
- **Comunidade Discord**: Criar canal de suporte para clientes

---

**Última atualização:** 24/10/2025
