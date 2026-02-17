'use client';

import 'reflect-metadata';
import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/presentation/components/ui/sonner';
import { CQRSProvider } from '@/presentation/providers/CQRSProvider';
import { ErrorBoundary } from '@/shared/errors/ErrorBoundary';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <CQRSProvider>{children}</CQRSProvider>
      </QueryClientProvider>
      <Toaster position="top-right" richColors closeButton />
    </ErrorBoundary>
  );
}
