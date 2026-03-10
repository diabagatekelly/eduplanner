import { IUser } from '@/types/IUser'

/**
 * Resolves a studentId from the teacher's linkedAccountsData by matching
 * the student's username slug from the URL params.
 */
export function getStudentId(teacher: IUser | undefined, studentSlug: string): string {
  const tuple = teacher?.linkedAccountsData?.students?.find(([, name]) => name === studentSlug)
  return tuple?.[0] ?? ''
}
