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
const mock = (axios as any).create() as {
  get: jest.Mock
  post: jest.Mock
  patch: jest.Mock
  delete: jest.Mock
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
})
