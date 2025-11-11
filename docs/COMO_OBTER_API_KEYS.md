# 🔑 Como Obter as API Keys

## 📋 Checklist Rápido

- [x] **Sentry** ✅ Configurado (`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`)
- [x] **Railway** ✅ Configurado (`0e53a149-2bff-4444-a95d-bf231e7e2407`)
- [ ] **UptimeRobot** ⏳ Pendente (veja instruções abaixo)

---

## ⏱️ UptimeRobot - Como Encontrar a API Key

### Método 1: Via Dashboard (Recomendado)

1. **Login:**
   ```
   https://dashboard.uptimerobot.com/login
   ```

2. **Navegue para Integrations:**
   - **Opção A:** Menu lateral → **"Integrations & API"**
   - **Opção B:** Menu lateral → **"Settings"** → **"API"**
   - **Opção C:** Avatar (canto superior direito) → **"Account Settings"** → **"API Settings"**

3. **Copie a chave:**
   - Você verá: **"Main API Key"** ou **"Read-Only API Key"**
   - Clique em **"Show API Key"** ou **"Copy"**
   - A chave começa com `u` seguido de números

**Exemplo de chave:** `u123456-abc123def456789`

### Método 2: URL Direta

Acesse diretamente:
```
https://dashboard.uptimerobot.com/settings/api
```
ou
```
https://dashboard.uptimerobot.com/integrations
```

### Tipos de Chave

| Tipo | Permissões | Recomendação |
|------|-----------|--------------|
| **Main API Key** | Criar, editar, deletar monitores | ⚠️ Cuidado - acesso total |
| **Read-Only API Key** | Apenas leitura de status | ✅ Use esta para o dashboard |

### Adicionar no `.env`

```env
# UptimeRobot API Integration
UPTIMEROBOT_API_KEY=u123456-abc123def456789
```

### Testar a chave

```bash
curl -X POST https://api.uptimerobot.com/v2/getMonitors \
  -d 'api_key=u123456-abc123def456789&format=json'
```

**Resposta esperada:**
```json
{
  "stat": "ok",
  "pagination": {...},
  "monitors": [...]
}
```

---

## 🚂 Railway - Limitações da API

### ✅ O que está configurado:

```env
RAILWAY_API_TOKEN=0e53a149-2bff-4444-a95d-bf231e7e2407
```

### ⚠️ Limitação Importante:

A **API GraphQL do Railway NÃO expõe métricas de CPU/RAM em tempo real**.

### O que a API Railway fornece:

✅ **Disponível:**
- Lista de projetos
- Lista de serviços
- Status de deploys
- Logs (via CLI)
- Variáveis de ambiente
- Informações de build

❌ **NÃO Disponível:**
- Métricas de CPU em tempo real
- Métricas de RAM em tempo real
- Histórico de uso de recursos
- Alertas de performance

### Como ver métricas reais:

**Opção 1: Railway Dashboard (Recomendado)**
```
https://railway.app/project/{project_id}
```
- Acesse seu projeto
- Aba "Metrics" mostra CPU/RAM em tempo real

**Opção 2: Railway CLI**
```bash
railway login
railway link
railway logs
```

**Opção 3: Integração com Datadog/New Relic**
- Railway suporta envio de logs para serviços externos
- Configure via variáveis de ambiente

### O que nosso código faz:

```python
# backend/system_health/views.py
class InfraMetricsView(APIView):
    def get(self, request):
        # Conecta na API GraphQL do Railway
        # Busca lista de projetos e serviços
        # Retorna mock data para CPU/RAM (limitação da API)
        # Adiciona nota explicando a limitação
```

**Resposta do endpoint:**
```json
{
  "cpu_usage_percentage": 38.5,
  "memory_usage_percentage": 58.2,
  "cpu_history": [...],
  "memory_history": [...],
  "provider": "Railway",
  "note": "Métricas em tempo real limitadas pela API do Railway. Use Railway Dashboard para dados precisos."
}
```

