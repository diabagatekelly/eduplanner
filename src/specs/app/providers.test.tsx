import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import AppProviders from '../../app/providers'

jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('AppProviders', () => {
  it('should render children', () => {
    render(
      <AppProviders>
        <div data-testid="providers-child">content</div>
      </AppProviders>
    )
    expect(screen.getByTestId('providers-child')).toBeInTheDocument()
  })
})
