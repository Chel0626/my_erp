/**
 * Google OAuth Provider
 * Wrapper do GoogleOAuthProvider para autenticação
 */
'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ReactNode } from 'react';

interface GoogleAuthProviderProps {
  children: ReactNode;
}

export function GoogleAuthProvider({ children }: GoogleAuthProviderProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  if (!clientId) {
    console.warn('NEXT_PUBLIC_GOOGLE_CLIENT_ID não configurado');
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
