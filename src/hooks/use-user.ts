import { useQuery } from '@tanstack/react-query'
import { findUser } from '@/api/controller'
import { queryKeys } from '@/lib/query-keys'
import { IUser } from '@/types/IUser'

export function useUser(userId: string) {
  return useQuery({
    queryKey: queryKeys.user(userId),
    queryFn: async () => {
      const response = await findUser({ userId })
      return response.data.details.student as IUser
    },
    enabled: !!userId,
  })
}
