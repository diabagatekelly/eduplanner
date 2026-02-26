import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { loginUser } from '@/api/controller'
import { IUser } from '@/types/IUser'
import { IResponse } from '@/types/IApiResponse'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        userId: { label: 'User ID' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        if (!credentials?.userId || !credentials?.password) return null

        try {
          const response = (await loginUser({
            userId: credentials.userId as string,
            password: credentials.password as string,
          })) as unknown as IResponse<{ token: string; user: IUser }>

          if (response?.status === 200) {
            const { token, user } = response.data.details
            return { ...user, id: user.userId, accessToken: token }
          }
        } catch {
          // Login request failed — return null to signal auth failure
        }

        return null
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.user = user
        token.accessToken = (user as any).accessToken
      }
      return token
    },
    session({ session, token }) {
      session.user = token.user as any
      session.accessToken = token.accessToken as string
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})
