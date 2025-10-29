import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Ajuste a taxa de amostragem (0.0 a 1.0)
  // 1.0 = 100% das transações em produção (pode sair caro!)
  // 0.1 = 10% das transações
  tracesSampleRate: 1.0,
  
  // Configuração de debug (desabilitar em produção)
  debug: false,
  
  // Session Replay (grava o que o usuário fez antes do erro)
  replaysOnErrorSampleRate: 1.0, // 100% quando há erro
  replaysSessionSampleRate: 0.1, // 10% das sessões normais
  
  // Integrações
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true, // Oculta todo texto (privacidade)
      blockAllMedia: true, // Oculta imagens/vídeos
    }),
  ],
  
  // Ambiente
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development',
  
  // Release/versão
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || 'dev',
  
  // Ignora erros comuns/esperados
  ignoreErrors: [
    // Erros de navegador que não são bugs nossos
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    'Non-Error promise rejection captured',
    // Erros de extensões de navegador
    'top.GLOBALS',
    'chrome-extension://',
    'moz-extension://',
  ],
  
  // Antes de enviar evento, podemos modificar/filtrar
  beforeSend(event, hint) {
    // Em desenvolvimento, também loga no console
    if (process.env.NODE_ENV === 'development') {
      console.error('🔴 Erro capturado pelo Sentry:', hint.originalException || hint.syntheticException);
    }
    return event;
  },
});
