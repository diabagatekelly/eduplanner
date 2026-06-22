import React from 'react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

function RootLayout({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return (
    <QueryClientProvider client={queryClient}>
      <div className="py-20 px-5">{children}</div>
    </QueryClientProvider>
  )
}

const customRender = (ui: React.ReactElement, options?: any) =>
  render(ui, { wrapper: RootLayout, ...options })

// re-export everything
export * from '@testing-library/react'

// override render method
export { customRender as render }
