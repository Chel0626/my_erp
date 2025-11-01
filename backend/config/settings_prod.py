from .settings import *
from decouple import Csv, config
import os
import dj_database_url

# Configurações específicas de produção
DEBUG = False
ALLOWED_HOSTS = ['*']

# Configuração do banco de dados para produção (Supabase)
# Força uso do pooler do Supabase (porta 6543) para compatibilidade IPv4
DATABASE_URL = os.getenv('DATABASE_URL', '')

# Força substituição de porta 5432 por 6543 (pooler)
if 'supabase.co' in DATABASE_URL:
    # Remove porta 5432 se existir
    DATABASE_URL = DATABASE_URL.replace(':5432/', ':6543/')
    DATABASE_URL = DATABASE_URL.replace(':5432?', ':6543?')
    # Se não tem porta especificada, força 6543
    if ':6543' not in DATABASE_URL and 'supabase.co/' in DATABASE_URL:
        DATABASE_URL = DATABASE_URL.replace('supabase.co/', 'supabase.co:6543/')
    # Garante parâmetros do pooler
    if 'pgbouncer=true' not in DATABASE_URL:
        separator = '&' if '?' in DATABASE_URL else '?'
        DATABASE_URL += f'{separator}pgbouncer=true'

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
