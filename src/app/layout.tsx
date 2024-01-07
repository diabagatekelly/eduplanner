'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import { Provider, useDispatch } from "react-redux";
import store from "./store";
import {Navbar} from './ui/navbar';
import {Footer} from './ui/footer';
import { Suspense, useEffect, useState } from 'react';
import { hasExpired, hasToken } from './actions/authActions';
import { usePathname, useSearchParams } from 'next/navigation'
import { populateUser } from './actions/userActions';

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
  
  const [userState, setUserState] = useState({isAuthenticated: false, userReducer: {...args}})

  useEffect(() => {
    dispatch(hasExpired())
    dispatch(hasToken())
    dispatch(populateUser())
    const {authReducer, userReducer} = store.getState()
    const isAuthenticated = authReducer.isAuthenticated;
    setUserState({isAuthenticated, userReducer})
  }, [pathname, searchParams, dispatch])

  const username = userState.userReducer.username;
  const isAuthenticated = userState.isAuthenticated;

  return ( 
    <Suspense fallback={null}>
        <Navbar {...{isAuthenticated, username}} />
    </Suspense>
  );
}
