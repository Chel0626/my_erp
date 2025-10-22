# ✅ CHECKLIST DE PRODUÇÃO

## 🎯 Status: 95% COMPLETO

### ✅ FUNCIONANDO SEM CONFIGURAÇÃO ADICIONAL

- ✅ Login tradicional (email/senha)
- ✅ Todos os 9 módulos do sistema
- ✅ Multi-tenancy (isolamento de dados)
- ✅ Emails aparecem no terminal (development)
- ✅ Sistema completo em localhost

---

## 🚀 PARA COLOCAR EM PRODUÇÃO

### 1. Segurança (OBRIGATÓRIO) - 5 minutos

**Arquivo:** `backend/.env`

```env
# Gere uma chave segura em: https://djecrety.ir/
SECRET_KEY=sua-chave-super-secreta-de-50-caracteres-randomica-aqui

# Produção
DEBUG=False
ALLOWED_HOSTS=seudominio.com,www.seudominio.com,api.seudominio.com

# SSL
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=31536000

# CORS
CORS_ALLOWED_ORIGINS=https://seudominio.com,https://www.seudominio.com
```

---

### 2. Banco de Dados (OBRIGATÓRIO) - 10 minutos

**SQLite → PostgreSQL**

```env
# Opção A: Neon.tech (Gratuito, Recomendado)
DATABASE_URL=postgresql://usuario:senha@ep-xxx.neon.tech/neondb?sslmode=require

# Opção B: Supabase (Gratuito)
DATABASE_URL=postgresql://postgres:senha@db.xxx.supabase.co:5432/postgres

# Opção C: Railway (Pago mas simples)
DATABASE_URL=postgresql://postgres:senha@containers-us-west-xxx.railway.app:5432/railway
```

**Depois de configurar:**
```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
```

---

### 3. Email (RECOMENDADO) - 10 minutos

**Arquivo:** `backend/.env`

#### Opção A: Gmail (Gratuito, Mais Simples)

1. Ativar verificação em 2 etapas: https://myaccount.google.com/security
2. Criar App Password: https://myaccount.google.com/apppasswords
3. Configurar:

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seu-email@gmail.com
EMAIL_HOST_PASSWORD=xxxx-xxxx-xxxx-xxxx  # App Password (16 dígitos)
DEFAULT_FROM_EMAIL=noreply@seudominio.com
FRONTEND_URL=https://seudominio.com
```

#### Opção B: SendGrid (Profissional)

1. Criar conta gratuita: https://sendgrid.com/ (100 emails/dia grátis)
2. Criar API Key
3. Configurar:

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=SG.xxxxxxxxxxxx  # API Key do SendGrid
DEFAULT_FROM_EMAIL=noreply@seudominio.com
FRONTEND_URL=https://seudominio.com
```

**Sem configuração:** Emails aparecem no terminal (ok para desenvolvimento)

---

### 4. Deploy Backend (OBRIGATÓRIO) - 30-60 minutos

#### Opção A: Railway (Mais Simples, Recomendado)

1. Criar conta: https://railway.app/
2. New Project → Deploy from GitHub
3. Selecionar repositório
4. Configurar variáveis de ambiente:
   - Copiar todo o `.env` de produção
   - Railway cria PostgreSQL automaticamente
5. Deploy automático!

**URL gerada:** `https://seu-app.up.railway.app`

#### Opção B: Render (Gratuito)

1. Criar conta: https://render.com/
2. New Web Service → Connect GitHub
3. Configurar:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn config.wsgi:application`
4. Adicionar PostgreSQL (gratuito)
5. Configurar variáveis de ambiente

**URL gerada:** `https://seu-app.onrender.com`

#### Opção C: DigitalOcean App Platform

1. Criar conta: https://www.digitalocean.com/
2. App Platform → Create App
3. Conectar GitHub
4. Deploy automático

**Custo:** ~$5/mês

---

### 5. Deploy Frontend (OBRIGATÓRIO) - 15 minutos

#### Opção A: Vercel (Recomendado)

1. Criar conta: https://vercel.com/
2. Import Git Repository
3. Framework Preset: **Next.js**
4. Configurar variável de ambiente:
   ```
   NEXT_PUBLIC_API_URL=https://seu-backend.railway.app
   ```
5. Deploy automático!

**URL gerada:** `https://seu-app.vercel.app`

#### Opção B: Netlify

