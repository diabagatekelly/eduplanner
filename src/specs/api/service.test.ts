import { getCommand, postCommand, patchCommand, deleteCommand } from '../../api/service'
import axios from 'axios'
import { mockUser } from '../mocks'
jest.mock('axios')
const mockAxios = axios as jest.Mocked<typeof axios>

const mockUrl = 'http://some-mock-url.com'
const mockGetResponse = { data: [{ id: 1, name: 'Joe Doe' }] }
const mockPostResponse = mockUser
const mockPatchResponse = { ...mockUser, lastLogin: '5/25/24' }
const mockDeleteResponse = {}

mockAxios.get.mockResolvedValue(mockGetResponse)
mockAxios.post.mockResolvedValue(mockPostResponse)
mockAxios.patch.mockResolvedValue(mockPatchResponse)
mockAxios.delete.mockResolvedValue(mockDeleteResponse)

describe('Service', () => {
  it('should call getCommand as expected', async () => {
    const mockOptions = { params: { email: 'mock@email.com' } }
    const res = await getCommand(mockUrl, mockOptions)

    expect(mockAxios.get).toHaveBeenCalledWith(mockUrl, mockOptions)
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
    expect(mockAxios.post).toHaveBeenCalledWith(mockUrl, mockJsonData)
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
    expect(mockAxios.patch).toHaveBeenCalledWith(mockUrl, mockJsonData, { headers })
    expect(res).toEqual(mockPatchResponse)
  })

  it('should call axios deleteCommand with jsonData', async () => {
    const finalUrl = `${mockUrl}/${mockUser.userId}`

    const res = await deleteCommand(mockUrl, mockUser.userId)
    expect(mockAxios.delete).toHaveBeenCalledWith(finalUrl)
    expect(res).toEqual(mockDeleteResponse)
  })
})
