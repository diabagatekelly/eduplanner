'use client'

import { SessionProvider } from 'next-auth/react'
import { Provider } from 'react-redux'
import store from '@/store/store'

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Provider store={store}>{children}</Provider>
    </SessionProvider>
  )
}
