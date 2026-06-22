import { IActivity } from './IActivity'
import { ILinkedAccounts } from './ILinkedAccounts'
import { ISODateString } from './ISODateString'

export interface IUser {
  userId: string // btoa(email)
  firstName: string
  lastName: string
  username: string
  email: string
  password: string
  accountType: string
  lastLogin: ISODateString
  linkedAccountsData: ILinkedAccounts
  activities: IActivity[]
  students?: Record<string, IUser>
}

export type IUserLogin = Pick<IUser, 'userId' | 'password'> & Partial<Pick<IUser, 'userId'>>
