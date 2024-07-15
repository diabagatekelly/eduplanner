'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import { Provider, useDispatch } from "react-redux";
import store from "@/store/store";
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { Suspense, useEffect, useState } from 'react';
import { hasExpired, hasToken } from '@/store/actions/authActions';
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { populateUser } from '@/store/actions/userActions';
import { useMounted } from '@/utils/useMounted';

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white`}>
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
  const searchParams = useSearchParams()
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

  }, [pathname, searchParams, dispatch])

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
