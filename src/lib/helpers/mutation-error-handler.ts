import { toast } from 'sonner'

export function handleMutationError(error: unknown, action: string): void {
  const err = error as any
  if (!err.response) {
    toast.error('Server is down. Try again later.')
  } else if (err.response.status === 500) {
    toast.error(`Failed to ${action} due to an internal error. Please try again later.`)
  } else {
    toast.error(err.response.data.message)
  }
}
