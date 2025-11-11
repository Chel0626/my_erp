# System Health Monitoring - Endpoints Backend

## 📋 Visão Geral

Backend completo para o Dashboard de Saúde do Sistema. Fornece 9 endpoints RESTful para monitorar todos os aspectos críticos da infraestrutura.

## 🔐 Autenticação

**Todos os endpoints requerem:**
- Header `Authorization: Bearer <token>` (JWT)
- Usuário autenticado
- Ações críticas (flush cache, delete key) requerem `role='superadmin'`

## 📡 Endpoints Implementados

### 1. Sentry - Saúde do Código

#### `GET /api/superadmin/system-health/sentry/health/`
Retorna métricas de saúde do código do Sentry.

**Response:**
```json
{
  "crash_free_users_percentage": 99.5,
  "new_issues_count": 2,
  "recurring_issues_count": 5,
  "sentry_url": "https://sentry.io/organizations/my-org"
}
```

---

### 2. Sentry - Performance (APM)

#### `GET /api/superadmin/system-health/sentry/performance/`
Retorna métricas de performance da aplicação.

**Response:**
```json
{
  "top_slow_transactions": [
    {
      "endpoint": "/api/scheduling/appointments/",
      "avg_duration_ms": 345.2,
      "p95_duration_ms": 523.8,
      "p99_duration_ms": 891.5
    }
  ],
  "avg_response_time_ms": 156.3,
  "error_rate_percentage": 0.5,
  "latency_history": [
    {
      "timestamp": "2025-11-10T14:30:00",
      "avg_ms": 150
    }
  ]
}
```

---

### 3. Redis - Métricas

#### `GET /api/superadmin/system-health/redis/metrics/`
Retorna métricas do Redis (cache).

**Response:**
```json
{
  "hit_ratio_percentage": 94.2,
  "used_memory_mb": 256.4,
  "max_memory_mb": 512.0,
  "memory_usage_percentage": 50.1,
  "connected_clients": 8,
  "total_keys": 1543,
  "keyspace_hits": 125000,
  "keyspace_misses": 7500
}
```

**Implementação:**
- Conecta diretamente no Redis via `redis.from_url()`
- Executa comando `INFO` para pegar estatísticas
- Calcula hit ratio: `(hits / (hits + misses)) * 100`
- Soma chaves de todos os databases (db0, db1, etc)

---

### 4. Redis - Limpar TODO o Cache

#### `POST /api/superadmin/system-health/redis/flushall/`
**⚠️ AÇÃO CRÍTICA:** Deleta TODAS as chaves do Redis.

**Permissão:** `role='superadmin'` apenas

**Response:**
```json
{
  "message": "Cache limpo com sucesso",
  "timestamp": "2025-11-10T14:35:22"
}
```

**Implementação:**
- Executa `redis_client.flushall()`
- Confirmação adicional no frontend (AlertDialog)

---

### 5. Redis - Deletar Chave Específica

#### `POST /api/superadmin/system-health/redis/del_key/`
Deleta uma chave específica do Redis.

**Permissão:** `role='superadmin'` apenas

**Request Body:**
```json
{
  "key": "nome_da_chave"
}
```

**Response:**
```json
{
  "message": "Chave 'nome_da_chave' deletada com sucesso",
  "deleted": true
}
```

---

### 6. Redis - Inspecionar Chave

#### `POST /api/superadmin/system-health/redis/inspect_key/`
Retorna o conteúdo e metadados de uma chave do Redis.

**Permissão:** `role='superadmin'` apenas

**Request Body:**
```json
{
  "key": "user:123"
}
```

**Response:**
```json
{
  "key": "user:123",
  "type": "string",
  "value": {"id": 123, "name": "John Doe"},
  "ttl": 3600,
  "exists": true
}
```

**Tipos Suportados:**
- `string`: Retorna como string (tenta parsear JSON)
- `list`: Retorna array com `lrange(key, 0, -1)`
- `set`: Retorna array com `smembers(key)`
- `zset`: Retorna array com `zrange(key, 0, -1, withscores=True)`
- `hash`: Retorna objeto com `hgetall(key)`

---

### 7. Infraestrutura - Métricas

#### `GET /api/superadmin/system-health/infra/metrics/`
Retorna métricas de CPU e RAM do servidor.

**Response:**
```json
{
  "cpu_usage_percentage": 45.3,
  "memory_usage_percentage": 62.8,
  "cpu_history": [
    {
      "timestamp": "2025-11-10T13:30:00",
      "percentage": 40.5
    }
  ],
  "memory_history": [
    {
      "timestamp": "2025-11-10T13:30:00",
      "percentage": 60.2
    }
  ],
  "provider": "Railway"
}
```

**Histórico:** 12 pontos (5 minutos cada = última hora)

