# ⚙️ Configurações Externas Necessárias

## 📋 CHECKLIST COMPLETO DE SERVIÇOS EXTERNOS

### 🔐 **1. AUTENTICAÇÃO E SEGURANÇA**

#### **SSL/TLS Certificates**
- [ ] Certificado SSL para domínio principal
  - **Provedor:** Let's Encrypt (grátis via Vercel/Railway)
  - **Configuração:** Automática no deploy
  - **Renovação:** Automática a cada 90 dias

#### **CORS (Cross-Origin Resource Sharing)**
- [ ] Já configurado no `backend/config/settings.py`
- [ ] Atualizar com domínios de produção:
```python
CORS_ALLOWED_ORIGINS = [
    'https://seuerp.com',
    'https://www.seuerp.com',
    'https://app.seuerp.com',
]
```

---

### 💳 **2. GATEWAY DE PAGAMENTO**

#### **Mercado Pago (Brasil)**
- [ ] **Criar conta:** https://www.mercadopago.com.br/developers
- [ ] **Tipo de conta:** Business/MEI
- [ ] **Obter credenciais:**
  - Public Key (frontend): `TEST-xxx` → `APP_USR-xxx` (produção)
  - Access Token (backend): `TEST-xxx` → `APP_USR-xxx` (produção)
  
**Passos:**
1. Login em https://www.mercadopago.com.br/developers/panel
2. Suas integrações → Criar aplicação
3. Nome: "Meu ERP"
4. Copiar credenciais de teste e produção
5. Configurar Webhook:
   - URL: `https://api.seuerp.com/webhooks/mercadopago/`
   - Eventos: `payment`, `subscription`

**Documentação:**
- API Reference: https://www.mercadopago.com.br/developers/pt/reference
- Webhooks: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks

**Taxas:**
- Checkout Pro: 4.99% + R$ 0,40 (boleto/Pix)
- Link de Pagamento: Grátis
- Assinaturas: 4.99% por cobrança

#### **Stripe (Internacional - Opcional)**
- [ ] **Criar conta:** https://dashboard.stripe.com/register
- [ ] **Obter API keys:**
  - Publishable Key (frontend)
  - Secret Key (backend)
  - Webhook Secret
  
**Taxas:**
- 2.9% + $0.30 por transação (cartão)
- 0.8% (PIX)

---

### 📧 **3. SERVIÇO DE EMAIL**

#### **Resend (RECOMENDADO)**
- [ ] **Criar conta:** https://resend.com/signup
- [ ] **Verificar domínio:**
  1. Adicionar DNS records:
     ```
     Type: TXT
     Name: _resend
     Value: [fornecido pelo Resend]
     ```
  2. Aguardar verificação (1-24h)
- [ ] **Obter API Key**
- [ ] **Templates de email:**
  - Boas-vindas
  - Recuperação de senha
  - Confirmação de agendamento
  - Lembrete de agendamento (24h antes)
  - Nota fiscal/recibo

**Configuração Backend:**
```python
# settings.py
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.resend.com'
EMAIL_PORT = 465
EMAIL_USE_SSL = True
EMAIL_HOST_USER = 'resend'
EMAIL_HOST_PASSWORD = 're_xxxxxxxxx'
DEFAULT_FROM_EMAIL = 'noreply@seuerp.com'
```

**Limites:**
- Free: 3,000 emails/mês
- Paid: A partir de $20/mês (50k emails)

#### **Alternativas:**
- **SendGrid:** 100 emails/dia grátis
- **Mailgun:** 1,000 emails/mês grátis
- **AWS SES:** $0.10/1000 emails

---

### 💾 **4. STORAGE DE ARQUIVOS**

#### **AWS S3**
- [ ] **Criar conta AWS:** https://aws.amazon.com/
- [ ] **Criar bucket:**
  1. Nome: `seuerp-media-production`
  2. Região: `us-east-1` (ou mais próxima)
  3. ACL: Habilitado
  4. Block public access: Desabilitado (para uploads públicos)
