import DeleteAccountPopup from '../../../components/popups/deleteAccountPopup'
import '@testing-library/jest-dom'
import { screen, fireEvent, act, waitFor } from '@testing-library/react'
import { render } from '../../util'
import * as React from 'react'
import { deleteUser } from '../../../api/controller'
import { mockUser } from '../../../specs/mocks'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn(), info: jest.fn() },
}))
jest.mock('../../../api/controller')
jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
}))

describe('Delete Account Popup', () => {
  const childArgs = { user: mockUser }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render popup to delete account for main', async () => {
    let showModal
    let onClose = () => {
      showModal = false
    }

    render(<DeleteAccountPopup {...{ onClose, showModal: true, ...childArgs }} />)

    const heading = await screen.findByRole('heading', { level: 3 })
    const studentInfo = await screen.findByRole('heading', { level: 5 })

    expect(heading).toHaveTextContent('Are you sure you want to delete this account forever?')
    expect(studentInfo).toHaveTextContent('mock user - mock.user@email.com')
  })

  it('should invoke deleteAccount controller when form is submitted', async () => {
    ;(deleteUser as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve({ status: 200, data: { message: null, details: {} } })
    })

    let showModal
    let onClose = () => {
      showModal = false
    }

    render(<DeleteAccountPopup {...{ onClose, showModal: true, ...childArgs }} />)

    const submitButton = screen.getByTestId('delete-account-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await expect(deleteUser).toHaveBeenCalledWith(mockUser.userId)
  })

  it('should not close popup when response is not 200 or 500 and display error message', async () => {
    const error = {
      response: {
        status: 400,
        data: { status: 'failedTransaction', message: 'Erroneous response' },
      },
    }
    ;(deleteUser as jest.Mock).mockImplementation(() => {
      return Promise.reject(error)
    })

    let showModal = true

    render(
      <DeleteAccountPopup {...{ onClose: () => (showModal = false), showModal, ...childArgs }} />
    )
    const submitButton = await screen.getByTestId('delete-account-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erroneous response')
    })
  })

  it('should not close popup when response is 500 and display error message', async () => {
    const error = {
      response: { status: 500, data: { status: 'internalServerError', message: 'Server error' } },
    }
    ;(deleteUser as jest.Mock).mockImplementation(() => {
      return Promise.reject(error)
    })

    let showModal = true

    render(
      <DeleteAccountPopup {...{ onClose: () => (showModal = false), showModal, ...childArgs }} />
    )
    const submitButton = await screen.getByTestId('delete-account-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to delete account due to an internal error. Please try again later.'
      )
    })
  })

  it('should not close popup when error is thrown with no response', async () => {
    ;(deleteUser as jest.Mock).mockImplementation(() => {
      return Promise.reject({ status: 500, message: 'Error thrown and caught.' })
    })

    let showModal = true

    render(
      <DeleteAccountPopup {...{ onClose: () => (showModal = false), showModal, ...childArgs }} />
    )
    const submitButton = await screen.getByTestId('delete-account-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Server is down. Try again later.')
    })
  })

  it('should close popup and call signOut with register when account is deleted', async () => {
    ;(deleteUser as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve({
        status: 200,
        data: { message: 'Successfully added new student.', details: {} },
      })
    })

    let showModal = true

    render(
      <DeleteAccountPopup {...{ onClose: () => (showModal = false), showModal, ...childArgs }} />
    )
    const submitButton = await screen.getByTestId('delete-account-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/register' })
  })
})
