import { NextResponse } from 'next/server';

/**
 * Endpoint para testar se o Sentry está capturando erros no frontend
 * Acesse: http://localhost:3000/api/sentry-test
 * 
 * Você deve ver:
 * 1. Erro na tela
 * 2. Erro capturado no Sentry dashboard
 */
export async function GET() {
  throw new Error('🧪 Teste de Sentry Frontend - Este erro foi gerado propositalmente!');
  
  // Nunca vai chegar aqui
  return NextResponse.json({ message: 'Nunca vai aparecer' });
}
