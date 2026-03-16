import { auth } from '@/auth'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import AppProviders from './providers'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const isAuthenticated = !!session
  const username = (session?.user as any)?.username ?? ''
  const userId = (session?.user as any)?.userId ?? ''

  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <Navbar isAuthenticated={isAuthenticated} username={username} userId={userId} />
        <AppProviders>
          <div className="py-20 px-5">{children}</div>
          <Footer />
        </AppProviders>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
