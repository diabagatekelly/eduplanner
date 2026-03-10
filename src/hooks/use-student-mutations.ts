import { useMutation, useQueryClient } from '@tanstack/react-query'
import { linkAccount, unlinkAccount } from '@/api/controller'
import { queryKeys } from '@/lib/query-keys'

export function useLinkStudent(teacherId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (studentId: [string, string]) => linkAccount({ teacherId, studentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user(teacherId) })
    },
  })
}

export function useUnlinkStudent(teacherId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (studentId: string) => unlinkAccount({ teacherId, studentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user(teacherId) })
    },
  })
}