- [ ] **Configurar CORS:**
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://seuerp.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```
- [ ] **Criar IAM User:**
  1. Nome: `seuerp-s3-user`
  2. Permissões: `AmazonS3FullAccess`
  3. Copiar: `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY`

**Configuração Backend:**
```python
# settings.py
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = 'seuerp-media-production'
AWS_S3_REGION_NAME = 'us-east-1'
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
AWS_DEFAULT_ACL = 'public-read'
```

**Custos:**
- Primeiros 5GB: Grátis (12 meses)
- Depois: $0.023/GB/mês
- Transferência: $0.09/GB

#### **Cloudflare R2 (Alternativa mais barata)**
- [ ] **Criar conta:** https://dash.cloudflare.com/
- [ ] **R2 Storage**
- [ ] **Criar bucket**
- [ ] **Obter API credentials**

**Vantagens:**
- 10GB grátis
- Zero custo de transferência
- Compatível com S3

---

### 📊 **5. BANCO DE DADOS**

#### **PostgreSQL em Produção**

**Opção A: Supabase (RECOMENDADO para começar)**
- [ ] **Criar conta:** https://supabase.com/
- [ ] **Criar projeto**
- [ ] **Região:** São Paulo (mais próxima)
- [ ] **Copiar credenciais:**
  - Host
  - Database
  - User
  - Password
  - Port
- [ ] **Configurar Connection Pooling** (importante!)

**Limites Free:**
- 500MB storage
- 2GB bandwidth/mês
- Unlimited API requests

**Opção B: Railway**
- [ ] Criar PostgreSQL database
- [ ] Copiar `DATABASE_URL`

**Opção C: DigitalOcean Managed Database**
- [ ] $15/mês (1GB RAM)
- [ ] Backups automáticos
- [ ] Alta disponibilidade

#### **Backups**
- [ ] **Automático:** Configurar no provider
- [ ] **Manual:** Script cron
```bash
# Backup diário
0 2 * * * pg_dump $DATABASE_URL > /backups/db_$(date +\%Y\%m\%d).sql
```

---

### 🔴 **6. CACHE E FILAS (REDIS)**

#### **Upstash Redis (RECOMENDADO)**
- [ ] **Criar conta:** https://upstash.com/
- [ ] **Criar database**
- [ ] **Copiar REDIS_URL**
  - Formato: `redis://default:password@host:port`

**Configuração Backend:**
```python
# settings.py
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': os.getenv('REDIS_URL'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Celery (tarefas assíncronas)
CELERY_BROKER_URL = os.getenv('REDIS_URL')
CELERY_RESULT_BACKEND = os.getenv('REDIS_URL')
```

**Limites Free:**
- 10,000 comandos/dia
- 256MB storage
- Suficiente para começar

**Uso:**
- Cache de queries
- Sessions
- Filas de tarefas (Celery)
- Rate limiting

---

### 📱 **7. NOTIFICAÇÕES PUSH (Mobile)**

#### **Firebase Cloud Messaging**
- [ ] **Criar projeto:** https://console.firebase.google.com/
- [ ] **Adicionar app Android:**
  - Package name: `com.seuerp.app`
  - Baixar `google-services.json`
- [ ] **Adicionar app iOS:**
  - Bundle ID: `com.seuerp.app`
  - Baixar `GoogleService-Info.plist`
  - Upload APNs certificate
- [ ] **Obter Server Key** (para backend)

**Configuração Backend:**
```python
# settings.py
FIREBASE_CONFIG = {
    'apiKey': os.getenv('FIREBASE_API_KEY'),
    'authDomain': os.getenv('FIREBASE_AUTH_DOMAIN'),
    'projectId': os.getenv('FIREBASE_PROJECT_ID'),
    'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET'),
    'messagingSenderId': os.getenv('FIREBASE_SENDER_ID'),
    'appId': os.getenv('FIREBASE_APP_ID'),
}
```

**Custo:** Grátis (até limite generoso)

