# 🔍 Como Usar o Sentry para Debug

## Por que o Sentry é Melhor que Logs

❌ **Logs do Railway:**
- Difícil de encontrar erros específicos
- Não mostra stack trace completo
- Não agrupa erros similares
- Desaparecem com restart

✅ **Sentry:**
- Stack trace completo com linha exata
- Contexto da requisição (URL, dados, headers)
- Agrupa erros similares automaticamente
- Histórico permanente
- Mostra quando o bug foi introduzido
- Notificações em tempo real

---

## 📊 Como Acessar

1. **Acesse:** https://sentry.io
2. **Login** com sua conta
3. **Selecione o projeto** (my-erp-backend)
4. **Vá para "Issues"**

---

## 🎯 Informações Que o Sentry Agora Mostra

Com as melhorias que acabamos de fazer, cada erro agora inclui:

### Tags (para filtrar facilmente):
- `server_type`: "django"
- `tenant_id`: ID do tenant que teve o erro
- `tenant_name`: Nome da empresa
- `http_method`: GET, POST, PUT, DELETE
- `http_status`: 200, 400, 500, etc
- `endpoint`: URL completa da requisição
- `request_type`: "api", "admin", "other"
- `api_module`: "pos", "inventory", "customers", etc

### Contexto Adicional:
- **User**: email, username, ID
- **Tenant**: ID, nome, plano
- **Request**: headers, body, query params
- **Environment**: development, production
- **Release**: versão do código (commit hash)

---

## 🔍 Como Investigar os Erros Atuais

### 1. Ver Todos os Erros Recentes
```
Issues → All
```

### 2. Filtrar por Tipo de Erro

**Erro 502 (updated_at):**
```
Buscar: "column updated_at does not exist"
ou
Tag: endpoint:contains("/api/inventory/")
```

**Erro 500 (aggregate):**
```
Buscar: "Expression contains mixed types"
ou
Tag: endpoint:"/api/inventory/products/summary/"
```

**Erro 400 (PDV):**
```
Tag: endpoint:"/api/pos/sales/"
Tag: http_status:400
```

### 3. Ver Timeline de um Erro

Para cada erro, o Sentry mostra:
- **Primeira vez** que aconteceu
- **Última vez** que aconteceu
- **Quantas vezes** aconteceu
- **Em qual release** foi introduzido
- **Quais usuários** foram afetados

### 4. Ver Stack Trace

Clique em um erro → Aba "Stack Trace"
- Mostra a linha EXATA do código
- Caminho completo do arquivo
- Variáveis locais no momento do erro

---

## 🚀 Filtros Úteis

### Ver erros apenas do PDV:
```
api_module:pos
```

### Ver erros apenas do Inventário:
```
api_module:inventory
```

### Ver erros de um tenant específico:
```
tenant_name:"Nome da Empresa"
```

### Ver erros de um usuário específico:
```
user.email:"usuario@email.com"
```

### Ver erros em produção:
```
environment:production
```

### Ver erros de uma release específica:
```
release:"fc5130f8"
```

---

## 📈 Verificar se as Correções Funcionaram

### Antes das correções:
1. Vá em Issues
2. Filtre por `endpoint:"/api/inventory/products/summary/"`
3. Veja quantos erros aconteceram

### Depois das correções:
1. Aguarde 5 minutos após o deploy
2. Recarregue a página do Sentry
3. Verifique se novos erros pararam de aparecer
4. Se não houver novos erros → ✅ Correção funcionou!

---

## 🔔 Configurar Alertas

1. **Project Settings** → **Alerts**
2. **Create Alert Rule**
3. Exemplos:
   - Alerta quando erro acontece > 10 vezes em 5 minutos
   - Alerta quando novo tipo de erro aparece
   - Alerta quando erro afeta > 5 usuários

---

## 🎯 Investigando Erro Específico

### Exemplo: Erro 500 no summary

1. **Issues** → Buscar "summary"
2. Clicar no erro
3. **Tabs importantes:**
   - **Overview**: Resumo, quantas vezes, quando
   - **Tags**: Filtros (tenant, endpoint, etc)
   - **Stack Trace**: Código exato onde falhou
   - **Breadcrumbs**: O que o usuário fez antes do erro
   - **Context**: Dados da requisição

4. **Ver detalhes:**
   - Request URL: `/api/inventory/products/summary/`
   - Request Method: `GET`
   - Request Headers: Token de autenticação
   - User: Qual usuário teve o erro
   - Tenant: Qual empresa

5. **Stack Trace mostra:**
```python
File "inventory/views.py", line 102, in summary
    stock_value_result = queryset.aggregate(
        total=Coalesce(
            Sum(F('stock_quantity') * F('cost_price'), output_field=DecimalField()),
            0.0  # ← AQUI ESTÁ O PROBLEMA!
        )
    )
```

---

## 💡 Melhorias Aplicadas

### 1. Contexto Automático
Agora cada erro no Sentry inclui automaticamente:
- Tenant (empresa)
- Usuário
- Endpoint
- Módulo da API
- Status HTTP

### 2. Ignorar Erros Esperados
Configuramos o Sentry para **não** reportar:
- Conexões resetadas (problema do cliente)
- Tokens expirados (comportamento normal)

### 3. Performance Monitoring
- 100% das transações em development
- 10% das transações em production (economia de cota)

---

## 📝 Como Reportar Erro Customizado

Se quiser adicionar logs customizados no código:

```python
import sentry_sdk

# Adicionar contexto extra
sentry_sdk.set_context("venda", {
    "total": 150.00,
    "items": 3,
    "payment_method": "credit_card"
})

# Adicionar tag personalizada
sentry_sdk.set_tag("venda_tipo", "grande")

# Capturar erro manualmente
try:
    # código que pode falhar
    pass
except Exception as e:
    sentry_sdk.capture_exception(e)
```

---

## ✅ Checklist: Investigando Erro

- [ ] Abrir Sentry → Issues
- [ ] Buscar pelo erro (endpoint ou mensagem)
- [ ] Verificar quando começou (primeira ocorrência)
- [ ] Ver quantas vezes aconteceu
- [ ] Ver stack trace (linha do código)
- [ ] Ver contexto (usuário, tenant, dados)
- [ ] Ver release que introduziu o bug
- [ ] Comparar com release anterior
- [ ] Reproduzir localmente
- [ ] Criar fix
- [ ] Deploy
- [ ] Verificar se parou de ocorrer no Sentry

---

## 🎉 Vantagens do Sentry

1. **Proativo**: Você descobre bugs antes dos usuários reclamarem
2. **Contexto**: Sabe exatamente o que o usuário estava fazendo
3. **Histórico**: Vê quando o bug foi introduzido
4. **Priorização**: Vê quais bugs afetam mais usuários
5. **Monitoramento**: Recebe alertas em tempo real

---

## 📚 Recursos Adicionais

- **Documentação:** https://docs.sentry.io/platforms/python/django/
- **Performance:** Ver queries SQL lentas
- **Releases:** Comparar bugs entre versões
- **User Feedback:** Coletar feedback dos usuários quando algo dá errado