---

## 📊 Railway - GraphQL API Queries Disponíveis

### Query: Listar Projetos

```graphql
query {
  me {
    projects {
      edges {
        node {
          id
          name
          description
          createdAt
        }
      }
    }
  }
}
```

### Query: Listar Serviços de um Projeto

```graphql
query {
  project(id: "PROJECT_ID") {
    services {
      edges {
        node {
          id
          name
          createdAt
        }
      }
    }
  }
}
```

### Query: Status de Deploys

```graphql
query {
  project(id: "PROJECT_ID") {
    deployments {
      edges {
        node {
          id
          status
          createdAt
        }
      }
    }
  }
}
```

### Como usar:

```bash
curl https://backboard.railway.app/graphql/v2 \
  -H "Authorization: Bearer 0e53a149-2bff-4444-a95d-bf231e7e2407" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ me { id email } }"}'
```

---

## 🎯 Próximos Passos

### 1. Configure UptimeRobot (5 minutos)

✅ **Passo 1:** Crie conta ou faça login  
✅ **Passo 2:** Crie um monitor HTTP apontando para seu backend  
✅ **Passo 3:** Copie a Read-Only API Key  
✅ **Passo 4:** Adicione no `.env`  
✅ **Passo 5:** Me avise para implementar o endpoint

### 2. Railway - Aceite as limitações

O Railway não fornece métricas programáticas. Opções:

**Opção A:** Deixar como está (mock data + nota explicativa)  
**Opção B:** Remover o card de Infrastructure do dashboard  
**Opção C:** Integrar com Datadog/New Relic (requer conta paga)

---

## 🔐 Segurança das API Keys

### ✅ Boas práticas:

1. **Nunca commite .env no Git**
   ```bash
   # Verifique se está no .gitignore
   cat .gitignore | grep .env
   ```

2. **Use Read-Only quando possível**
   - UptimeRobot: Use Read-Only API Key
   - Sentry: Permissões mínimas (Project:Read, Issue:Read)

3. **Rotação de chaves**
   - Troque as chaves a cada 3-6 meses
   - Revogue chaves antigas imediatamente

4. **Variáveis de ambiente em produção**
   - Railway: Configure via dashboard
   - Vercel: Configure via Settings → Environment Variables

---

## 📝 Template `.env` Completo

```env
# Sentry API (CONFIGURADO ✅)
SENTRY_AUTH_TOKEN=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
SENTRY_ORG_SLUG=vrbtech
SENTRY_PROJECT_SLUG=python-django

# Railway API (CONFIGURADO ✅ - Limitado)
RAILWAY_API_TOKEN=0e53a149-2bff-4444-a95d-bf231e7e2407

# UptimeRobot API (PENDENTE ⏳)
UPTIMEROBOT_API_KEY=u123456-abc123def456789
```

---

## 🆘 Problemas Comuns

### UptimeRobot: "Invalid API key"
- ✅ Verifique se copiou a chave completa (começa com `u`)
- ✅ Confirme que está usando a chave correta (Main vs Read-Only)
- ✅ Teste com curl primeiro

### Railway: "Unauthorized"
- ✅ Token pode ter expirado - gere um novo
- ✅ Verifique se o token tem as permissões corretas

### Sentry: "403 Forbidden"
- ✅ Confirme que o token tem as permissões necessárias
- ✅ Verifique se ORG_SLUG e PROJECT_SLUG estão corretos

---

## 📞 Me avise quando:

1. ✅ Conseguir a API Key do UptimeRobot → Implemento o endpoint real
2. ✅ Decidir o que fazer com Railway (manter mock ou remover card)
3. ✅ Encontrar algum erro ao testar as integrações

**Status atual:** 2/3 integrações funcionais (Sentry ✅, Railway ⚠️ limitado, UptimeRobot ⏳ pendente)
