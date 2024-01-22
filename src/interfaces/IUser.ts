import { ISODateString } from "./isoDateType";

export interface ILogin {
  email: string,
  password: string
}

export interface IUser {
  userId: string,
  firstName: string,
  lastName: string,
  username: string,
  email: string,
  password: string,
  accountType: string,
  lastLogin: ISODateString,
  teacherId?: string,
}

export type IUserFormData = Required<Omit<IUser, 'userId'|'username'|'lastLogin'|'teacherId'>>

