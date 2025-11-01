from .settings import *
from decouple import Csv, config
import os
import dj_database_url

# Configurações específicas de produção
DEBUG = False
ALLOWED_HOSTS = ['*']

# Configuração do banco de dados para produção (Supabase)
# Usa a URL de pooling do Supabase para melhor compatibilidade com Railway
DATABASE_URL = os.getenv('DATABASE_URL', '')

# Se for Supabase, usa o pooler (porta 6543) ao invés da porta direta (5432)
# O pooler é mais estável para conexões externas e suporta IPv4
if 'supabase.co:5432' in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace(':5432/', ':6543/')
    # Adiciona modo de pooling transacional
    if '?' not in DATABASE_URL:
        DATABASE_URL += '?pgbouncer=true&connection_limit=1'
    else:
        DATABASE_URL += '&pgbouncer=true&connection_limit=1'

DATABASES = {
    'default': dj_database_url.config(
        default=DATABASE_URL,
        conn_max_age=0,  # Desabilita persistent connections com pooler
        conn_health_checks=True,
        ssl_require=True,
    )
}



# Diretório para arquivos estáticos em produção
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# CORS em produção
CORS_ALLOWED_ORIGINS = config(
	'CORS_ALLOWED_ORIGINS',
	default='http://localhost:3000,http://127.0.0.1:3000'
	, cast=Csv()
)
