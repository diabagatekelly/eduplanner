import { useUser } from './use-user'

export function useStudents(userId: string) {
  const userQuery = useUser(userId)

  return {
    ...userQuery,
    data: userQuery.data?.linkedAccountsData?.students ?? [],
  }
}
