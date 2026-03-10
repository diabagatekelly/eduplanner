import { useUser } from './use-user'

export function useActivity(userId: string, activityName: string) {
  const userQuery = useUser(userId)

  return {
    ...userQuery,
    data: userQuery.data?.activities?.find((a) => a.name === activityName),
  }
}
