import RootLayout, { metadata } from '../../app/layout'
import Home from '../../app/home/page'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { act } from 'react'

jest.mock('../../auth', () => ({
  auth: jest.fn().mockResolvedValue(null),
}))

jest.mock('../../app/providers', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

jest.mock('next/navigation', () => {
  return {
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
    })),
    usePathname: jest.fn(),
    useSearchParams: jest.fn(),
  }
})

describe('Root layout', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should export metadata with title and description', () => {
    expect(metadata.title).toBeDefined()
    expect(metadata.description).toBeDefined()
  })

  it('should render as expected', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => null)
    await act(async () => {
      render(await RootLayout({ children: <Home /> }))
    })
    expect(await screen.findByTestId('home')).toBeInTheDocument()
  })
})
