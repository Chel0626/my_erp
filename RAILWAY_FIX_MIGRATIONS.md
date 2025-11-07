# 🚨 CORREÇÃO URGENTE - Migrations no Railway

## ❌ PROBLEMA IDENTIFICADO

```
Your models in app(s): 'goals', 'inventory', 'pos' have changes that are not yet reflected in a migration
```

**Causa**: O modelo `Product` foi alterado mas as migrations não foram criadas/aplicadas.

## ✅ SOLUÇÃO - Execute estes comandos

### Opção 1: Via Railway Dashboard (Recomendado)

1. **Acesse Railway Dashboard**
   - https://railway.app/dashboard
   - Selecione seu projeto backend

2. **Abra o Shell/Terminal**
   - Procure por "Shell" ou "Terminal" no menu
   - Ou vá em **Settings** → **Deploy**

3. **Execute os comandos**:

```bash
# 1. Criar migrations
python manage.py makemigrations

# 2. Aplicar migrations
python manage.py migrate

# 3. Verificar se aplicou
python manage.py showmigrations
```

### Opção 2: Via Railway CLI

```bash
# Instalar CLI (se ainda não tem)
npm install -g @railway/cli

# Login
railway login

# Linkar ao projeto
railway link

# Executar comandos
railway run python manage.py makemigrations
railway run python manage.py migrate
```

### Opção 3: Localmente e Push

Se as migrations já existem localmente mas não foram commitadas:

```bash
# No seu computador
cd c:\Users\carol\my_erp\backend

# Ver se há migrations não commitadas
git status

# Se houver arquivos em */migrations/, adicione-os
git add */migrations/*.py
git commit -m "feat: adiciona migrations para correção de estoque"
git push origin main

# Aguarde Railway fazer deploy automático
# OU force redeploy no dashboard
```

## 🔍 VERIFICAÇÃO

Após executar os comandos, os logs devem mostrar:

```
✅ Running migrations:
  Applying inventory.XXXX_alter_product_stock... OK
  Applying pos.XXXX_fix_stock_field... OK
```

## ⚠️ SE DER ERRO

### Erro: "No changes detected"

Significa que as migrations já existem. Apenas rode:
```bash
python manage.py migrate
```

### Erro: "Table already exists"

Use `--fake` para marcar como aplicada sem executar:
```bash
python manage.py migrate --fake-initial
```

### Erro de permissão no banco

Verifique se a variável `DATABASE_URL` está correta no Railway.

## 🎯 APÓS APLICAR MIGRATIONS

1. ✅ Verifique se o backend reiniciou
2. ✅ Os logs devem mostrar: `No migrations to apply`
3. ✅ Teste criar venda no PDV
4. 🎉 Erro 400 deve sumir!

## 📝 IMPORTANTE

**SEMPRE** que modificar um modelo Django:
1. Criar migration: `python manage.py makemigrations`
2. Commitar: `git add */migrations/*.py`
3. Push: `git push origin main`
4. Railway aplica automaticamente (se configurado)

---

## 🆘 PRECISA DE AJUDA?

Se os comandos acima não funcionarem, me avise com:
1. Output completo dos comandos
2. Logs do Railway
3. Mensagens de erro