---

### 🔍 **8. MONITORAMENTO E LOGS**

#### **Sentry (Rastreamento de Erros)**
- [ ] **Criar conta:** https://sentry.io/
- [ ] **Criar projetos:**
  - Django Backend
  - Next.js Frontend
  - React Native Mobile (se aplicável)
- [ ] **Copiar DSN de cada projeto**

**Configuração Backend:**
```python
# settings.py
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn=os.getenv('SENTRY_DSN'),
    integrations=[DjangoIntegration()],
    traces_sample_rate=0.1,
    send_default_pii=True,
    environment='production',
)
```

**Configuração Frontend:**
```typescript
// next.config.ts
import { withSentryConfig } from '@sentry/nextjs';

const sentryWebpackPluginOptions = {
  silent: true,
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
```

**Limites:**
- Free: 5,000 erros/mês
- Team ($26/mês): 50,000 erros/mês

#### **Logtail/Logflare (Logs Centralizados - Opcional)**
- Coletar logs de todos os serviços
- Análise e busca
- $10-20/mês

---

### 📈 **9. ANALYTICS E MÉTRICAS**

#### **Google Analytics 4**
- [ ] **Criar propriedade:** https://analytics.google.com/
- [ ] **Obter Measurement ID:** `G-XXXXXXXXXX`
- [ ] **Instalar no frontend:**
```typescript
// app/layout.tsx
import Script from 'next/script';

<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
  strategy="afterInteractive"
/>
```

#### **Plausible Analytics (Alternativa focada em privacidade)**
- Sem cookies
- Compliant com GDPR/LGPD
- $9/mês (10k pageviews)

#### **Mixpanel (Analytics de Eventos)**
- Rastrear ações de usuário
- Funis de conversão
- Free: 100k eventos/mês

---

### 🌐 **10. CDN (Content Delivery Network)**

#### **Cloudflare (RECOMENDADO)**
- [ ] **Criar conta:** https://dash.cloudflare.com/
- [ ] **Adicionar domínio**
- [ ] **Alterar nameservers** (no registrador de domínio)
- [ ] **Configurar:**
  - SSL/TLS: Full (strict)
  - Speed: Auto Minify (JS, CSS, HTML)
  - Caching: Standard
  - Page Rules: Cache tudo

**Benefícios:**
- DDoS protection
- CDN global grátis
- Cache automático
- WAF (Web Application Firewall)

**Custo:** Grátis (plano Free suficiente)

---

### 🔔 **11. WEBHOOKS E INTEGRAÇÕES**

#### **Webhook.site (Testes)**
- [ ] Usar para testar webhooks: https://webhook.site/

#### **Zapier/Make (Integrações no-code)**
- Conectar com:
  - Google Calendar
  - WhatsApp Business
  - Slack
  - Email marketing

---

### 📞 **12. COMUNICAÇÃO COM CLIENTES**

#### **WhatsApp Business API**
- [ ] **Meta Business:** https://business.facebook.com/
- [ ] **Verificar empresa**
- [ ] **Solicitar acesso à API**
- [ ] **Provedor:** 
  - Twilio WhatsApp API
  - MessageBird
  - Zenvia (Brasil)

**Custos:**
- Conversas iniciadas pelo cliente: Grátis (primeiras 1000/mês)
- Conversas iniciadas pela empresa: ~$0.05-0.10 cada

#### **SMS (Alternativa)**
- Twilio: $0.0075/SMS (Brasil)
- Zenvia: A partir de R$ 0,10/SMS

---

### 📄 **13. LEGAL E COMPLIANCE**

#### **Termos de Uso e Política de Privacidade**
- [ ] **Contratar advogado** ou usar templates:
  - https://www.iubenda.com/ (gerador automático)
  - https://www.termsfeed.com/
  
**Requisitos LGPD:**
- [ ] Consentimento explícito para coletar dados
- [ ] Direito de acesso aos dados
- [ ] Direito de exclusão (botão "Deletar minha conta")
- [ ] Criptografia de dados sensíveis
- [ ] Log de acessos

