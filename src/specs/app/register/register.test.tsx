import Register from '../../../app/register/page'
import '@testing-library/jest-dom'
import { screen, fireEvent, act, waitFor } from '@testing-library/react'
import { render } from '../../util'
import * as React from 'react'
import { mockStudent } from '../../../specs/mocks'
import { server } from '../../msw/server'
import { http, HttpResponse } from 'msw'

jest.mock('next/navigation', () => {
  return {
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
    })),
  }
})
jest.mock('next-auth/react', () => ({
  getSession: jest.fn().mockResolvedValue(null),
}))

async function fillStudentRegisterForm() {
  const firstName = screen.getByLabelText(/First Name:/i)
  const lastName = screen.getByLabelText(/Last Name:/i)
  const password = screen.getByLabelText(/Password:/i)
  const email = screen.getByLabelText(/Email:/i)
  const studentRadio = screen.getByDisplayValue(/Student/i)

  await act(() => {
    // fill out the form
    fireEvent.change(firstName, {
      target: { value: 'mock' },
    })
    fireEvent.change(lastName, {
      target: { value: 'student' },
    })
    fireEvent.change(password, {
      target: { value: 'password' },
    })
    fireEvent.change(email, {
      target: { value: 'mock.student@email.com' },
    })
    fireEvent.change(studentRadio, {
      target: { value: 'student' },
    })
  })
}

async function fillTeacherRegisterForm() {
  const firstName = screen.getByLabelText(/First Name:/i)
  const lastName = screen.getByLabelText(/Last Name:/i)
  const password = screen.getByLabelText(/Password:/i)
  const email = screen.getByLabelText(/Email:/i)
  const teacherRadio = screen.getByLabelText(/Teacher/i)

  await act(() => {
    // fill out the form
    fireEvent.change(firstName, {
      target: { value: 'mock' },
    })
    fireEvent.change(lastName, {
      target: { value: 'user' },
    })
    fireEvent.change(password, {
      target: { value: 'password' },
    })
    fireEvent.change(email, {
      target: { value: 'mock.user@email.com' },
    })
    fireEvent.click(teacherRadio)
  })
}

describe('Register page', () => {
  it('should render the page with its form', async () => {
    render(<Register />)

    const heading = await screen.findByRole('heading', { level: 2 })
    const registerForm = await screen.findByTestId('register-form')

    expect(heading).toHaveTextContent('Create an account')
    expect(registerForm).toBeInTheDocument()
  })

  it('should reset form fields after successful student registration', async () => {
    render(<Register />)

    const firstName = screen.getByLabelText(/First Name:/i)
    const submitButton = screen.getByText(/Create Account/i)

    await fillStudentRegisterForm()

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(firstName).toHaveValue('')
    })
  })

  it('should reset form fields after successful teacher registration', async () => {
    render(<Register />)

    const firstName = screen.getByLabelText(/First Name:/i)
    const submitButton = screen.getByText(/Create Account/i)

    await fillTeacherRegisterForm()

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(firstName).toHaveValue('')
    })
  })

  it('should reset form when response is successful and display success message, then reset message when form in focus', async () => {
    server.use(
      http.post('*/user/register', () =>
        HttpResponse.json({
          status: 'success',
          message: 'New user successfully created.',
          details: { user: mockStudent },
        })
      )
    )
    render(<Register />)

    const firstName = screen.getByLabelText(/First Name:/i)
    const lastName = screen.getByLabelText(/Last Name:/i)
    const password = screen.getByLabelText(/Password:/i)
    const email = screen.getByLabelText(/Email:/i)
    const submitButton = screen.getByText(/Create Account/i)

    await fillStudentRegisterForm()

    expect(firstName).toHaveValue('mock')
    expect(lastName).toHaveValue('student')
    expect(password).toHaveValue('password')
    expect(email).toHaveValue('mock.student@email.com')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    const successMessage = await screen.getByText(/New user successfully created./i)

    expect(firstName).toHaveValue('')
    expect(lastName).toHaveValue('')
    expect(password).toHaveValue('')
    expect(email).toHaveValue('')
    expect(successMessage).toBeInTheDocument()

    await act(() => {
      fireEvent.change(firstName, {
        target: { value: 'mock' },
      })
    })

    expect(successMessage).toHaveTextContent('')
  })

  it('should not reset form when response is not 200 or 500 and display error message', async () => {
    server.use(
      http.post('*/user/register', () =>
        HttpResponse.json(
          { status: 'failedTransaction', message: 'Erroneous response' },
          { status: 400 }
        )
      )
    )

    render(<Register />)

    const firstName = screen.getByLabelText(/First Name:/i)
    const lastName = screen.getByLabelText(/Last Name:/i)
    const password = screen.getByLabelText(/Password:/i)
    const email = screen.getByLabelText(/Email:/i)
    const submitButton = screen.getByText(/Create Account/i)

    await fillStudentRegisterForm()

    expect(firstName).toHaveValue('mock')
    expect(lastName).toHaveValue('student')
    expect(password).toHaveValue('password')
    expect(email).toHaveValue('mock.student@email.com')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    const errorMessage = await screen.findByText(/Erroneous response/i)

    expect(firstName).toHaveValue('mock')
    expect(lastName).toHaveValue('student')
    expect(password).toHaveValue('password')
    expect(email).toHaveValue('mock.student@email.com')
    expect(errorMessage).toBeInTheDocument()
  })

  it('should not reset form when response is 500 and display error message', async () => {
    server.use(
      http.post('*/user/register', () =>
        HttpResponse.json(
          { status: 'internalServerError', message: 'Server error' },
          { status: 500 }
        )
      )
    )
    render(<Register />)

    const firstName = screen.getByLabelText(/First Name:/i)
    const lastName = screen.getByLabelText(/Last Name:/i)
    const password = screen.getByLabelText(/Password:/i)
    const email = screen.getByLabelText(/Email:/i)
    const submitButton = screen.getByText(/Create Account/i)

    await fillStudentRegisterForm()

    expect(firstName).toHaveValue('mock')
    expect(lastName).toHaveValue('student')
    expect(password).toHaveValue('password')
    expect(email).toHaveValue('mock.student@email.com')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    const errorMessage = await screen.getByText(
      /Failed to create user due to an internal error. Please try again later./i
    )

    expect(firstName).toHaveValue('mock')
    expect(lastName).toHaveValue('student')
    expect(password).toHaveValue('password')
    expect(email).toHaveValue('mock.student@email.com')
    expect(errorMessage).toBeInTheDocument()
  })

  it('should not reset form when error is thrown with no response', async () => {
    server.use(http.post('*/user/register', () => HttpResponse.error()))
    render(<Register />)

    const firstName = screen.getByLabelText(/First Name:/i)
    const lastName = screen.getByLabelText(/Last Name:/i)
    const password = screen.getByLabelText(/Password:/i)
    const email = screen.getByLabelText(/Email:/i)
    const submitButton = screen.getByText(/Create Account/i)

    await fillStudentRegisterForm()

    expect(firstName).toHaveValue('mock')
    expect(lastName).toHaveValue('student')
    expect(password).toHaveValue('password')
    expect(email).toHaveValue('mock.student@email.com')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    const errorMessage = await screen.getByText(/Server is down. Try again later./i)
    expect(errorMessage).toBeInTheDocument()
  })
})
