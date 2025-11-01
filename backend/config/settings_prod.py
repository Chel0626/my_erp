from .settings import *
from decouple import Csv, config
import os
import dj_database_url

# Configurações específicas de produção
DEBUG = False
ALLOWED_HOSTS = ['*']

# Configuração do banco de dados para produção (Supabase)
# Força uso de IPv4 e conexão SSL
DATABASES = {
    'default': dj_database_url.config(
        default=os.getenv('DATABASE_URL'),
        conn_max_age=600,
        conn_health_checks=True,
        ssl_require=True,
    )
}

# Força uso de IPv4 apenas
if DATABASES['default'].get('OPTIONS') is None:
    DATABASES['default']['OPTIONS'] = {}
DATABASES['default']['OPTIONS']['options'] = '-c gethostbyname=0'



# Diretório para arquivos estáticos em produção
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# CORS em produção
CORS_ALLOWED_ORIGINS = config(
	'CORS_ALLOWED_ORIGINS',
	default='http://localhost:3000,http://127.0.0.1:3000'
	, cast=Csv()
)
