import { toast } from 'sonner'
import { handleMutationError } from '@/lib/helpers/mutation-error-handler'

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
}))

describe('handleMutationError', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('shows server down message when error has no response', () => {
    const error = new Error('Network Error')
    handleMutationError(error, 'create activity')

    expect(toast.error).toHaveBeenCalledWith('Server is down. Try again later.')
  })

  it('shows internal error message for 500 status', () => {
    const error = {
      response: {
        status: 500,
        data: { message: 'Internal Server Error' },
      },
    }
    handleMutationError(error, 'create activity')

    expect(toast.error).toHaveBeenCalledWith(
      'Failed to create activity due to an internal error. Please try again later.'
    )
  })

  it('shows API error message for non-500 errors', () => {
    const error = {
      response: {
        status: 404,
        data: { message: 'User not found' },
      },
    }
    handleMutationError(error, 'find student')

    expect(toast.error).toHaveBeenCalledWith('User not found')
  })
})
