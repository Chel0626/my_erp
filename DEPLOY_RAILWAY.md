# 🚀 Guia de Deploy - Railway

## ⚠️ PROBLEMA IDENTIFICADO

O erro `400 Bad Request` no POST de vendas indica que **o backend em produção está desatualizado**.

### Erro Atual
```
POST https://myerp-production-4bb9.up.railway.app/api/pos/sales/ 400 (Bad Request)
```

**Causa**: O backend em produção ainda usa `product.stock` (código antigo), mas corrigimos para `product.stock_quantity` no commit `4c877bae`.

## 📋 Checklist de Deploy

### 1. Verificar Branch Atual
```bash
git status
git log --oneline -5
```

Deve mostrar:
```
5569f145 - fix: select serviço comissões
dc3f8e29 - feat: PDV busca Combobox
4c877bae - fix: PDV erro estoque  ← COMMIT CRÍTICO!
```

### 2. Backend - Railway

#### Opção A: Deploy Automático (se configurado)
- Railway faz deploy automático ao detectar push na branch `main`
- Verifique no dashboard: https://railway.app/dashboard
- Aguarde o build completar (5-10 minutos)

#### Opção B: Deploy Manual
1. Acesse Railway Dashboard
2. Selecione o projeto `myerp-backend`
3. Vá em **Settings** → **Deployments**
4. Clique em **Deploy** ou **Redeploy**

#### Verificar Logs
```bash
# No Railway Dashboard
- Vá em "Deployments"
- Clique no deployment ativo
- Veja "View Logs"
```

Procure por:
```
✅ Sentry inicializado
System check identified no issues
Starting development server...
```

### 3. Frontend - Vercel/Railway

Se o frontend também está no Railway:
1. Verifique se o build automático rodou
2. Se não, force um novo deploy
3. Confirme que `NEXT_PUBLIC_API_URL` aponta para o backend correto

### 4. Migrações do Banco

⚠️ **IMPORTANTE**: Se houver migrações pendentes:

```bash
# No Railway, via CLI ou Dashboard Shell:
python manage.py migrate
```

## 🔍 Debugging

### Verificar Versão do Backend em Produção

Faça uma requisição teste:
```bash
curl https://myerp-production-4bb9.up.railway.app/api/health/
```

Ou adicione um endpoint de versão no Django:
```python
# backend/core/views.py
@api_view(['GET'])
def version(request):
    return Response({
        'version': '1.0.0',
        'last_commit': '5569f145',  # Atualizar após cada deploy
        'deployed_at': timezone.now()
    })
```

### Testar Endpoint de Vendas

```bash
# Obter token primeiro
curl -X POST https://myerp-production-4bb9.up.railway.app/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@exemplo.com","password":"senha123"}'

# Testar criação de venda
curl -X POST https://myerp-production-4bb9.up.railway.app/api/pos/sales/ \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

## 📝 Variáveis de Ambiente

Confirme que estão configuradas no Railway:

### Backend
```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
SECRET_KEY=...
DEBUG=False
ALLOWED_HOSTS=myerp-production-4bb9.up.railway.app
CORS_ALLOWED_ORIGINS=https://seu-frontend.vercel.app
SENTRY_DSN=...
```

### Frontend
```env
NEXT_PUBLIC_API_URL=https://myerp-production-4bb9.up.railway.app/api
```

## ✅ Validação Pós-Deploy

1. **Login**: Teste autenticação
2. **Dashboard**: Verifique se carrega dados
3. **PDV**: 
   - Abra o caixa
   - Adicione produtos (verifique estoque)
   - Finalize uma venda ← **TESTE CRÍTICO**
4. **Comissões**: Verifique select de serviços
5. **Downloads**: Teste exportações PDF/CSV

## 🐛 Se Ainda Houver Erros

### Erro 400 persiste?
```bash
# Verificar se migrations rodaram
python manage.py showmigrations

# Aplicar migrations
python manage.py migrate
```

### Erro 500?
- Verifique logs do Railway
- Confirme `DEBUG=False` e `ALLOWED_HOSTS` corretos
- Verifique conexão com banco de dados

### Erro 401 em /api/core/users/me/?
- Normal se não estiver logado
- Faça login primeiro na interface

## 📞 Comandos Úteis Railway CLI

```bash
# Instalar CLI
npm i -g @railway/cli

# Login
railway login

# Listar projetos
railway list

# Ver logs
railway logs

# SSH no container (se disponível)
railway shell

# Rodar comando
railway run python manage.py migrate
```

## 🎯 Resumo Rápido

**O que fazer AGORA:**
1. ✅ Código já está no GitHub (commits feitos)
2. 🔄 Railway deve fazer deploy automático
3. ⏳ Aguardar build completar (5-10 min)
4. ✅ Testar PDV em produção
5. 🎉 Sistema atualizado!

Se o deploy automático não estiver configurado, faça deploy manual pelo Dashboard do Railway.
