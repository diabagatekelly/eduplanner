import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createActivity, editActivity, deleteActivity } from '@/api/controller'
import { queryKeys } from '@/lib/query-keys'
import { IActivity } from '@/types/IActivity'

export function useCreateActivity(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userActivity: IActivity) => createActivity({ userActivity, userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) })
    },
  })
}

export function useEditActivity(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (updatedActivity: IActivity) => editActivity({ userId, updatedActivity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) })
    },
  })
}

export function useDeleteActivity(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (activityName: string) => deleteActivity({ userId, activityName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) })
    },
  })
}
