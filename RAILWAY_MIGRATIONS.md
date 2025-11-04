# Como Executar Migrações no Railway

## Problema
Os endpoints de Goals estão retornando 404 em produção porque as migrations não foram aplicadas.

## Solução

### Opção 1: Via Railway CLI

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Fazer login
railway login

# Conectar ao projeto
railway link

# Executar migrations
railway run python backend/manage.py migrate goals
railway run python backend/manage.py migrate
```

### Opção 2: Via Dashboard do Railway

1. Acesse https://railway.app
2. Entre no projeto `my_erp`
3. Vá em **Settings** → **Deploy** → **Custom Start Command**
4. Temporariamente, altere o comando de start para:
   ```
   cd backend && python manage.py migrate && gunicorn config.wsgi:application
   ```
5. Faça um novo deploy (ou force rebuild)
6. Depois que as migrations rodarem, pode remover o `migrate` do comando se quiser

### Opção 3: Via Terminal do Railway (Web)

1. No dashboard do Railway
2. Clique no serviço backend
3. Vá na aba **Metrics** ou **Deployments**
4. Procure por "Shell" ou "Terminal" (ícone >_)
5. Execute:
   ```bash
   cd backend
   python manage.py migrate goals
   python manage.py showmigrations goals
   ```

## Verificar se Funcionou

Após rodar as migrations, teste os endpoints:

```bash
curl https://myerp-production-4bb9.up.railway.app/api/goals/dashboard/
curl https://myerp-production-4bb9.up.railway.app/api/goals/compare_periods/
```

Ambos devem retornar 200 (não 404).
