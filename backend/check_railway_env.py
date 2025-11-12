"""
Script para verificar variáveis de ambiente no Railway
"""
import os

# Variáveis essenciais para o sistema funcionar
REQUIRED_VARS = {
    'Backend Core': [
        'DATABASE_URL',
        'SECRET_KEY',
        'DEBUG',
        'ALLOWED_HOSTS',
    ],
    'Redis Cache': [
        'REDIS_URL',
        'UPSTASH_REDIS_REST_URL',
        'UPSTASH_REDIS_REST_TOKEN',
    ],
    'Sentry Monitoring': [
        'SENTRY_DSN',
        'SENTRY_AUTH_TOKEN',
        'SENTRY_ORG_SLUG',
        'SENTRY_PROJECT_SLUG',
    ],
    'External APIs': [
        'RAILWAY_API_TOKEN',
        'UPTIMEROBOT_API_KEY',
    ],
    'CORS/CSRF': [
        'CORS_ALLOWED_ORIGINS',
        'CSRF_TRUSTED_ORIGINS',
    ],
}

print("="*60)
print("🔍 VERIFICAÇÃO DE VARIÁVEIS DE AMBIENTE - RAILWAY")
print("="*60)

missing_vars = []
present_vars = []

for category, vars_list in REQUIRED_VARS.items():
    print(f"\n📦 {category}")
    print("-" * 60)
    
    for var in vars_list:
        value = os.getenv(var)
        if value:
            # Mostra apenas primeiros 50 chars por segurança
            display_value = value[:50] + "..." if len(value) > 50 else value
            print(f"  ✅ {var}: {display_value}")
            present_vars.append(var)
        else:
            print(f"  ❌ {var}: NÃO DEFINIDA")
            missing_vars.append(var)

print("\n" + "="*60)
print("📊 RESUMO")
print("="*60)
print(f"✅ Variáveis presentes: {len(present_vars)}/{len(present_vars) + len(missing_vars)}")
print(f"❌ Variáveis ausentes: {len(missing_vars)}")

if missing_vars:
    print("\n🔴 VARIÁVEIS FALTANDO:")
    for var in missing_vars:
        print(f"   - {var}")
    
    print("\n💡 COMO ADICIONAR:")
    print("   Via Dashboard: https://railway.app/dashboard → Variables")
    print("   Via CLI: railway variables set NOME_VAR='valor'")
else:
    print("\n🎉 TODAS AS VARIÁVEIS ESTÃO CONFIGURADAS!")

print("\n" + "="*60)
