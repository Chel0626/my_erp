"""
Backend de cache customizado para Upstash Redis REST API
Funciona em ambientes serverless onde conexões TCP podem falhar
"""
from django.core.cache.backends.base import BaseCache
from upstash_redis import Redis
from decouple import config
import json
import logging

logger = logging.getLogger(__name__)


class UpstashRedisCache(BaseCache):
    """
    Cache backend usando Upstash Redis REST API
    Suporta ambientes serverless sem conexões TCP persistentes
    """
    
    def __init__(self, location, params):
        super().__init__(params)
        
        # Pega a URL REST do Upstash (formato: https://xxx.upstash.io)
        rest_url = config('UPSTASH_REDIS_REST_URL', default='')
        rest_token = config('UPSTASH_REDIS_REST_TOKEN', default='')
        
        if not rest_url or not rest_token:
            logger.warning("Upstash Redis REST não configurado. Cache desabilitado.")
            self._client = None
            return
        
        try:
            self._client = Redis(url=rest_url, token=rest_token)
            logger.info("✅ Upstash Redis REST conectado com sucesso")
        except Exception as e:
            logger.error(f"❌ Erro ao conectar Upstash Redis: {e}")
            self._client = None
    
    def add(self, key, value, timeout=None):
        """Adiciona apenas se a chave não existir"""
        if not self._client:
            return False
        
        try:
            key = self.make_key(key)
            timeout = self.get_backend_timeout(timeout)
            
            # Serializa para JSON (upstash-redis faz isso automaticamente)
            # ex=None significa sem expiração, mas o upstash precisa de int ou omitir
            if timeout:
                result = self._client.set(key, value, nx=True, ex=int(timeout))
            else:
                result = self._client.set(key, value, nx=True)
            return result is not None
        except Exception as e:
            logger.error(f"Cache add error: {e}")
            return False
    
    def get(self, key, default=None):
        """Recupera valor do cache"""
        if not self._client:
            return default
        
        try:
            key = self.make_key(key)
            value = self._client.get(key)
            
            if value is None:
                return default
            
            # upstash-redis já desserializa do JSON automaticamente
            return value
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            return default
    
    def set(self, key, value, timeout=None):
        """Define valor no cache"""
        if not self._client:
            return False
        
        try:
            key = self.make_key(key)
            timeout = self.get_backend_timeout(timeout)
            
            # upstash-redis serializa para JSON automaticamente
            # ex=None significa sem expiração, mas o upstash precisa de int ou omitir
            if timeout:
                self._client.set(key, value, ex=int(timeout))
            else:
                self._client.set(key, value)
            return True
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            return False
    
    def delete(self, key):
        """Remove chave do cache"""
        if not self._client:
            return False
        
        try:
            key = self.make_key(key)
            self._client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
            return False
    
    def clear(self):
        """Limpa todo o cache"""
        if not self._client:
            return False
        
        try:
            self._client.flushdb()
            return True
        except Exception as e:
            logger.error(f"Cache clear error: {e}")
            return False
    
    def get_many(self, keys):
        """Recupera múltiplos valores"""
        if not self._client:
            return {}
        
        try:
            keys_map = {self.make_key(k): k for k in keys}
            values = self._client.mget(list(keys_map.keys()))
            
            result = {}
            for i, value in enumerate(values):
                if value is not None:
                    original_key = keys_map[list(keys_map.keys())[i]]
                    # upstash-redis já desserializa do JSON automaticamente
                    result[original_key] = value
            
            return result
        except Exception as e:
            logger.error(f"Cache get_many error: {e}")
            return {}
    
    def has_key(self, key):
        """Verifica se chave existe"""
        if not self._client:
            return False
        
        try:
            key = self.make_key(key)
            return self._client.exists(key) > 0
        except Exception as e:
            logger.error(f"Cache has_key error: {e}")
            return False
    
    def incr(self, key, delta=1):
        """Incrementa valor numérico"""
        if not self._client:
            raise ValueError("Cache backend not available")
        
        try:
            key = self.make_key(key)
            return self._client.incrby(key, delta)
        except Exception as e:
            logger.error(f"Cache incr error: {e}")
            raise ValueError("Key not found or not an integer")
    
    def decr(self, key, delta=1):
        """Decrementa valor numérico"""
        return self.incr(key, -delta)
