from .settings import *
from decouple import Csv, config
import os

# Configurações específicas de produção
DEBUG = False
ALLOWED_HOSTS = ['*']

# Exemplo: forçar uso de banco de dados do ambiente
# DATABASES['default']['NAME'] = os.getenv('DB_NAME', DATABASES['default']['NAME'])
# DATABASES['default']['USER'] = os.getenv('DB_USER', DATABASES['default']['USER'])
# DATABASES['default']['PASSWORD'] = os.getenv('DB_PASSWORD', DATABASES['default']['PASSWORD'])
# DATABASES['default']['HOST'] = os.getenv('DB_HOST', DATABASES['default']['HOST'])
# DATABASES['default']['PORT'] = os.getenv('DB_PORT', DATABASES['default']['PORT'])



# Diretório para arquivos estáticos em produção
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# CORS em produção
CORS_ALLOWED_ORIGINS = config(
	'CORS_ALLOWED_ORIGINS',
	default='http://localhost:3000,http://127.0.0.1:3000'
	, cast=Csv()
)