#### **Nota Fiscal Eletrônica (NF-e/NFS-e)**
- [ ] **API de emissão:**
  - Enotas: https://enotas.com.br/
  - Focus NFe: https://focusnfe.com.br/
  - NFe.io: https://nfe.io/

**Custo:** ~R$ 50-150/mês (dependendo do volume)

---

### 🎨 **14. DESIGN E ASSETS**

#### **Logo e Identidade Visual**
- [ ] **Criar logo:**
  - Contratar designer (Fiverr, 99designs)
  - DIY: Canva, Figma
- [ ] **Gerar variações:**
  - Logo principal
  - Favicon (16x16, 32x32)
  - App icon (512x512, 1024x1024)
  - Social media (1200x630 para OpenGraph)

#### **Banco de Imagens**
- Unsplash (grátis)
- Pexels (grátis)
- Shutterstock (pago)

---

### 🔒 **15. SEGURANÇA ADICIONAL**

#### **Cloudflare Turnstile (CAPTCHA)**
- [ ] Substituir reCAPTCHA
- [ ] Proteger formulários de login/cadastro

#### **Rate Limiting**
- [ ] Já implementado no Django
- [ ] Configurar no Cloudflare também

#### **Secrets Management**
- [ ] **Não commitar** `.env` no Git
- [ ] Usar secrets do GitHub Actions
- [ ] Usar Railway/Vercel environment variables

---

### 📊 **16. BUSINESS INTELLIGENCE (Opcional)**

#### **Metabase (Self-hosted)**
- Dashboards de dados
- Relatórios customizados
- Conecta direto no PostgreSQL

#### **Google Data Studio**
- Grátis
- Integra com Google Analytics

---

## 📋 **RESUMO: ORDEM DE PRIORIDADE**

### **Essenciais (antes do launch)**
1. ✅ SSL/HTTPS
2. ✅ PostgreSQL
3. ✅ Email (Resend)
4. ✅ Storage (S3/R2)
5. ✅ Mercado Pago
6. ✅ Sentry
7. ✅ Redis (Upstash)
8. ✅ Google Analytics

### **Importantes (primeira semana)**
9. ⚠️ Cloudflare CDN
10. ⚠️ Backups automáticos
11. ⚠️ Termos de Uso / Privacidade

### **Desejáveis (primeiro mês)**
12. 📱 WhatsApp Business API
13. 📱 Firebase (se mobile)
14. 📊 Mixpanel
15. 💳 Nota Fiscal Eletrônica

### **Futuro (após validação)**
16. 🚀 SMS notifications
17. 🚀 Zapier integrations
18. 🚀 BI/Analytics avançado

---

## 💰 **CUSTOS MENSAIS DOS SERVIÇOS**

| Serviço | Plano | Custo |
|---------|-------|-------|
| Railway (Backend) | Starter | $5 |
| Vercel (Frontend) | Hobby | Grátis |
| PostgreSQL (Supabase) | Free | Grátis |
| Redis (Upstash) | Free | Grátis |
| Email (Resend) | Free | Grátis |
| Storage (R2) | Free | Grátis |
| Sentry | Free | Grátis |
| Cloudflare | Free | Grátis |
| **TOTAL INICIAL** | | **$5/mês** |

**Após crescimento (~100 clientes):**
- Railway Pro: $20
- Vercel Pro: $20
- Database: $15
- Email: $20
- Storage: $5
- Sentry: $26
- **TOTAL: ~$106/mês**

---

## 🎯 **PRÓXIMOS PASSOS**

1. **Criar conta em cada serviço** (seguindo a ordem de prioridade)
2. **Documentar credenciais** em gerenciador de senhas (1Password, LastPass)
3. **Configurar .env.production** com todas as variáveis
4. **Testar em ambiente de staging** antes de produção
5. **Deploy gradual:** Backend → Frontend → Mobile (se aplicável)

---

**Última atualização:** 24/10/2025
