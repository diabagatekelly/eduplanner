import { useUser } from './use-user'
import { IActivity } from '@/types/IActivity'

export function useActivities(userId: string) {
  const userQuery = useUser(userId)

  return {
    ...userQuery,
    data: userQuery.data?.activities ?? ([] as IActivity[]),
  }
}
