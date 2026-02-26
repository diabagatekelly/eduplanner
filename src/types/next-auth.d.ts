import type { IUser } from './IUser'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    user: IUser
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    user?: IUser
  }
}
