'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutos - dados ficam "fresh" por mais tempo
            gcTime: 10 * 60 * 1000, // 10 minutos - garbage collection time (ex-cacheTime)
            refetchOnWindowFocus: false, // Não refetch ao focar janela
            refetchOnReconnect: false, // Não refetch ao reconectar
            retry: 1, // Apenas 1 retry em caso de erro (ao invés de 3)
            retryDelay: 1000, // 1 segundo entre retries
          },
          mutations: {
            retry: 0, // Não retry em mutations por padrão
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
