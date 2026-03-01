import Login from '../../../app/login/page'
import '@testing-library/jest-dom'
import { screen, fireEvent, act } from '@testing-library/react'
import { render } from '../../util'
import * as React from 'react'
import { signIn, getSession } from 'next-auth/react'
import { mockUser } from '../../../specs/mocks'

jest.mock('next/navigation', () => {
  return {
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
    })),
  }
})
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  getSession: jest.fn(),
}))

describe('Login page', () => {
  it('should render the page with its form', async () => {
    render(<Login />)

    const heading = await screen.findByRole('heading', { level: 2 })
    const registerForm = await screen.findByTestId('login-form')

    expect(heading).toHaveTextContent('Sign in to your account')
    expect(registerForm).toBeInTheDocument()
  })

  it('should invoke signIn when form is submitted', async () => {
    ;(signIn as jest.Mock).mockResolvedValueOnce({ error: null })
    ;(getSession as jest.Mock).mockResolvedValueOnce({ user: { username: mockUser.username } })

    render(<Login />)

    const email = screen.getByLabelText(/Email:/i)
    const password = screen.getByLabelText(/Password:/i)
    const submitButton = screen.getByTestId('login-button')

    await act(() => {
      fireEvent.change(email, { target: { value: mockUser.email } })
      fireEvent.change(password, { target: { value: mockUser.password } })
    })

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    expect(signIn).toHaveBeenCalledWith('credentials', {
      userId: mockUser.userId,
      password: mockUser.password,
      redirect: false,
    })
  })

  it('should reset form when response is successful and display success message, then reset message when form in focus', async () => {
    ;(signIn as jest.Mock).mockResolvedValueOnce({ error: null })
    ;(getSession as jest.Mock).mockResolvedValueOnce({ user: { username: mockUser.username } })

    render(<Login />)

    const email = screen.getByLabelText(/Email:/i)
    const password = screen.getByLabelText(/Password:/i)
    const submitButton = screen.getByTestId('login-button')

    await act(() => {
      fireEvent.change(password, { target: { value: 'password' } })
      fireEvent.change(email, { target: { value: 'mock.user@email.com' } })
    })

    expect(password).toHaveValue('password')
    expect(email).toHaveValue('mock.user@email.com')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    const successMessage = await screen.getByText(/Logging in.../i)

    expect(password).toHaveValue('')
    expect(email).toHaveValue('')
    expect(successMessage).toBeInTheDocument()

    await act(() => {
      fireEvent.change(email, {
        target: { value: 'mock.user@email.com' },
      })
    })

    expect(successMessage).toHaveTextContent('')
  })

  it('should display error message and not reset form when signIn fails', async () => {
    ;(signIn as jest.Mock).mockResolvedValueOnce({ error: 'CredentialsSignin' })

    render(<Login />)

    const email = screen.getByLabelText(/Email:/i)
    const password = screen.getByLabelText(/Password:/i)
    const submitButton = screen.getByTestId('login-button')

    await act(() => {
      fireEvent.change(password, { target: { value: 'password' } })
      fireEvent.change(email, { target: { value: 'mock.user@email.com' } })
    })

    expect(password).toHaveValue('password')
    expect(email).toHaveValue('mock.user@email.com')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    const errorMessage = await screen.getByText(
      /Failed to login due to an internal error. Please try again later./i
    )

    expect(password).toHaveValue('password')
    expect(email).toHaveValue('mock.user@email.com')
    expect(errorMessage).toBeInTheDocument()
  })
})
