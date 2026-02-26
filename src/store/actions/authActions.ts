import { IUser } from '@/types/IUser'
import { ISODateString } from '@/types/isoDateType'

type AuthAction = { type: 'AUTH' }
type UnauthAction = { type: 'UNAUTH' }

/**
 * @deprecated next-auth manages the session token. Use `signIn()` from next-auth/react instead.
 * Full removal in Layer 3.
 */
export function setAuthToken({ token, user }: { token: string; user: IUser }): AuthAction {
  sessionStorage.setItem('user_token', token)
  const today = new Date(Date.now()).toLocaleDateString('en-US', {
    timeZone: 'EST',
  }) as ISODateString
  sessionStorage.setItem('created_on', today)
  sessionStorage.setItem('user_data', JSON.stringify(user))
  return {
    type: 'AUTH',
  }
}

/**
 * @deprecated next-auth manages session cleanup. Use `signOut()` from next-auth/react instead.
 * Full removal in Layer 3.
 */
export function removeAuthToken(): UnauthAction {
  sessionStorage.removeItem('user_token')
  sessionStorage.removeItem('user_data')
  sessionStorage.removeItem('created_on')
  return {
    type: 'UNAUTH',
  }
}

/**
 * @deprecated Route protection handled by next-auth middleware. Full removal in Layer 3.
 */
export function hasToken(): AuthAction | UnauthAction {
  const hasToken = sessionStorage.getItem('user_token') !== null
  if (hasToken) {
    return {
      type: 'AUTH',
    }
  } else {
    return {
      type: 'UNAUTH',
    }
  }
}

/**
 * @deprecated Session expiry handled by next-auth `maxAge`. Full removal in Layer 3.
 */
export function hasExpired(): AuthAction | UnauthAction {
  const createdOn = sessionStorage.getItem('created_on')
  const today = new Date(Date.now()).toLocaleDateString('en-US', {
    timeZone: 'EST',
  }) as ISODateString
  const hasExpired = today !== createdOn

  if (hasExpired) {
    sessionStorage.removeItem('user_token')
    sessionStorage.removeItem('user_data')
    sessionStorage.removeItem('created_on')
    return {
      type: 'UNAUTH',
    }
  } else {
    return {
      type: 'AUTH',
    }
  }
}
