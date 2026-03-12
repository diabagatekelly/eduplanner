import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createActivity, editActivity, deleteActivity } from '@/api/controller'
import { queryKeys } from '@/lib/query-keys'
import { IActivity } from '@/types/IActivity'

function invalidateUserAndStudent(queryClient: ReturnType<typeof useQueryClient>, userId: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.student(userId) }),
  ])
}

export function useCreateActivity(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userActivity: IActivity) => createActivity({ userActivity, userId }),
    onSuccess: async () => {
      await invalidateUserAndStudent(queryClient, userId)
    },
  })
}

export function useEditActivity(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (updatedActivity: IActivity) => editActivity({ userId, updatedActivity }),
    onSuccess: async () => {
      await invalidateUserAndStudent(queryClient, userId)
    },
  })
}

export function useDeleteActivity(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (activityName: string) => deleteActivity({ userId, activityName }),
    onSuccess: async () => {
      await invalidateUserAndStudent(queryClient, userId)
    },
  })
}
