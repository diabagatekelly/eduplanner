export interface IUserLogin {
  userId: string,
  password: string
}

export interface IUserRegister {
  firstName: string,
  lastName: string,
  username: string,
  email: string,
  password: string,
  accountType: string,
}