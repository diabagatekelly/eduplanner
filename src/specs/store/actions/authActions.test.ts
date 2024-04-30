import { ISODateString } from '../../../interfaces/isoDateType';
import {hasExpired, hasToken, removeAuthToken, setAuthToken} from '../../../store/actions/authActions';
import { formatISODate } from '../../../utils/formatDate';
import { mockUser } from '../../mocks';

describe('Auth actions', () => {
  let mockSessionStorage;

  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-02-04'))
    sessionStorage.clear()
    mockSessionStorage = sessionStorage;
  })

  afterEach(() => {
    mockSessionStorage.clear()
    jest.clearAllMocks()
    jest.useRealTimers()
  })

  it('should set user_token, created_on, and user_data as expected', () => {
    const token = '123-token'
    const date = formatISODate(new Date('2024-02-04').toISOString() as ISODateString)
    setAuthToken({token, user: mockUser})
    expect(mockSessionStorage.getItem('user_token')).toEqual(token)
    expect(mockSessionStorage.getItem('created_on')).toEqual(date)
    expect(mockSessionStorage.getItem('user_data')).toEqual(JSON.stringify(mockUser))
  })

  it('should remove user_token, created_on, and user_data as expected', () => {
    const token = '123-token'
    const date = formatISODate(new Date('2024-02-04').toISOString() as ISODateString)
    
    mockSessionStorage.setItem("user_token", token);
    mockSessionStorage.setItem("created_on", date)
    mockSessionStorage.setItem("user_data", JSON.stringify(mockUser))

    removeAuthToken()
    expect(mockSessionStorage.getItem('user_token')).toBeNull()
    expect(mockSessionStorage.getItem('created_on')).toBeNull()
    expect(mockSessionStorage.getItem('user_data')).toBeNull()
  })

  it('should set reducer type to AUTH when token is present', () => {
    const token = '123-token'
    mockSessionStorage.setItem("user_token", token);

    const findsToken = hasToken()
    expect(findsToken).toMatchObject({type: 'AUTH'})
  })

  it('should set reducer type to UNAUTH when token is not present', () => {
    const findsToken = hasToken()
    expect(findsToken).toMatchObject({type: 'UNAUTH'})
  })

  it('should set reducer type to AUTH when token has not expired', () => {
    const token = '123-token'
    const date = formatISODate(new Date('2024-02-04').toISOString() as ISODateString)
    
    mockSessionStorage.setItem("user_token", token);
    mockSessionStorage.setItem("created_on", date)
    mockSessionStorage.setItem("user_data", JSON.stringify(mockUser))

    const checkExpiration = hasExpired()
    expect(checkExpiration).toMatchObject({type: 'AUTH'})
  })

  it('should set reducer type to UNAUTH when token has expired', () => {
    const token = '123-token'
    const date = formatISODate(new Date('2024-02-03').toISOString() as ISODateString)
    
    mockSessionStorage.setItem("user_token", token);
    mockSessionStorage.setItem("created_on", date)
    mockSessionStorage.setItem("user_data", JSON.stringify(mockUser))

    const checkExpiration = hasExpired()
    expect(checkExpiration).toMatchObject({type: 'UNAUTH'})
    expect(mockSessionStorage.getItem('user_token')).toBeNull()
    expect(mockSessionStorage.getItem('created_on')).toBeNull()
    expect(mockSessionStorage.getItem('user_data')).toBeNull()
  })
})