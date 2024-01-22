import React from 'react'
import {render} from '@testing-library/react'
import store from '@/store/store'
import { Provider } from 'react-redux'




export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Provider store={store}>
      <div className="py-20 px-5">
        {children}
      </div>
    </Provider>
  )
}



const customRender = (ui, options?) =>
  render(ui, {wrapper: RootLayout, ...options})

// re-export everything
export * from '@testing-library/react'

// override render method
export {customRender as render}