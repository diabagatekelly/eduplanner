import { IActivity } from "./IActivity";
import { ILinkedAccounts } from "./ILinkedAccounts";
import { ISODateString } from "./isoDateType";


export interface IUser {
  userId: string, // btoa(email)
  firstName: string,
  lastName: string,
  username: string,
  email: string,
  password: string,
  accountType: string,
  lastLogin: ISODateString,
  activities?: IActivity[],
  linkedAccountsData?: ILinkedAccounts
}

export type IUserFormData = Required<Omit<IUser, 'userId'|'username'|'lastLogin'|'activities'|'linkedAccountsData'>>

export type IUserLogin = Pick<IUser, 'email'|'password'> & Partial<Pick<IUser, 'userId'>>;