export const queryKeys = {
  user: (userId: string) => ['user', userId] as const,
  activities: (userId: string) => ['user', userId, 'activities'] as const,
  activity: (userId: string, name: string) => ['user', userId, 'activities', name] as const,
  cards: (userId: string, activityName: string) =>
    ['user', userId, 'activities', activityName, 'cards'] as const,
  students: (userId: string) => ['user', userId, 'students'] as const,
  student: (studentId: string) => ['student', studentId] as const,
}
