'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SessionProvider } from 'next-auth/react'
import { ErrorBoundary } from 'react-error-boundary'
import ErrorBoundaryFallback from '@/components/error-boundary-fallback'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 1000 * 60, retry: 1 },
      mutations: { retry: 0 },
    },
  })
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
        <SessionProvider refetchOnWindowFocus={false}>{children}</SessionProvider>
      </ErrorBoundary>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
