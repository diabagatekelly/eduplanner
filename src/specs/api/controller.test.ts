import {registerUser} from '@/api/controller'
import { postApi } from '../../api/service'
import { mockUser } from '../mocks';

jest.mock('../../api/service');



describe('Controller', () => {
  it('should make a postApi call to register a student', async () => {
    (postApi as jest.Mock).mockImplementation(async () => Promise.resolve(mockUser))
    const res = await registerUser(mockUser)

    expect(postApi).toHaveBeenCalledWith(process.env.NEXT_REGISTER_USER_URL, mockUser)
    expect(res).toEqual(mockUser)
  })
})