**Integração Futura:**
- Railway API: `https://railway.app/docs/develop/api-reference`
- AWS CloudWatch: `boto3.client('cloudwatch').get_metric_statistics()`

---

### 8. Uptime - Status de Disponibilidade

#### `GET /api/superadmin/system-health/uptime/status/`
Retorna status de disponibilidade do sistema.

**Response:**
```json
{
  "status": "up",
  "uptime_percentage": 99.98,
  "response_time_ms": 156,
  "last_check": "2025-11-10T14:40:00"
}
```

**Integração Futura:**
- UptimeRobot API: `https://uptimerobot.com/api/`
- Pingdom API
- StatusCake API

---

### 9. Usuários - Online Agora

#### `GET /api/superadmin/system-health/users/online/`
Retorna contagem de usuários online em tempo real.

**Response:**
```json
{
  "active_users": 23,
  "users_history": [
    {
      "timestamp": "2025-11-10T13:30:00",
      "count": 18
    }
  ]
}
```

**Implementação:**
- Busca chaves com padrão `user_online:*` no Redis
- Cada chave é criada pelo `OnlineUsersMiddleware`
- TTL de 5 minutos (auto-expira se usuário inativo)

---

## 🛠️ Middleware de Rastreamento

### `OnlineUsersMiddleware`

**Localização:** `backend/system_health/middleware.py`

**Funcionamento:**
1. Intercepta toda requisição autenticada
2. Cria chave no Redis: `user_online:{user_id}`
3. Valor armazenado:
   ```python
   {
       'user_id': 123,
       'username': 'john',
       'email': 'john@example.com',
       'tenant': 5,
       'last_seen': '/api/scheduling/appointments/'
   }
   ```
4. TTL de 300 segundos (5 minutos)
5. Cada requisição renova o TTL

**Adicionado em:** `config/settings.py` MIDDLEWARE

---

## 🧪 Testes

### Executar Testes

```bash
cd backend
python manage.py test system_health
```

### Cobertura de Testes

- ✅ Autenticação (401 sem token)
- ✅ Autorização (403 para não-superadmin em ações críticas)
- ✅ Validação de campos obrigatórios
- ✅ Formato correto de response
- ✅ Error handling

**Arquivo:** `backend/system_health/tests.py`

---

## 📦 Estrutura de Arquivos

```
backend/system_health/
├── __init__.py
├── apps.py                 # Configuração do app
├── views.py                # 9 ViewSets (APIView)
├── urls.py                 # Rotas
├── middleware.py           # OnlineUsersMiddleware
├── tests.py                # Suite de testes
└── migrations/             # (vazio - sem models)
```

---

## 🔧 Configuração

### 1. Adicionar ao `INSTALLED_APPS`

```python
# config/settings.py
INSTALLED_APPS = [
    # ...
    'system_health',
]
```

### 2. Adicionar Middleware

```python
# config/settings.py
MIDDLEWARE = [
    # ...
    'system_health.middleware.OnlineUsersMiddleware',  # No final
]
```

### 3. Incluir URLs

```python
# config/urls.py
urlpatterns = [
    # ...
    path('api/superadmin/system-health/', include('system_health.urls')),
]
```

---

## 🚀 Deploy

### Variáveis de Ambiente

```bash
# Sentry (já configurado)
SENTRY_DSN=https://...
SENTRY_ENVIRONMENT=production

# Redis (já configurado)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Railway (detectado automaticamente)
RAILWAY_ENVIRONMENT=production
```

### Collectstatic

```bash
python manage.py collectstatic --noinput
```

### Migrations

Não há models neste app, então não precisa de migrations.

---

## 📊 Dados Mock vs Dados Reais

### Atualmente Mock (precisa integração):
- ✅ Sentry Health (usar Sentry API)
- ✅ Sentry Performance (usar Sentry APM API)
- ✅ Infraestrutura (usar Railway/AWS API)
- ✅ Uptime Status (usar UptimeRobot API)
- ✅ Users History (implementar snapshots no Redis)

### Já com Dados Reais:
- ✅ Redis Metrics (direto do Redis INFO)
- ✅ Redis Actions (flushall, delete, inspect)
- ✅ Online Users Count (via middleware + Redis)

---

## 🎯 Próximos Passos

1. **Integrar Sentry API** para dados reais de crash-free e issues
2. **Integrar Railway API** para métricas reais de CPU/RAM
3. **Integrar UptimeRobot** para status real de disponibilidade
4. **Implementar snapshots** de usuários online a cada 5min
5. **Adicionar alertas** via email quando métricas críticas
6. **Implementar WebSockets** (opcional) para atualizações em tempo real

---

**Status:** ✅ Implementado e Pronto para Testes  
**Commit:** Próximo  
**Documentação:** Este arquivo + `DASHBOARD_SAUDE_IMPLEMENTADO.md` (frontend)
