import { IUser } from '@/types/IUser'

type UserAction =
  | { type: 'SCAN' }
  | { type: 'QUERY'; userInfo: keyof IUser }
  | { type: 'EDIT'; editProps: Record<string, unknown>[] }
  | { type: 'POPULATE'; allData: Partial<IUser> }
  | { type: 'RESET' }
  | { type: string }

// State starts empty and is populated after login — cast is intentional (removed in Layer 3)
const INITIAL_STATE = {} as IUser

export default function user(userData: IUser = INITIAL_STATE, action: UserAction): IUser {
  /* istanbul ignore next */
  switch (action.type) {
    case 'SCAN':
      /* istanbul ignore next */
      return { ...userData }

    case 'QUERY':
      /* istanbul ignore next */
      return userData[action.userInfo] as unknown as IUser

    case 'EDIT': {
      const newUserData: Record<string, unknown> = { ...userData }
      action.editProps.forEach((prop) => {
        const [key] = Object.keys(prop)
        const [value] = Object.values(prop)
        newUserData[key] = value
      })
      return newUserData as unknown as IUser
    }

    case 'POPULATE':
      return { ...userData, ...action.allData } as IUser

    case 'RESET':
      return {} as IUser

    default:
      return userData
  }
}
