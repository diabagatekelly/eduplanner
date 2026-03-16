import DeleteActivityPopup from '../../../components/popups/deleteActivityPopup'
import '@testing-library/jest-dom'
import { screen, fireEvent, act, waitFor } from '@testing-library/react'
import { render } from '../../util'
import * as React from 'react'
import { deleteActivity } from '../../../api/controller'
import { mockActivity, mockUser } from '../../../specs/mocks'
import { toast } from 'sonner'

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn(), info: jest.fn() },
}))
jest.mock('../../../api/controller')
jest.mock('next/navigation', () => {
  return {
    useRouter: jest.fn(),
    usePathname: jest.fn(),
  }
})

describe('Delete Activity Popup', () => {
  const childArgs = { user: mockUser, item: { activityName: mockActivity.name } }

  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2/3/2024'))
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.useRealTimers()
  })

  it('should show error when userId is missing and submit is clicked', async () => {
    const args = { user: {} as any, item: { activityName: 'Test' } }
    render(<DeleteActivityPopup {...{ onClose: jest.fn(), showModal: true, ...args }} />)
    const submitButton = screen.getByTestId('delete-activity-btn')
    await act(async () => {
      await fireEvent.click(submitButton)
    })
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Server is down. Try again later.')
    })
  })

  it('should render popup to delete activity for main', async () => {
    let showModal
    let onClose = () => {
      showModal = false
    }

    render(<DeleteActivityPopup {...{ onClose, showModal: true, ...childArgs }} />)

    const heading = await screen.findByRole('heading', { level: 3 })
    const activtyName = await screen.findByRole('heading', { level: 5 })

    expect(heading).toHaveTextContent('Are you sure you want to delete this activity?')
    expect(activtyName).toHaveTextContent('Quran')
  })

  it('should invoke deleteActivity controller when form is submitted', async () => {
    ;(deleteActivity as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve({ status: 200, data: { message: null, details: {} } })
    })

    let showModal
    let onClose = () => {
      showModal = false
    }

    render(<DeleteActivityPopup {...{ onClose, showModal: true, ...childArgs }} />)
    const submitButton = screen.getByTestId('delete-activity-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await expect(deleteActivity).toHaveBeenCalledWith({
      userId: mockUser.userId,
      activityName: mockActivity.name,
    })
  })

  it('should not close popup when response is not 200 or 500 and display error message', async () => {
    const error = {
      response: {
        status: 400,
        data: { status: 'failedTransaction', message: 'Erroneous response' },
      },
    }
    ;(deleteActivity as jest.Mock).mockImplementation(() => {
      return Promise.reject(error)
    })

    let showModal
    let onClose = () => {
      showModal = false
    }

    render(<DeleteActivityPopup {...{ onClose, showModal: true, ...childArgs }} />)
    const submitButton = screen.getByTestId('delete-activity-btn')

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
    ;(deleteActivity as jest.Mock).mockImplementation(() => {
      return Promise.reject(error)
    })

    let showModal
    let onClose = () => {
      showModal = false
    }

    render(<DeleteActivityPopup {...{ onClose, showModal: true, ...childArgs }} />)
    const submitButton = screen.getByTestId('delete-activity-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to delete activity due to an internal error. Please try again later.'
      )
    })
  })

  it('should not close popup when error is thrown with no response', async () => {
    ;(deleteActivity as jest.Mock).mockImplementation(() => {
      return Promise.reject({ status: 500, message: 'Error thrown and caught.' })
    })

    let showModal
    let onClose = () => {
      showModal = false
    }

    render(<DeleteActivityPopup {...{ onClose, showModal: true, ...childArgs }} />)
    const submitButton = screen.getByTestId('delete-activity-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Server is down. Try again later.')
    })
  })

  it('should close popup when response is successful', async () => {
    ;(deleteActivity as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve({
        status: 200,
        data: { message: 'Successfully deleted activity.', details: {} },
      })
    })

    let showModal
    let onClose = () => {
      showModal = false
    }

    render(<DeleteActivityPopup {...{ onClose, showModal: true, ...childArgs }} />)
    const submitButton = screen.getByTestId('delete-activity-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Successfully deleted activity')
    })
  })
})
