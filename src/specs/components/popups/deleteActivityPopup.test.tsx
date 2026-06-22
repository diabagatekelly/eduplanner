import DeleteActivityPopup from '../../../components/popups/deleteActivityPopup'
import '@testing-library/jest-dom'
import { screen, fireEvent, act, waitFor } from '@testing-library/react'
import { render } from '../../util'
import * as React from 'react'
import { mockActivity, mockUser } from '../../../specs/mocks'
import { toast } from 'sonner'
import { server } from '../../msw/server'
import { http, HttpResponse } from 'msw'

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn(), info: jest.fn() },
}))
jest.mock('next/navigation', () => {
  return {
    useRouter: jest.fn(),
    usePathname: jest.fn(),
  }
})

describe('Delete Activity Popup', () => {
  const childArgs = { user: mockUser, item: { activityName: mockActivity.name } }

  afterEach(() => {
    jest.clearAllMocks()
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
    const onClose = jest.fn()

    render(<DeleteActivityPopup {...{ onClose, showModal: true, ...childArgs }} />)
    const submitButton = screen.getByTestId('delete-activity-btn')

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Successfully deleted activity')
    })
  })

  it('should not close popup when response is not 200 or 500 and display error message', async () => {
    server.use(
      http.delete('*/user/activities/delete/*', () =>
        HttpResponse.json(
          { status: 'failedTransaction', message: 'Erroneous response' },
          { status: 400 }
        )
      )
    )

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
    server.use(
      http.delete('*/user/activities/delete/*', () =>
        HttpResponse.json(
          { status: 'internalServerError', message: 'Server error' },
          { status: 500 }
        )
      )
    )

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
    server.use(http.delete('*/user/activities/delete/*', () => HttpResponse.error()))

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
