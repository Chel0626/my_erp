# 🚀 Guia de Deploy - Sistema Multi-Tenant ERP

Este documento contém todas as instruções necessárias para fazer o deploy do sistema em produção.

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Backend (Django)](#configuração-do-backend-django)
3. [Configuração do Frontend (Next.js)](#configuração-do-frontend-nextjs)
4. [Banco de Dados](#banco-de-dados)
5. [Gateway de Pagamento](#gateway-de-pagamento)
6. [Configurações de Email](#configurações-de-email)
7. [Variáveis de Ambiente](#variáveis-de-ambiente)
8. [Deploy em Diferentes Plataformas](#deploy-em-diferentes-plataformas)
9. [Monitoramento e Logs](#monitoramento-e-logs)
10. [Checklist Final](#checklist-final)

---

## 🔧 Pré-requisitos

### Backend
- Python 3.11+
- PostgreSQL 14+ (recomendado para produção)
- Redis (para cache e Celery)
- Servidor Linux (Ubuntu 22.04 LTS recomendado)

### Frontend
- Node.js 18+
- Servidor com suporte a SSR (Vercel, Railway, etc.)

### Domínio e SSL
- Domínio próprio (ex: seuapp.com)
- Certificado SSL (Let's Encrypt gratuito)

---

## 🐍 Configuração do Backend (Django)

### 1. Instalar Dependências

```bash
cd backend
pip install -r requirements.txt
pip install gunicorn psycopg2-binary
```

### 2. Configurar Settings de Produção

Crie `backend/config/settings_production.py`:

```python
from .settings import *

# Security
DEBUG = False
ALLOWED_HOSTS = ['api.seuapp.com', 'seuapp.com']
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')

# CORS
CORS_ALLOWED_ORIGINS = [
    'https://seuapp.com',
    'https://www.seuapp.com',
]

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}

# Static files
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATIC_URL = '/static/'

# Media files
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL = '/media/'

# Email (exemplo com SendGrid)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.sendgrid.net'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'apikey'
EMAIL_HOST_PASSWORD = os.environ.get('SENDGRID_API_KEY')
DEFAULT_FROM_EMAIL = 'noreply@seuapp.com'

# Cache (Redis)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': os.environ.get('REDIS_URL'),
    }
}

# Session
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'

# Security Headers
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
```

### 3. Migrations e Coleta de Static Files

```bash
# Aplicar migrations
python manage.py migrate --settings=config.settings_production

# Criar super admin
python create_superadmin_user.py

# Coletar arquivos estáticos
python manage.py collectstatic --noinput --settings=config.settings_production
```

### 4. Configurar Gunicorn

Crie `gunicorn_config.py`:

```python
bind = "0.0.0.0:8000"
workers = 4
worker_class = "sync"
timeout = 120
keepalive = 5
errorlog = "/var/log/gunicorn/error.log"
accesslog = "/var/log/gunicorn/access.log"
loglevel = "info"
```

### 5. Configurar Nginx (Proxy Reverso)

```nginx
server {
    listen 80;
    server_name api.seuapp.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.seuapp.com;

    ssl_certificate /etc/letsencrypt/live/api.seuapp.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.seuapp.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /path/to/backend/staticfiles/;
    }

    location /media/ {
        alias /path/to/backend/media/;
    }
}
```

### 6. Configurar Systemd Service

Crie `/etc/systemd/system/erp-backend.service`:

```ini
[Unit]
Description=ERP Backend (Gunicorn)
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/backend
Environment="DJANGO_SETTINGS_MODULE=config.settings_production"
ExecStart=/path/to/venv/bin/gunicorn config.wsgi:application -c gunicorn_config.py

[Install]
WantedBy=multi-user.target
```

Ativar e iniciar:

```bash
sudo systemctl enable erp-backend
sudo systemctl start erp-backend
sudo systemctl status erp-backend
```

---

## ⚛️ Configuração do Frontend (Next.js)

### 1. Configurar Variáveis de Ambiente

Crie `.env.production`:

```bash
# API
NEXT_PUBLIC_API_URL=https://api.seuapp.com/api

# Auth
NEXTAUTH_URL=https://seuapp.com
NEXTAUTH_SECRET=seu-secret-super-seguro-aqui

# Payment Gateway (exemplo Stripe)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# Analytics (opcional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 2. Build de Produção

```bash
cd frontend
npm install
npm run build
```

### 3. Deploy em Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Configurações no Vercel:
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`
- Adicione todas as variáveis de ambiente

### 4. Deploy Alternativo (PM2 + Nginx)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicação
pm2 start npm --name "erp-frontend" -- start

# Salvar configuração
pm2 save
pm2 startup
```

Nginx para Frontend:

```nginx
server {
    listen 80;
    server_name seuapp.com www.seuapp.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seuapp.com www.seuapp.com;

    ssl_certificate /etc/letsencrypt/live/seuapp.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seuapp.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🗄️ Banco de Dados

### PostgreSQL em Produção

#### 1. Instalação (Ubuntu)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

#### 2. Criar Banco e Usuário

```bash
sudo -u postgres psql

CREATE DATABASE erp_production;
CREATE USER erp_user WITH PASSWORD 'senha_super_segura';
ALTER ROLE erp_user SET client_encoding TO 'utf8';
ALTER ROLE erp_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE erp_user SET timezone TO 'America/Sao_Paulo';
GRANT ALL PRIVILEGES ON DATABASE erp_production TO erp_user;
\q
```

#### 3. Backup Automatizado

Crie `/opt/scripts/backup_db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U erp_user erp_production | gzip > $BACKUP_DIR/erp_$DATE.sql.gz

# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "erp_*.sql.gz" -mtime +7 -delete
```

Adicionar ao crontab:

```bash
0 2 * * * /opt/scripts/backup_db.sh
```

---

## 💳 Gateway de Pagamento

### Integração Recomendada: Stripe

#### 1. Backend (Django)

Instalar:
```bash
pip install stripe
```

Criar `backend/payments/stripe_handler.py`:

```python
import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

def create_checkout_session(subscription_id, plan_price):
    """Cria sessão de checkout do Stripe"""
    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=[{
            'price_data': {
                'currency': 'brl',
                'unit_amount': int(plan_price * 100),  # centavos
                'product_data': {
                    'name': 'Assinatura ERP',
                },
                'recurring': {
                    'interval': 'month',
                },
            },
            'quantity': 1,
        }],
        mode='subscription',
        success_url=settings.FRONTEND_URL + '/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url=settings.FRONTEND_URL + '/cancel',
        metadata={
            'subscription_id': subscription_id,
        }
    )
    return session

def handle_webhook(payload, sig_header):
    """Processa webhooks do Stripe"""
    event = stripe.Webhook.construct_event(
        payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
    )
    
    if event.type == 'checkout.session.completed':
        # Atualizar assinatura como paga
        session = event.data.object
        subscription_id = session.metadata.subscription_id
        # ... lógica de atualização
    
    return True
```

#### 2. Webhook Endpoint

Adicionar em `backend/superadmin/urls.py`:

```python
path('webhook/stripe/', StripeWebhookView.as_view(), name='stripe-webhook'),
```

#### 3. Frontend

```typescript
// Iniciar checkout
const handleCheckout = async () => {
  const response = await api.post('/superadmin/create-checkout/', {
    subscription_id: subscriptionId,
  });
  
  const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  await stripe.redirectToCheckout({ sessionId: response.data.session_id });
};
```

---

## 📧 Configurações de Email

### Opções Recomendadas

#### 1. SendGrid (até 100 emails/dia grátis)

```python
# settings.py
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.sendgrid.net'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'apikey'
EMAIL_HOST_PASSWORD = os.environ.get('SENDGRID_API_KEY')
```

#### 2. Amazon SES (econômico para alto volume)

```python
EMAIL_BACKEND = 'django_ses.SESBackend'
AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
AWS_SES_REGION_NAME = 'us-east-1'
AWS_SES_REGION_ENDPOINT = 'email.us-east-1.amazonaws.com'
```

---

## 🔐 Variáveis de Ambiente

### Backend (.env)

```bash
# Django
DJANGO_SECRET_KEY=gere-uma-chave-super-segura-aqui
DJANGO_SETTINGS_MODULE=config.settings_production
DEBUG=False

# Database
DB_NAME=erp_production
DB_USER=erp_user
DB_PASSWORD=senha_super_segura
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# Email
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
DEFAULT_FROM_EMAIL=noreply@seuapp.com

# Payment
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Frontend URL
FRONTEND_URL=https://seuapp.com
```

### Frontend (.env.production)

```bash
NEXT_PUBLIC_API_URL=https://api.seuapp.com/api
NEXTAUTH_URL=https://seuapp.com
NEXTAUTH_SECRET=gere-secret-aqui
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
```

---

## 🌐 Deploy em Diferentes Plataformas

### Opção 1: Railway (Mais Fácil)

**Backend:**
1. Conecte seu repositório
2. Adicione PostgreSQL addon
3. Configure variáveis de ambiente
4. Deploy automático!

**Frontend:**
1. Use Vercel (gratuito)

### Opção 2: DigitalOcean (Econômico)

**Droplet Ubuntu 22.04:**
- $6/mês (1GB RAM) - Para teste
- $12/mês (2GB RAM) - Produção pequena
- $24/mês (4GB RAM) - Produção média

**Managed Database:**
- PostgreSQL $15/mês (1GB)

### Opção 3: AWS (Escalável)

**Backend:**
- EC2 t3.micro (Free tier 1 ano)
- RDS PostgreSQL
- ElastiCache Redis

**Frontend:**
- Amplify ou Vercel

### Opção 4: Render (Recomendado para Iniciantes)

**Backend:**
- Web Service gratuito (com sleep)
- PostgreSQL $7/mês

**Frontend:**
- Static Site gratuito ou Vercel

---

## 📊 Monitoramento e Logs

### 1. Sentry (Tracking de Erros)

```bash
pip install sentry-sdk
```

```python
# settings.py
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn=os.environ.get('SENTRY_DSN'),
    integrations=[DjangoIntegration()],
    traces_sample_rate=1.0,
    send_default_pii=True
)
```

### 2. Logrotate (Gerenciar Logs)

```bash
# /etc/logrotate.d/erp
/var/log/gunicorn/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload erp-backend
    endscript
}
```

### 3. Health Check Endpoint

```python
# backend/core/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def health_check(request):
    return Response({'status': 'healthy'})
```

Configure UptimeRobot ou similar para monitorar `/api/health/`

---

## ✅ Checklist Final

### Antes do Deploy

- [ ] Todas as migrations aplicadas
- [ ] SECRET_KEY gerada e configurada
- [ ] DEBUG=False em produção
- [ ] ALLOWED_HOSTS configurado
- [ ] CORS configurado corretamente
- [ ] SSL/HTTPS ativo
- [ ] Variáveis de ambiente configuradas
- [ ] Backup automático do banco configurado
- [ ] Email funcionando
- [ ] Super admin criado

### Após o Deploy

- [ ] Testar login
- [ ] Testar criação de tenant
- [ ] Testar criação de assinatura
- [ ] Testar painel super admin
- [ ] Testar webhooks de pagamento
- [ ] Configurar monitoramento
- [ ] Configurar alertas de erro
- [ ] Documentar credenciais em local seguro

### Segurança

- [ ] Firewall configurado (ufw ou similar)
- [ ] Fail2ban instalado
- [ ] Atualizações automáticas de segurança
- [ ] Chaves SSH apenas (sem senha)
- [ ] Backup em local externo
- [ ] 2FA no painel de hospedagem

---

## 🆘 Suporte e Próximos Passos

### Melhorias Futuras

1. **Sistema de Notificações:**
   - Email quando assinatura expira
   - Email de boas-vindas
   - Email de pagamento confirmado

2. **Analytics Dashboard:**
   - Gráficos de receita
   - Gráficos de crescimento
   - Métricas de churn

3. **API de Integrações:**
   - Zapier
   - WhatsApp Business
   - Google Calendar

4. **Mobile App:**
   - React Native ou Flutter
   - Notificações push

---

## 📞 Contato

Para dúvidas sobre deploy:
- Documentação: `/docs/`
- Issues: GitHub
- Email: suporte@seuapp.com

**Boa sorte com o deploy! 🚀**
