# Integração Redis REST API (Upstash)

## 📋 Resumo

Configuração completa do Upstash Redis via REST API (HTTPS) substituindo conexão TCP que falhava em ambiente serverless Railway.

## 🎯 Problema Resolvido

- ❌ **Antes**: Conexão TCP redis:// falhava com "Connection closed by server"
- ✅ **Depois**: REST API via HTTPS funcionando perfeitamente

## 🔧 Componentes

### 1. Backend Customizado

**Arquivo**: `backend/core/cache_backend.py`

```python
class UpstashRedisCache(BaseCache):
    """Cache backend usando Upstash Redis REST API"""
    
    - Serialização JSON automática (upstash-redis)
    - Timeout com conversão int() para ex parameter
    - Graceful degradation se não configurado
    - Logging completo para debug
```

**Métodos Implementados**:
- `set(key, value, timeout)` - Define valor com expiração
- `get(key, default)` - Recupera valor ou retorna default
- `add(key, value, timeout)` - Adiciona apenas se não existir (NX)
- `delete(key)` - Remove chave
- `clear()` - Limpa todos os keys (FLUSHDB)
- `get_many(keys)` - Recupera múltiplos valores (MGET)
- `has_key(key)` - Verifica existência (EXISTS)
- `incr(key, delta)` - Incrementa contador
- `decr(key, delta)` - Decrementa contador

### 2. Configuração Django

**Arquivo**: `backend/config/settings.py`

```python
# Cache Configuration
UPSTASH_REDIS_REST_URL = config('UPSTASH_REDIS_REST_URL', default='')
UPSTASH_REDIS_REST_TOKEN = config('UPSTASH_REDIS_REST_TOKEN', default='')

CACHES = {
    'default': {
        'BACKEND': 'core.cache_backend.UpstashRedisCache',
        'LOCATION': UPSTASH_REDIS_REST_URL,
    } if UPSTASH_REDIS_REST_URL else {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}
```

### 3. Variáveis de Ambiente

**Railway** (já configuradas via CLI):
```bash
UPSTASH_REDIS_REST_URL=https://sincere-tapir-30539.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXdLAAIncDI2NzhkOTY2MDE1M2Q0YjczOTk5YzgwOGNjYWFjYjkyMHAyMzA1Mzk
```

**Local** (`.env`):
```properties
UPSTASH_REDIS_REST_URL=https://sincere-tapir-30539.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXdLAAIncDI2NzhkOTY2MDE1M2Q0YjczOTk5YzgwOGNjYWFjYjkyMHAyMzA1Mzk
```

### 4. Dependências

**Arquivo**: `backend/requirements.txt`

```
upstash-redis>=1.1.0  # REST API client
```

## 🧪 Testes

### Teste Local Bem-Sucedido

```bash
cd backend
$env:DJANGO_SETTINGS_MODULE="config.settings"
python -c "from django.core.cache import cache; cache.set('test_key', 'valor_teste', 60); print('Result:', cache.get('test_key'))"
```

**Saída Esperada**:
```
✅ Cache: Upstash Redis REST
Result: valor_teste
✅ Redis REST funcionando!
```

### Teste em Produção (Railway)

```bash
railway run python -c "from django.core.cache import cache; cache.set('prod_test', 'OK', 60); print(cache.get('prod_test'))"
```

## 📊 Logs de Confirmação

```python
# Em settings.py (startup)
if UPSTASH_REDIS_REST_URL:
    print("✅ Cache: Upstash Redis REST")
else:
    print("⚠️ Cache: LocMemCache (fallback)")
```

## 🔍 Debug

### Verificar Configuração

```bash
railway run python -c "from decouple import config; print('URL:', config('UPSTASH_REDIS_REST_URL')); print('Token:', config('UPSTASH_REDIS_REST_TOKEN')[:20] + '...')"
```

### Verificar Conexão

```bash
railway run python -c "from upstash_redis import Redis; r = Redis(url='...', token='...'); print(r.ping())"
```

### Verificar Cache Django

```bash
railway run python manage.py shell -c "from django.core.cache import cache; print(cache.__class__.__name__); cache.set('test', 'ok'); print(cache.get('test'))"
```

## 🚀 Deploy

1. **Commit e Push** ✅ (já feito)
2. **Railway Auto-Deploy** (em andamento)
3. **Verificar Logs**: `railway logs --tail 50`
4. **Confirmar Cache**: Mensagem "✅ Cache: Upstash Redis REST"

## 📈 Benefícios

- ✅ **Serverless-Friendly**: HTTPS ao invés de TCP persistente
- ✅ **Fallback Automático**: LocMemCache se não configurado
- ✅ **Zero Downtime**: Sistema funciona mesmo sem Redis
- ✅ **Logging Completo**: Erros capturados e enviados ao Sentry
- ✅ **Performance**: Upstash otimizado para REST API
- ✅ **Custo**: Free tier 10k comandos/dia

## 🎯 Próximos Passos

- [ ] Monitorar Upstash Dashboard: https://console.upstash.com/
- [ ] Implementar cache em endpoints de alta frequência
- [ ] Configurar cache para sessões (SESSION_ENGINE)
- [ ] Opcional: Remover django-redis se não for mais usado

## 🔗 Referências

- [Upstash Redis REST](https://upstash.com/docs/redis/overall/getstarted)
- [upstash-redis Python SDK](https://github.com/upstash/upstash-redis-py)
- [Django Cache Framework](https://docs.djangoproject.com/en/5.0/topics/cache/)
- [BaseCache API](https://docs.djangoproject.com/en/5.0/topics/cache/#the-low-level-cache-api)

---

✅ **Status**: Configurado e testado com sucesso (commit a08c7d86)
