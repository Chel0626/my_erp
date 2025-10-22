# 🚀 Guia Completo de Migração para Produção (PostgreSQL + AWS)

## 📋 Índice

1. [Preparação do Ambiente Local](#1-preparação-do-ambiente-local)
2. [Migração SQLite → PostgreSQL](#2-migração-sqlite--postgresql)
3. [Configuração do AWS RDS (PostgreSQL)](#3-configuração-do-aws-rds-postgresql)
4. [Deploy do Backend (AWS Elastic Beanstalk ou ECS)](#4-deploy-do-backend)
5. [Deploy do Frontend (Vercel ou Amplify)](#5-deploy-do-frontend)
6. [Configuração de Domínio e SSL](#6-configuração-de-domínio-e-ssl)
7. [Monitoramento e Backup](#7-monitoramento-e-backup)
8. [Checklist Final](#8-checklist-final)

---

## 1. Preparação do Ambiente Local

### 1.1. Instalar PostgreSQL Localmente

```bash
# Windows
# Baixar instalador: https://www.postgresql.org/download/windows/
# Ou usar Chocolatey
choco install postgresql

# Linux (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Mac
brew install postgresql
```

### 1.2. Instalar Dependências Python

```bash
cd backend
pip install psycopg2-binary python-decouple dj-database-url whitenoise boto3 django-storages
pip freeze > requirements.txt
```

### 1.3. Criar Arquivo .env para Produção

```bash
# backend/.env.production
DEBUG=False
SECRET_KEY=<gerar-chave-secreta-forte>
ALLOWED_HOSTS=.seu-dominio.com,.elasticbeanstalk.com

# Database
DATABASE_URL=postgresql://usuario:senha@localhost:5432/nome_do_banco

# Email (SendGrid ou Gmail)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=<sua-chave-sendgrid>
DEFAULT_FROM_EMAIL=contato@seu-dominio.com

# Frontend URL
FRONTEND_URL=https://seu-dominio.com

# AWS S3 (para arquivos estáticos e media)
USE_S3=True
AWS_ACCESS_KEY_ID=<sua-chave-acesso>
AWS_SECRET_ACCESS_KEY=<sua-chave-secreta>
AWS_STORAGE_BUCKET_NAME=seu-bucket-erp
AWS_S3_REGION_NAME=us-east-1
AWS_S3_CUSTOM_DOMAIN=seu-bucket-erp.s3.amazonaws.com

# Social Auth
GOOGLE_CLIENT_ID=<seu-client-id-google>
GOOGLE_CLIENT_SECRET=<seu-client-secret-google>
MICROSOFT_CLIENT_ID=<seu-client-id-microsoft>
MICROSOFT_CLIENT_SECRET=<seu-client-secret-microsoft>
```

**Gerar SECRET_KEY:**

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

## 2. Migração SQLite → PostgreSQL

### 2.1. Backup do Banco SQLite

```bash
cd backend
python manage.py dumpdata --natural-foreign --natural-primary \
  --exclude auth.permission --exclude contenttypes \
  --exclude sessions.session > backup_sqlite.json
```

### 2.2. Criar Banco PostgreSQL Local

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco e usuário
CREATE DATABASE erp_barbearia;
CREATE USER erp_user WITH PASSWORD 'senha_forte_aqui';
ALTER ROLE erp_user SET client_encoding TO 'utf8';
ALTER ROLE erp_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE erp_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE erp_barbearia TO erp_user;
\q
```

### 2.3. Configurar Django para PostgreSQL

**backend/config/settings.py:**

```python
from decouple import config
import dj_database_url

# ...

DATABASES = {
    'default': dj_database_url.parse(
        config('DATABASE_URL'),
        conn_max_age=600,
        conn_health_checks=True,
    )
}
```

### 2.4. Executar Migrações e Importar Dados

```bash
# Atualizar .env com DATABASE_URL do PostgreSQL local
DATABASE_URL=postgresql://erp_user:senha_forte_aqui@localhost:5432/erp_barbearia

# Executar migrações
python manage.py migrate

# Importar dados
python manage.py loaddata backup_sqlite.json

# Verificar
python manage.py shell
>>> from core.models import User, Tenant
>>> User.objects.count()
>>> Tenant.objects.count()
```

### 2.5. Testar Localmente

```bash
python manage.py runserver
# Acessar http://localhost:8000 e testar todas as funcionalidades
```

---

## 3. Configuração do AWS RDS (PostgreSQL)

### 3.1. Criar RDS PostgreSQL

1. **Acessar Console AWS** → RDS → Create database

2. **Configurações:**
   - Engine: PostgreSQL 15.x
   - Templates: Production (ou Dev/Test para economizar)
   - DB instance identifier: `erp-barbearia-prod`
   - Master username: `erp_admin`
   - Master password: (senha forte, anotar!)
   - DB instance class: 
     - Pequeno: `db.t3.micro` (free tier)
     - Médio: `db.t3.small`
     - Grande: `db.t3.medium`
   - Storage: 20GB (Auto Scaling habilitado)
   - VPC: Default (ou criar VPC personalizada)
   - Public access: Yes (para desenvolvimento) / No (produção com VPN)
   - VPC security group: Criar novo ou usar existente
   - Database name: `erp_barbearia`

3. **Security Group:**
   - Adicionar regra de entrada:
     - Type: PostgreSQL
     - Protocol: TCP
     - Port: 5432
     - Source: 
       - 0.0.0.0/0 (temporário para testes)
       - Ou IP específico do Elastic Beanstalk/ECS

4. **Anotar Endpoint:**
   - Exemplo: `erp-barbearia-prod.xxxxx.us-east-1.rds.amazonaws.com`

### 3.2. Conectar ao RDS e Criar Banco

```bash
# Instalar cliente PostgreSQL
psql -h erp-barbearia-prod.xxxxx.us-east-1.rds.amazonaws.com \
     -U erp_admin -d postgres

# Criar banco
CREATE DATABASE erp_barbearia;
\q
```

### 3.3. Migrar Dados para RDS

```bash
# Atualizar .env
DATABASE_URL=postgresql://erp_admin:senha@erp-barbearia-prod.xxxxx.us-east-1.rds.amazonaws.com:5432/erp_barbearia

# Executar migrações
python manage.py migrate

# Importar dados
python manage.py loaddata backup_sqlite.json
```

### 3.4. Configurar Backup Automático

- **Console RDS** → Database → Modify
- Backup retention period: 7 dias (mínimo)
- Backup window: Horário de menor uso
- Habilitar deletion protection

---

## 4. Deploy do Backend

### Opção A: AWS Elastic Beanstalk (Recomendado para iniciantes)

#### 4.1. Instalar EB CLI

```bash
pip install awsebcli
eb --version
```

#### 4.2. Criar Configuração EB

**backend/.ebextensions/01_django.config:**

```yaml
option_settings:
  aws:elasticbeanstalk:container:python:
    WSGIPath: config.wsgi:application
  aws:elasticbeanstalk:application:environment:
    DJANGO_SETTINGS_MODULE: config.settings
    PYTHONPATH: /var/app/current:$PYTHONPATH
  aws:elasticbeanstalk:environment:proxy:staticfiles:
    /static: staticfiles

container_commands:
  01_migrate:
    command: "source /var/app/venv/*/bin/activate && python manage.py migrate --noinput"
    leader_only: true
  02_collectstatic:
    command: "source /var/app/venv/*/bin/activate && python manage.py collectstatic --noinput"
    leader_only: true
```

**backend/.platform/nginx/conf.d/proxy.conf:**

```nginx
client_max_body_size 20M;
```

#### 4.3. Inicializar e Deploy

```bash
cd backend
eb init -p python-3.11 erp-backend --region us-east-1
eb create erp-prod --single
eb setenv $(cat .env.production | xargs)
eb deploy
```

#### 4.4. Configurar Domínio

```bash
# Obter URL do EB
eb status

# Configurar CNAME no seu domínio apontando para:
# erp-prod.xxxxx.us-east-1.elasticbeanstalk.com
```

---

### Opção B: AWS ECS (Para maior controle)

#### 4.1. Criar Dockerfile

**backend/Dockerfile:**

```dockerfile
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependências Python
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copiar código
COPY . .

# Coletar arquivos estáticos
RUN python manage.py collectstatic --noinput

# Expor porta
EXPOSE 8000

# Comando de inicialização
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]
```

**backend/requirements.txt (adicionar):**

```txt
gunicorn==21.2.0
```

#### 4.2. Criar Task Definition

```json
{
  "family": "erp-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "django",
      "image": "<sua-conta>.dkr.ecr.us-east-1.amazonaws.com/erp-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "DEBUG", "value": "False"},
        {"name": "DATABASE_URL", "value": "postgresql://..."}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/erp-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### 4.3. Deploy ECS

```bash
# Build e push para ECR
aws ecr create-repository --repository-name erp-backend
$(aws ecr get-login --no-include-email)
docker build -t erp-backend .
docker tag erp-backend:latest <sua-conta>.dkr.ecr.us-east-1.amazonaws.com/erp-backend:latest
docker push <sua-conta>.dkr.ecr.us-east-1.amazonaws.com/erp-backend:latest

# Criar cluster
aws ecs create-cluster --cluster-name erp-cluster

# Criar serviço
aws ecs create-service --cluster erp-cluster \
  --service-name erp-backend-service \
  --task-definition erp-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE
```

---

## 5. Deploy do Frontend

### Opção A: Vercel (Recomendado)

#### 5.1. Instalar Vercel CLI

```bash
npm install -g vercel
```

#### 5.2. Configurar Variáveis de Ambiente

**frontend/.env.production:**

```env
NEXT_PUBLIC_API_URL=https://api.seu-dominio.com
```

#### 5.3. Deploy

```bash
cd frontend
vercel --prod

# Ou conectar repositório GitHub ao Vercel
# https://vercel.com → Import Git Repository
```

---

### Opção B: AWS Amplify

#### 5.1. Conectar Repositório

1. Console AWS → Amplify → New app → Host web app
2. Conectar GitHub/GitLab
3. Selecionar repositório e branch

#### 5.2. Build Settings

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/.next
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
```

#### 5.3. Variáveis de Ambiente

- NEXT_PUBLIC_API_URL: https://api.seu-dominio.com

---

## 6. Configuração de Domínio e SSL

### 6.1. AWS Route 53

1. **Registrar domínio** (se ainda não tiver)
   - Route 53 → Registered domains → Register domain

2. **Criar Hosted Zone**
   - Route 53 → Hosted zones → Create

3. **Criar Records:**
   - **A record (backend):**
     - Name: api.seu-dominio.com
     - Type: A - IPv4 address
     - Value: Alias para ALB/EB
   
   - **CNAME record (frontend):**
     - Name: www.seu-dominio.com
     - Type: CNAME
     - Value: seu-app.vercel.app

### 6.2. AWS Certificate Manager (SSL)

1. **Request Certificate**
   - ACM → Request certificate
   - Domain names:
     - seu-dominio.com
     - *.seu-dominio.com (wildcard)
   - Validation: DNS validation

2. **Adicionar CNAME no Route 53**
   - Copiar CNAME do ACM
   - Criar record no Route 53

3. **Associar ao Load Balancer/EB**
   - EB → Configuration → Load balancer → Add listener
   - Port: 443
   - Protocol: HTTPS
   - SSL certificate: Selecionar o criado

### 6.3. Forçar HTTPS

**backend/config/settings.py:**

```python
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
```

---

## 7. Monitoramento e Backup

### 7.1. AWS CloudWatch

**Criar Alarmes:**

```bash
# CPU alta
aws cloudwatch put-metric-alarm \
  --alarm-name erp-high-cpu \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --metric-name CPUUtilization \
  --namespace AWS/RDS \
  --period 300 \
  --statistic Average \
  --threshold 80.0 \
  --alarm-actions arn:aws:sns:us-east-1:xxxxx:alerts

# Conexões de banco
aws cloudwatch put-metric-alarm \
  --alarm-name erp-db-connections \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --metric-name DatabaseConnections \
  --namespace AWS/RDS \
  --period 60 \
  --statistic Average \
  --threshold 80
```

### 7.2. Application Monitoring (Sentry)

```bash
# Instalar
pip install sentry-sdk

# backend/config/settings.py
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn="https://xxxxx@sentry.io/xxxxx",
    integrations=[DjangoIntegration()],
    traces_sample_rate=1.0,
    send_default_pii=True,
    environment="production"
)
```

### 7.3. Backup Automático

**Script de backup (backup_db.sh):**

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_$DATE.sql"

pg_dump -h erp-barbearia-prod.xxxxx.rds.amazonaws.com \
        -U erp_admin \
        -d erp_barbearia \
        -F c \
        -f $BACKUP_FILE

# Upload para S3
aws s3 cp $BACKUP_FILE s3://seu-bucket-backups/database/

# Manter apenas últimos 30 dias
aws s3 ls s3://seu-bucket-backups/database/ | \
  while read -r line; do
    createDate=`echo $line | awk {'print $1" "$2'}`
    createDate=`date -d"$createDate" +%s`
    olderThan=`date -d "-30 days" +%s`
    if [[ $createDate -lt $olderThan ]]; then
      fileName=`echo $line | awk {'print $4'}`
      aws s3 rm s3://seu-bucket-backups/database/$fileName
    fi
  done
```

**Agendar no cron:**

```bash
crontab -e
# Backup diário às 3h
0 3 * * * /home/ubuntu/backup_db.sh
```

---

## 8. Checklist Final

### ✅ Segurança

- [ ] `DEBUG=False` em produção
- [ ] `SECRET_KEY` forte e única
- [ ] `ALLOWED_HOSTS` configurado
- [ ] HTTPS habilitado (SSL/TLS)
- [ ] CORS configurado corretamente
- [ ] Security groups AWS limitados
- [ ] Senhas de banco fortes
- [ ] Backup automático habilitado
- [ ] Monitoramento de erros (Sentry)
- [ ] Rate limiting configurado

### ✅ Banco de Dados

- [ ] PostgreSQL RDS criado
- [ ] Backup retention configurado (7 dias mínimo)
- [ ] Dados migrados do SQLite
- [ ] Conexões testadas
- [ ] Índices otimizados
- [ ] Multi-AZ habilitado (opcional, para alta disponibilidade)

### ✅ Backend

- [ ] Deploy no EB/ECS funcionando
- [ ] Migrações executadas
- [ ] Arquivos estáticos no S3
- [ ] Logs configurados (CloudWatch)
- [ ] Health checks funcionando
- [ ] Auto-scaling configurado
- [ ] Variáveis de ambiente definidas

### ✅ Frontend

- [ ] Deploy no Vercel/Amplify
- [ ] Variáveis de ambiente configuradas
- [ ] Build funcionando sem erros
- [ ] API_URL apontando para backend
- [ ] Cache configurado
- [ ] CDN habilitado

### ✅ Domínio e SSL

- [ ] Domínio registrado
- [ ] DNS configurado (Route 53)
- [ ] Certificado SSL criado (ACM)
- [ ] HTTPS forçado
- [ ] Redirecionamento www → não-www (ou vice-versa)

### ✅ Email

- [ ] SMTP configurado (SendGrid/Gmail)
- [ ] Templates testados
- [ ] Convites funcionando
- [ ] Confirmações de agendamento funcionando

### ✅ Monitoramento

- [ ] CloudWatch alarmes criados
- [ ] Sentry configurado
- [ ] Logs centralizados
- [ ] Uptime monitoring (UptimeRobot/Pingdom)

### ✅ Performance

- [ ] Queries otimizadas (Django Debug Toolbar testado)
- [ ] Cache configurado (Redis/Memcached)
- [ ] CDN para arquivos estáticos
- [ ] Compressão habilitada
- [ ] Images otimizadas

---

## 💰 Estimativa de Custos AWS (Mensal)

| Serviço | Configuração | Custo Estimado |
|---------|-------------|----------------|
| **RDS PostgreSQL** | db.t3.micro (free tier) | $0 - $15 |
| **RDS PostgreSQL** | db.t3.small | $30 - $50 |
| **Elastic Beanstalk** | t3.micro (free tier) | $0 - $10 |
| **S3** | 10GB storage + requests | $1 - $5 |
| **Route 53** | Hosted zone + queries | $1 - $2 |
| **Certificate Manager** | SSL certificates | **GRÁTIS** |
| **CloudWatch** | Logs + metrics | $5 - $10 |
| **Data Transfer** | 100GB/mês | $5 - $10 |
| **TOTAL (Small)** | Free tier | **$10 - $20/mês** |
| **TOTAL (Medium)** | Produção | **$50 - $100/mês** |

**Nota:** Vercel/Amplify podem ter custos adicionais ($20-$50/mês para plans profissionais).

---

## 🚨 Problemas Comuns

### Erro de Conexão RDS

```bash
# Verificar security group
aws ec2 describe-security-groups --group-ids sg-xxxxx

# Testar conexão
telnet erp-barbearia-prod.xxxxx.rds.amazonaws.com 5432
```

### Build do EB Falhando

```bash
# Ver logs
eb logs

# SSH no servidor
eb ssh

# Verificar variáveis de ambiente
eb printenv
```

### Erro de CORS

**backend/config/settings.py:**

```python
CORS_ALLOWED_ORIGINS = [
    "https://seu-dominio.com",
    "https://www.seu-dominio.com",
]
```

### Arquivos Estáticos Não Carregam

```bash
# Coletar novamente
python manage.py collectstatic --clear --noinput

# Verificar S3 bucket policy
aws s3api get-bucket-policy --bucket seu-bucket-erp
```

---

## 📚 Recursos Adicionais

- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)

---

**Dúvidas?** Entre em contato ou abra uma issue no repositório!
