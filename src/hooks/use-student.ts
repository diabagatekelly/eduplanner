import { useQuery } from '@tanstack/react-query'
import { findUser } from '@/api/controller'
import { queryKeys } from '@/lib/query-keys'
import { IUser } from '@/types/IUser'

export function useStudent(studentId: string) {
  return useQuery({
    queryKey: queryKeys.student(studentId),
    queryFn: async () => {
      const response = await findUser({ userId: studentId })
      return response.data.details.student as IUser
    },
    enabled: !!studentId,
  })
}
