import { getCommand, postCommand, patchCommand, deleteCommand } from '../../api/service'
import axios from 'axios'
import { mockUser } from '../mocks'

// Create the mock instance inside the factory so jest.fn()s are initialized before
// service.ts calls axios.create() at module load time.
jest.mock('axios', () => {
  const instance = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  }
  return {
    __esModule: true,
    default: { create: () => instance },
  }
})

// Retrieve the singleton instance the factory always returns via create()
const mockInstance = (axios as any).create()
const mock = mockInstance as {
  get: jest.Mock
  post: jest.Mock
  patch: jest.Mock
  delete: jest.Mock
  interceptors: { request: { use: jest.Mock } }
}

const mockUrl = 'http://some-mock-url.com'
const mockGetResponse = { data: [{ id: 1, name: 'Joe Doe' }] }
const mockPostResponse = mockUser
const mockPatchResponse = { ...mockUser, lastLogin: '5/25/24' }
const mockDeleteResponse = {}

mock.get.mockResolvedValue(mockGetResponse)
mock.post.mockResolvedValue(mockPostResponse)
mock.patch.mockResolvedValue(mockPatchResponse)
mock.delete.mockResolvedValue(mockDeleteResponse)

describe('Service', () => {
  it('should call getCommand as expected', async () => {
    const mockOptions = { params: { email: 'mock@email.com' } }
    const res = await getCommand(mockUrl, mockOptions)

    expect(mock.get).toHaveBeenCalledWith(mockUrl, mockOptions)
    expect(res).toEqual(mockGetResponse)
  })

  it('should call axios postCommand with jsonData', async () => {
    const mockJsonData = {
      description: 'some description',
      hasCards: 'yes',
      name: 'Test',
      points: '0',
    }

    const res = await postCommand(mockUrl, mockJsonData)
    expect(mock.post).toHaveBeenCalledWith(mockUrl, mockJsonData)
    expect(res).toEqual(mockPostResponse)
  })

  it('should call axios patchCommand with jsonData', async () => {
    const mockJsonData = {
      userId: mockUser.userId,
      editData: {
        lastLogin: '5/25/24',
      },
    }

    const headers = { 'Content-Type': 'application/json' }
    const res = await patchCommand(mockUrl, mockJsonData)
    expect(mock.patch).toHaveBeenCalledWith(mockUrl, mockJsonData, { headers })
    expect(res).toEqual(mockPatchResponse)
  })

  it('should call axios deleteCommand with jsonData', async () => {
    const finalUrl = `${mockUrl}/${mockUser.userId}`

    const res = await deleteCommand(mockUrl, mockUser.userId)
    expect(mock.delete).toHaveBeenCalledWith(finalUrl)
    expect(res).toEqual(mockDeleteResponse)
  })

  describe('request interceptor', () => {
    // The interceptor callback was passed to mock.interceptors.request.use() at module load.
    // It does `await import('next-auth/react')` on each call, so jest.resetModules() +
    // jest.doMock() before invoking it controls which getSession mock the dynamic import resolves.
    const interceptor = mock.interceptors.request.use.mock.calls[0][0]

    beforeEach(() => {
      jest.resetModules()
    })

    it('should attach Authorization header when session has accessToken', async () => {
      jest.doMock('next-auth/react', () => ({
        getSession: jest.fn().mockResolvedValue({ accessToken: 'mock-token' }),
      }))

      const config = { headers: {} } as any
      const result = await interceptor(config)

      expect(result.headers.Authorization).toBe('Bearer mock-token')
    })

    it('should initialize headers when config.headers is undefined', async () => {
      jest.doMock('next-auth/react', () => ({
        getSession: jest.fn().mockResolvedValue({ accessToken: 'mock-token' }),
      }))

      const config = {} as any
      const result = await interceptor(config)

      expect(result.headers.Authorization).toBe('Bearer mock-token')
    })

    it('should not attach Authorization header when session is null', async () => {
      jest.doMock('next-auth/react', () => ({
        getSession: jest.fn().mockResolvedValue(null),
      }))

      const config = { headers: {} } as any
      const result = await interceptor(config)

      expect(result.headers.Authorization).toBeUndefined()
    })
  })
})