1. Criar conta: https://netlify.com/
2. Add New Site → Import from Git
3. Build Settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Deploy!

**URL gerada:** `https://seu-app.netlify.app`

---

### 6. Domínio Personalizado (OPCIONAL) - 30 minutos

1. **Comprar domínio:**
   - Registro.br (Brasil): ~R$40/ano
   - Namecheap: ~$10/ano
   - GoDaddy: ~$15/ano

2. **Configurar DNS:**

   **Frontend (Vercel/Netlify):**
   ```
   Tipo: A
   Nome: @
   Valor: [IP fornecido pela plataforma]
   
   Tipo: CNAME
   Nome: www
   Valor: seu-app.vercel.app
   ```

   **Backend (Railway/Render):**
   ```
   Tipo: CNAME
   Nome: api
   Valor: seu-app.railway.app
   ```

3. **Aguardar propagação:** 1-24 horas

4. **Atualizar variáveis:**
   ```env
   # Backend
   ALLOWED_HOSTS=api.seudominio.com
   CORS_ALLOWED_ORIGINS=https://seudominio.com
   
   # Frontend
   NEXT_PUBLIC_API_URL=https://api.seudominio.com
   ```

---

## 🟢 FUNCIONALIDADES OPCIONAIS (Quando Quiser)

### Login Social (Google/Microsoft)

**Status:** Código já implementado, só falta configurar OAuth apps

**Quando configurar:**
1. Siga o guia: `docs/LOGIN_SOCIAL_SETUP.md`
2. Configure no Google Cloud Console / Azure Portal
3. Adicione credenciais no `.env`

**Tempo:** 30-60 minutos por provider

**Importante:** Sistema funciona perfeitamente sem isso!

---

## 📋 CHECKLIST RÁPIDO

### Desenvolvimento (Agora)
- [x] Backend funcionando (localhost:8000)
- [x] Frontend funcionando (localhost:3000)
- [x] Login tradicional
- [x] Todos os módulos
- [x] Emails no terminal

### Produção (Quando Publicar)
- [ ] Gerar SECRET_KEY segura
- [ ] Configurar DEBUG=False
- [ ] Migrar para PostgreSQL
- [ ] Configurar CORS para domínio real
- [ ] Configurar email SMTP (Gmail ou SendGrid)
- [ ] Deploy backend (Railway/Render)
- [ ] Deploy frontend (Vercel)
- [ ] Testar tudo em produção

### Opcional
- [ ] Comprar domínio personalizado
- [ ] Configurar DNS
- [ ] Configurar OAuth (Google/Microsoft)
- [ ] Adicionar monitoramento (Sentry)
- [ ] Configurar backups automáticos

---

## 🆘 TROUBLESHOOTING

### "CORS error" no frontend
```env
# Backend: .env
CORS_ALLOWED_ORIGINS=https://seu-dominio-frontend.vercel.app
```

### "Database connection error"
```env
# Verificar DATABASE_URL
# Testar conexão: python manage.py dbshell
```

### "Email not sending"
```env
# Verificar configurações SMTP
# Testar: python manage.py shell
# >>> from django.core.mail import send_mail
# >>> send_mail('Test', 'Body', 'from@example.com', ['to@example.com'])
```

### "Static files not loading"
```bash
# Backend
python manage.py collectstatic

# Frontend
npm run build
```

---

## 🎯 RESUMO

### Para usar AGORA (desenvolvimento):
✅ **NADA!** Já está funcionando!

### Para colocar em PRODUÇÃO:
1. ⏱️ Configurar segurança (5 min)
2. ⏱️ Migrar PostgreSQL (10 min)
3. ⏱️ Deploy backend (30 min)
4. ⏱️ Deploy frontend (15 min)
5. ⏱️ Configurar email (10 min) - opcional
6. ⏱️ Testar tudo (30 min)

**Total:** ~2 horas

### Para adicionar login social:
⏱️ ~1 hora (totalmente opcional)

---

## 📞 LINKS ÚTEIS

- **Railway:** https://railway.app/
- **Vercel:** https://vercel.com/
- **Neon DB:** https://neon.tech/
- **SendGrid:** https://sendgrid.com/
- **SECRET_KEY Generator:** https://djecrety.ir/
- **Google OAuth:** https://console.cloud.google.com/
- **Microsoft OAuth:** https://portal.azure.com/

---

**🎉 Seu sistema está pronto! Só falta configurar a produção quando quiser publicar!**
