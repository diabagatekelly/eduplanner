import UnlinkAccountPopup from '../../../components/popups/unlinkAccountPopup'
import '@testing-library/jest-dom'
import { screen, fireEvent, act, waitFor } from '@testing-library/react'
import { render } from '../../util'
import * as React from 'react'
import { unlinkAccount } from '../../../api/controller'
import { mockUser, mockStudent } from '../../../specs/mocks'
import { toast } from 'sonner'

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn(), info: jest.fn() },
}))
jest.mock('../../../api/controller')

describe('Unlink Account Popup', () => {
  const teacher = { ...mockUser, linkedAccountsData: { students: [mockStudent.userId] } }
  const childArgs = { user: mockStudent, teacherId: teacher.userId }

  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2/15/2024'))
  })

  afterAll(() => {
    jest.useRealTimers()
    jest.resetAllMocks()
  })

  it('should show error when teacherId is missing and submit is clicked', async () => {
    const args = { user: mockStudent }
    render(<UnlinkAccountPopup {...{ onClose: jest.fn(), showModal: true, ...args }} />)
    const submitButton = screen.getByTestId('unlink-accounts-btn')
    await act(async () => {
      await fireEvent.click(submitButton)
    })
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Server is down. Try again later.')
    })
  })

  it('should render popup to add new student', async () => {
    let showModal
    let onClose = () => {
      showModal = false
    }

    render(<UnlinkAccountPopup {...{ onClose, showModal: true, ...childArgs }} />)

    const heading = await screen.findByRole('heading', { level: 3 })
    const studentInfo = await screen.findByRole('heading', { level: 5 })

    expect(heading).toHaveTextContent('Are you sure you want to remove this student?')
    expect(studentInfo).toHaveTextContent('mock.student@email.com')
  })

  it('should invoke unlinkAccount controller when form is submitted', async () => {
    ;(unlinkAccount as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve({ status: 200, data: { message: null, details: {} } })
    })

    let showModal
    let onClose = () => {
      showModal = false
    }

    render(<UnlinkAccountPopup {...{ onClose, showModal: true, ...childArgs }} />)

    const submitButton = screen.getByTestId('unlink-accounts-btn')
    const unlinkAccountsDTO = { teacherId: teacher.userId, studentId: mockStudent.userId }

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await expect(unlinkAccount).toHaveBeenCalledWith(unlinkAccountsDTO)
  })

  it('should close popup when response is successful and display success message', async () => {
    ;(unlinkAccount as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve({
        status: 200,
        data: { message: 'Successfully removed student.', details: {} },
      })
    })

    let showModal = true

    render(
      <UnlinkAccountPopup {...{ onClose: () => (showModal = false), showModal, ...childArgs }} />
    )
    const submitButton = await screen.getByTestId('unlink-accounts-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Successfully removed student.')
    })
  })

  it('should not close popup when response is not 200 or 500 and display error message', async () => {
    const error = {
      response: {
        status: 400,
        data: { status: 'failedTransaction', message: 'Erroneous response' },
      },
    }
    ;(unlinkAccount as jest.Mock).mockImplementation(() => {
      return Promise.reject(error)
    })

    let showModal = true

    render(
      <UnlinkAccountPopup {...{ onClose: () => (showModal = false), showModal, ...childArgs }} />
    )
    const submitButton = await screen.getByTestId('unlink-accounts-btn')

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
    ;(unlinkAccount as jest.Mock).mockImplementation(() => {
      return Promise.reject(error)
    })

    let showModal = true

    render(
      <UnlinkAccountPopup {...{ onClose: () => (showModal = false), showModal, ...childArgs }} />
    )
    const submitButton = await screen.getByTestId('unlink-accounts-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to unlink accounts due to an internal error. Please try again later.'
      )
    })
  })

  it('should not close popup when error is thrown with no response', async () => {
    ;(unlinkAccount as jest.Mock).mockImplementation(() => {
      return Promise.reject({ status: 500, message: 'Error thrown and caught.' })
    })
    let showModal = true

    render(
      <UnlinkAccountPopup {...{ onClose: () => (showModal = false), showModal, ...childArgs }} />
    )
    const submitButton = await screen.getByTestId('unlink-accounts-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Server is down. Try again later.')
    })
  })
})
