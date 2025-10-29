import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Ajuste a taxa de amostragem
  tracesSampleRate: 1.0,
  
  // Configuração de debug
  debug: false,
  
  // Ambiente
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development',
  
  // Release/versão
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || 'dev',
});
