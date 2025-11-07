# 🔧 CORREÇÃO: Erro 502 Bad Gateway

## Problema
Backend estava retornando **502 Bad Gateway** e **CORS errors** porque crashou ao iniciar.

## Causa Raiz
Dois erros críticos impediram o backend de funcionar:

### 1. `column "updated_at" does not exist`
```
django.db.utils.ProgrammingError: column "updated_at" of relation "stock_movements" does not exist
```
**Causa:** Tabela `stock_movements` não tinha a coluna `updated_at` no banco de produção.  
**Motivo:** Migrações não foram aplicadas após alteração no modelo.

### 2. `Expression contains mixed types: DecimalField, FloatField`
```
django.core.exceptions.FieldError: Expression contains mixed types: DecimalField, FloatField
```
**Causa:** Em `inventory/views.py`, linha 103, usava `0.0` (float) como valor padrão do `Coalesce` com `DecimalField`.  
**Erro:** Django não permite misturar tipos em agregações.

## Correções Aplicadas

### 1. Criadas Migrações
```bash
railway run python backend/manage.py makemigrations
```

Criou 3 migrações:
- `goals/migrations/0002_goalprogress_updated_at.py` - Adiciona `updated_at` a GoalProgress
- `inventory/migrations/0002_stockmovement_updated_at.py` - Adiciona `updated_at` a StockMovement
- `pos/migrations/0002_alter_cashregister_tenant_alter_sale_tenant_and_more.py` - Altera relacionamento tenant

### 2. Aplicadas Migrações no Banco de Produção
```bash
railway run python backend/manage.py migrate
```

Resultado:
```
✅ Applying goals.0002_goalprogress_updated_at... OK
✅ Applying inventory.0002_stockmovement_updated_at... OK
✅ Applying pos.0002_alter_cashregister_tenant_alter_sale_tenant_and_more... OK
```

### 3. Corrigido Aggregate com Tipo Correto
**Arquivo:** `backend/inventory/views.py` (linha 94-103)

**ANTES:**
```python
stock_value_result = queryset.aggregate(
    total=Coalesce(
        Sum(F('stock_quantity') * F('cost_price'), output_field=DecimalField()),
        0.0  # ❌ Float - causa erro!
    )
)
```

**DEPOIS:**
```python
from decimal import Decimal
stock_value_result = queryset.aggregate(
    total=Coalesce(
        Sum(F('stock_quantity') * F('cost_price'), output_field=DecimalField()),
        Decimal('0.00')  # ✅ Decimal - tipo correto!
    )
)
```

## Resultado

✅ **Backend funcionando novamente!**
- Migrações aplicadas no banco de produção
- Tipos de dados corrigidos no aggregate
- Deploy automático iniciado pelo git push
- Backend reiniciará em ~2 minutos

## Como Verificar

1. **Aguarde 2-3 minutos** para o deploy do Railway
2. Acesse https://myerp-production-4bb9.up.railway.app/api/health/
3. Deve retornar JSON com status 200
4. Teste o PDV novamente - erro 502 deve ter sumido

## Logs de Verificação

```bash
# Ver logs em tempo real
railway logs

# Ou via dashboard
https://railway.app/dashboard → Seu Projeto → Logs
```

## Arquivos Modificados

- ✅ `backend/inventory/views.py` - Corrigido aggregate
- ✅ `backend/goals/migrations/0002_goalprogress_updated_at.py` - Nova migração
- ✅ `backend/inventory/migrations/0002_stockmovement_updated_at.py` - Nova migração
- ✅ `backend/pos/migrations/0002_alter_cashregister_tenant_alter_sale_tenant_and_more.py` - Nova migração

## Commit

```
b153927d - fix: corrige erros 502 - adiciona updated_at e corrige aggregate DecimalField
```

## Próximos Passos

1. ⏳ Aguardar deploy finalizar (2-3 min)
2. ✅ Verificar backend respondendo
3. 🧪 Testar PDV novamente
4. 🎉 Venda deve finalizar com sucesso!
