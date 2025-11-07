# 🛠️ CORREÇÃO: Erro 400 no PDV

## Problema Identificado

O erro 400 estava ocorrendo porque:
1. Alguns produtos não têm o campo `stock_quantity` (criados antes da migração)
2. O backend tentava acessar esse campo sem proteção
3. Causava erro ao validar estoque e ao atualizar após venda

## Correções Aplicadas

### 1. Script de Correção de Dados
Criado `backend/scripts/fix_stock_quantity.py` para adicionar `stock_quantity=0` em produtos antigos.

### 2. Proteção no Serializer
- Usa `getattr(product, 'stock_quantity', 0)` em vez de acesso direto
- Garante que funciona mesmo se o campo não existir
- Aplicado em 2 lugares: validação de estoque e atualização após venda

### 3. Log Melhorado no Frontend
- Mostra JSON completo do erro em `console.error`
- Facilita diagnóstico de problemas futuros

## Como Testar

### 1. Corrigir Produtos no Backend Local

```bash
cd backend
python scripts/fix_stock_quantity.py
```

### 2. Testar Localmente

```bash
# Terminal 1 - Backend
cd backend
python manage.py runserver

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Acesse http://localhost:3000/dashboard/pos e teste uma venda.

### 3. Deploy para Produção

```bash
# Commit e push
git add .
git commit -m "fix: adiciona proteção para products sem stock_quantity no PDV"
git push origin main
```

### 4. Corrigir Produtos na Produção

**Opção A: Via Railway Shell**
1. Acesse https://railway.app/dashboard
2. Selecione seu projeto → Backend
3. Clique em "Shell"
4. Execute:
```bash
python scripts/fix_stock_quantity.py
```

**Opção B: Via Railway CLI**
```bash
railway run python backend/scripts/fix_stock_quantity.py
```

### 5. Verificar Correção

1. Abra o PDV em produção
2. Adicione um produto ao carrinho
3. Finalize a venda
4. Verifique no console do navegador:
   - ✅ Deve aparecer sucesso
   - ✅ Não deve aparecer erro 400

## O Que Foi Modificado

### `backend/pos/serializers.py`
- Linha ~77: `stock = getattr(product, 'stock_quantity', 0)`
- Linha ~133: `current_stock = getattr(product, 'stock_quantity', 0)`

### `frontend/app/dashboard/pos/page.tsx`
- Linha ~173: Log mais detalhado com `JSON.stringify`

### `backend/scripts/fix_stock_quantity.py`
- Novo script para corrigir produtos sem `stock_quantity`

## Próximos Passos

Após o deploy:
1. Execute o script de correção na produção
2. Teste uma venda no PDV
3. Verifique se o estoque é atualizado corretamente
4. Monitore logs do Railway para outros possíveis erros
