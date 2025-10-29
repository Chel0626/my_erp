from .settings import *

# Configurações específicas de produção
DEBUG = False
ALLOWED_HOSTS = ['*']

# Exemplo: forçar uso de banco de dados do ambiente
# DATABASES['default']['NAME'] = os.getenv('DB_NAME', DATABASES['default']['NAME'])
# DATABASES['default']['USER'] = os.getenv('DB_USER', DATABASES['default']['USER'])
# DATABASES['default']['PASSWORD'] = os.getenv('DB_PASSWORD', DATABASES['default']['PASSWORD'])
# DATABASES['default']['HOST'] = os.getenv('DB_HOST', DATABASES['default']['HOST'])
# DATABASES['default']['PORT'] = os.getenv('DB_PORT', DATABASES['default']['PORT'])

# Outras configurações de produção podem ser adicionadas aqui
