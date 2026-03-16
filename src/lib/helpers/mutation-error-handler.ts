import { toast } from 'sonner'

function isAxiosLikeError(
  error: unknown
): error is { response: { status: number; data: Record<string, unknown> } } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as any).response === 'object' &&
    (error as any).response !== null &&
    typeof (error as any).response.status === 'number'
  )
}

export function handleMutationError(error: unknown, action: string): void {
  if (!isAxiosLikeError(error)) {
    toast.error('Server is down. Try again later.')
    return
  }

  const { status, data } = error.response

  if (status === 500) {
    toast.error(`Failed to ${action} due to an internal error. Please try again later.`)
  } else if (typeof data?.message === 'string') {
    toast.error(data.message)
  } else {
    toast.error(`Failed to ${action}. Please try again.`)
  }
}
