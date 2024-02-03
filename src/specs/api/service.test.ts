import {getApi, postCommand} from '@/api/service';
import axios from 'axios';
import { mockUser } from '../mocks';
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

const mockUrl = 'http://some-mock-url.com'
const mockGetResponse = { data: [ { id: 1, name: 'Joe Doe' } ] }
const mockPostResponse = mockUser

mockAxios.get.mockResolvedValue(mockGetResponse);
mockAxios.post.mockResolvedValue(mockPostResponse);

describe('Service', () => {
  it('should call getApi as expected', async () => {
    const mockOptions = { params: { email: 'mock@email.com' }}
    const res = await getApi(mockUrl, mockOptions);

    expect(mockAxios.get).toHaveBeenCalledWith(mockUrl, mockOptions);
    expect(res).toEqual(mockGetResponse)
  })

  it('should call axios post with jsonData', async () => {
    const mockJsonData = {
      description: "some description",
      hasCards: "yes",
      name: "Test",
      points : "0"
    }

    const res = await postCommand(mockUrl, mockJsonData)
    expect(mockAxios.post).toHaveBeenCalledWith(mockUrl, mockJsonData);
    expect(res).toEqual(mockPostResponse);
  })


})