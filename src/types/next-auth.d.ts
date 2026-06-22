import type { IUser } from './IUser'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    user: IUser & { id?: string }
  }
  interface User extends IUser {
    accessToken?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string
    username?: string
    accountType?: string
    accessToken?: string
  }
}
