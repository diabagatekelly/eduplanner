import { IUser } from '@/types/IUser'

export function isTeacher(user: IUser | Partial<IUser> | undefined): boolean {
  return user?.accountType === 'teacher'
}
