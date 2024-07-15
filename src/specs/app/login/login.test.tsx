import Login from '../../../app/login/page'
import '@testing-library/jest-dom'
import { screen, fireEvent, act } from '@testing-library/react'
import { render } from '../../util';
import * as React from 'react';
import { loginUser } from '../../../api/controller';
import { mockUser } from '../../../specs/mocks';

jest.mock('next/navigation', () => {
  return {
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
    })),
  }
});
jest.mock('../../../api/controller');

describe('Login page', () => {
  it('should render the page with its form', async () => {
    render(<Login />)
 
    const heading = await screen.findByRole('heading', { level: 2 })
    const registerForm = await screen.findByTestId('login-form')
 
    expect(heading).toHaveTextContent('Sign in to your account')
    expect(registerForm).toBeInTheDocument()
  })

  it('should invoke loginUser controller when form is submitted', async () => {
    (loginUser as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve({status: 200, data: {message: null, details: {user: mockUser}}})
    })
    render(<Login />)

    const email = screen.getByLabelText(/Email:/i)
    const password = screen.getByLabelText(/Password:/i)
    const submitButton = screen.getByTestId('login-button')
    const userCredentials = {
      password: mockUser.password, 
      userId: mockUser.userId
    }

    await act(() => {
      // fill out the form
      fireEvent.change(email, {
        target: {value: 'mock.user@email.com'}
      })
      fireEvent.change(password, {
        target: {value: 'password'}
      })
    })

    await act(async () => {
      await fireEvent.click(submitButton)
    })
    
    await expect(loginUser).toHaveBeenCalledWith(userCredentials)
  })

  it('should reset form when response is successful and display success message, then reset message when form in focus', async () => {
    (loginUser as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve({status: 200, data: {status: 'success', message: 'Found user', details: {user: mockUser} }})
    })
    render(<Login />)

    const email = screen.getByLabelText(/Email:/i)
    const password = screen.getByLabelText(/Password:/i)
    const submitButton = screen.getByTestId('login-button')

    await act(() => {
      // fill out the form
      fireEvent.change(password, {
        target: {value: 'password'},
      })
      fireEvent.change(email, {
        target: {value: 'mock.user@email.com'},
      })
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
        target: {value: 'mock.user@email.com'},
      })
    })

    expect(successMessage).toHaveTextContent('')
  })

  it('should not reset form when response is not 200 or 500 and display error message', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => null);
    const error = {response: {status: 400, data: {status: 'failedTransaction', message: 'Erroneous response'}}};
    (loginUser as jest.Mock).mockImplementationOnce(() => {
      return Promise.reject(error)
    })

    render(<Login />)

    const email = screen.getByLabelText(/Email:/i)
    const password = screen.getByLabelText(/Password:/i)
    const submitButton = screen.getByTestId('login-button')

    await act(() => {
      // fill out the form
      fireEvent.change(password, {
        target: {value: 'password'},
      })
      fireEvent.change(email, {
        target: {value: 'mock.user@email.com'},
      })
    })

    expect(password).toHaveValue('password')
    expect(email).toHaveValue('mock.user@email.com')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    const errorMessage = await screen.findByText(/Erroneous response/i)
  
    expect(password).toHaveValue('password')
    expect(email).toHaveValue('mock.user@email.com')
    expect(errorMessage).toBeInTheDocument()
  })

  it('should not reset form when response is 500 and display error message', async () => {
    const error = {response: {status: 500, data: {status: 'internalServerError', message: 'Server error'}}};
    (loginUser as jest.Mock).mockImplementationOnce(() => {
      return Promise.reject(error)
    })
    render(<Login />)

    const email = screen.getByLabelText(/Email:/i)
    const password = screen.getByLabelText(/Password:/i)
    const submitButton = screen.getByTestId('login-button')

    await act(() => {
      // fill out the form
      fireEvent.change(password, {
        target: {value: 'password'},
      })
      fireEvent.change(email, {
        target: {value: 'mock.user@email.com'},
      })
    })

    expect(password).toHaveValue('password')
    expect(email).toHaveValue('mock.user@email.com')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    const errorMessage = await screen.getByText(/Failed to login due to an internal error. Please try again later./i)
  
    expect(password).toHaveValue('password')
    expect(email).toHaveValue('mock.user@email.com')
    expect(errorMessage).toBeInTheDocument()
    expect(console.log).toHaveBeenCalledWith(error)
  })

  it('should not reset form when error is thrown with no response', async () => {
    (loginUser as jest.Mock).mockImplementationOnce(() => {
      return Promise.reject({status: 500, message: 'Error thrown and caught.'});
    });
    render(<Login />)

    const email = screen.getByLabelText(/Email:/i)
    const password = screen.getByLabelText(/Password:/i)
    const submitButton = screen.getByTestId('login-button')

    await act(() => {
      // fill out the form
      fireEvent.change(password, {
        target: {value: 'password'},
      })
      fireEvent.change(email, {
        target: {value: 'mock.user@email.com'},
      })
    })

    expect(password).toHaveValue('password')
    expect(email).toHaveValue('mock.user@email.com')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    const errorMessage = await screen.getByText(/Server is down. Try again later./i)
    expect(errorMessage).toBeInTheDocument()  
    expect(console.log).toHaveBeenCalledWith({status: 500, message: 'Error thrown and caught.'})
  })
})