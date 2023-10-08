export interface IFindUser {
  email: string,
  password?: string
}

export interface IUserRegister {
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  accountType: string,
}