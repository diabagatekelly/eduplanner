import { useMutation, useQueryClient } from '@tanstack/react-query'
import { linkAccount, unlinkAccount } from '@/api/controller'
import { queryKeys } from '@/lib/query-keys'

function invalidateUserAndStudent(queryClient: ReturnType<typeof useQueryClient>, userId: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.student(userId) }),
  ])
}

export function useLinkStudent(teacherId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (studentId: [string, string]) => linkAccount({ teacherId, studentId }),
    onSuccess: async () => {
      await invalidateUserAndStudent(queryClient, teacherId)
    },
  })
}

export function useUnlinkStudent(teacherId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (studentId: string) => unlinkAccount({ teacherId, studentId }),
    onSuccess: async () => {
      await invalidateUserAndStudent(queryClient, teacherId)
    },
  })
}
