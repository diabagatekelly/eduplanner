import { auth } from '@/auth'
import { Inter } from 'next/font/google'
import { Provider } from 'react-redux'
import { SessionProvider } from 'next-auth/react'
import '@/styles/globals.css'
import store from '@/store/store'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

const inter = Inter({ subsets: ['latin'] })

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const isAuthenticated = !!session
  const username = (session?.user as any)?.username ?? ''
  const userId = (session?.user as any)?.userId ?? ''

  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <SessionProvider>
          <Navbar isAuthenticated={isAuthenticated} username={username} userId={userId} />
          <Provider store={store}>
            <div className="py-20 px-5">{children}</div>
            <Footer />
          </Provider>
        </SessionProvider>
      </body>
    </html>
  )
}
