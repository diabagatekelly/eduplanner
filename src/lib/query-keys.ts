export const queryKeys = {
  user: (userId: string) => ['user', userId] as const,
  student: (studentId: string) => ['student', studentId] as const,
}
