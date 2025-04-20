'use client'

import { Inter } from 'next/font/google'
import { Provider, useDispatch } from "react-redux";
import { Suspense, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation'
import '@/styles/globals.css'
import store from "@/store/store";
import { hasExpired, hasToken } from '@/store/actions/authActions';
import { populateUser } from '@/store/actions/userActions';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { useMounted } from '@/lib/helpers/useMounted';

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <Provider store={store}>
          <Reloader />
          <div className="py-20 px-5">
            {children}
          </div>
          <Footer />
        </Provider>
      </body>
    </html>
  )
}


const Reloader = () => {
  let args;
  const dispatch = useDispatch()
  const pathname = usePathname()
  // const searchParams = useSearchParams()
  const router = useRouter()
  const mounted = useMounted();
  
  const [userState, setUserState] = useState({isAuthenticated: false, userReducer: {...args}})

  useEffect(() => {
    /* istanbul ignore next */
    if (window.Cypress) {
      //@ts-ignore
      window.store = store
    }
    dispatch(hasExpired())
    dispatch(hasToken())
    dispatch(populateUser())
    const {authReducer, userReducer} = store.getState()
    const isAuthenticated = authReducer.isAuthenticated;
    setUserState({isAuthenticated, userReducer})

  }, [pathname, dispatch])

  const username = userState.userReducer.username;
  const isAuthenticated = userState.isAuthenticated;

  if (mounted) {
    if (!window?.sessionStorage.getItem('user_token') && pathname !== '/login' && pathname !== '/register') {
      router.push('/login')
    }
  }

  return ( 
    <Suspense fallback={null}>
      <Navbar {...{isAuthenticated, username}} />
    </Suspense>
  );
}
