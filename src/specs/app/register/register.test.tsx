import Register from '../../../app/register/page'
import '@testing-library/jest-dom'
import { screen, fireEvent, act } from '@testing-library/react'
import { render } from '../../util';
import * as React from 'react';
import { registerUser } from '../../../api/controller';
import { mockStudent } from '../../../specs/mocks';

jest.mock('next/navigation', () => {
  return {
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
    })),
  }
});
jest.mock('../../../api/controller');

async function fillRegisterForm() {
  const firstName = screen.getByLabelText(/First Name:/i)
  const lastName = screen.getByLabelText(/Last Name:/i)
  const password = screen.getByLabelText(/Password:/i)
  const email = screen.getByLabelText(/Email:/i)
  const studentRadio = screen.getByDisplayValue(/Student/i)

  await act(() => {
    // fill out the form
    fireEvent.change(firstName, {
      target: {value: 'mock'},
    })
    fireEvent.change(lastName, {
      target: {value: 'student'},
    })
    fireEvent.change(password, {
      target: {value: 'password'},
    })
    fireEvent.change(email, {
      target: {value: 'mock.student@email.com'},
    })
    fireEvent.change(studentRadio, {
      target: {value: 'student'},
    })
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

  it('should invoke registerUser controller when form is submitted', async () => {
    (registerUser as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve({status: 200, data: {message: null, details: {user: mockStudent}}})
    })
    render(<Register />)

    const submitButton = screen.getByText(/Create Account/i)

    await fillRegisterForm()

    await act(async () => {
      await fireEvent.click(submitButton)
    })
    
    await expect(registerUser).toHaveBeenCalledWith(mockStudent)
  })

  it('should reset form when response is successful and display success message, then reset message when form in focus', async () => {
    (registerUser as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve({status: 200, data: {status: 'success', message: 'New user successfully created.', details: {user: mockStudent} }})
    })
    render(<Register />)

    const firstName = screen.getByLabelText(/First Name:/i)
    const lastName = screen.getByLabelText(/Last Name:/i)
    const password = screen.getByLabelText(/Password:/i)
    const email = screen.getByLabelText(/Email:/i)
    const submitButton = screen.getByText(/Create Account/i)

    await fillRegisterForm()

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
        target: {value: 'mock'},
      })
    })

    expect(successMessage).toHaveTextContent('')
    
  })

  it('should not reset form when response is not 200 or 500 and display error message', async () => {
    const error = {response: {status: 400, data: {status: 'failedTransaction', message: 'Erroneous response'}}};
    (registerUser as jest.Mock).mockImplementationOnce(() => {
      return Promise.reject(error)
    })

    render(<Register />)

    const firstName = screen.getByLabelText(/First Name:/i)
    const lastName = screen.getByLabelText(/Last Name:/i)
    const password = screen.getByLabelText(/Password:/i)
    const email = screen.getByLabelText(/Email:/i)
    const submitButton = screen.getByText(/Create Account/i)

    await fillRegisterForm()

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
    const error = {response: {status: 500, data: {status: 'internalServerError', message: 'Server error'}}};
    (registerUser as jest.Mock).mockImplementationOnce(() => {
      return Promise.reject(error)
    })
    jest.spyOn(console, 'log')
    render(<Register />)

    const firstName = screen.getByLabelText(/First Name:/i)
    const lastName = screen.getByLabelText(/Last Name:/i)
    const password = screen.getByLabelText(/Password:/i)
    const email = screen.getByLabelText(/Email:/i)
    const submitButton = screen.getByText(/Create Account/i)

    await fillRegisterForm()

    expect(firstName).toHaveValue('mock')
    expect(lastName).toHaveValue('student')
    expect(password).toHaveValue('password')
    expect(email).toHaveValue('mock.student@email.com')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    const errorMessage = await screen.getByText(/Failed to create user due to an internal error. Please try again later./i)
  
    expect(firstName).toHaveValue('mock')
    expect(lastName).toHaveValue('student')
    expect(password).toHaveValue('password')
    expect(email).toHaveValue('mock.student@email.com')
    expect(errorMessage).toBeInTheDocument()
    expect(console.log).toHaveBeenCalledWith(error)
  })

  it('should not reset form when error is thrown with no response', async () => {
    (registerUser as jest.Mock).mockImplementationOnce(() => {
      return Promise.reject({status: 500, message: 'Error thrown and caught.'});
    });
    jest.spyOn(console, 'log')
    render(<Register />)


    const firstName = screen.getByLabelText(/First Name:/i)
    const lastName = screen.getByLabelText(/Last Name:/i)
    const password = screen.getByLabelText(/Password:/i)
    const email = screen.getByLabelText(/Email:/i)
    const submitButton = screen.getByText(/Create Account/i)

    await fillRegisterForm()

    expect(firstName).toHaveValue('mock')
    expect(lastName).toHaveValue('student')
    expect(password).toHaveValue('password')
    expect(email).toHaveValue('mock.student@email.com')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    const errorMessage = await screen.getByText(/Server is down. Try again later./i)
    expect(errorMessage).toBeInTheDocument()  
    expect(console.log).toHaveBeenCalledWith({status: 500, message: 'Error thrown and caught.'})
  })
})