import {registerUser} from '@/api/controller'
import { postCommand } from '../../api/service'
import { mockUser } from '../mocks';

jest.mock('../../api/service');



describe('Controller', () => {
  it('should make a postCommand call to register a student', async () => {
    (postCommand as jest.Mock).mockImplementation(async () => Promise.resolve(mockUser))
    const res = await registerUser(mockUser)

    expect(postCommand).toHaveBeenCalledWith(process.env.NEXT_REGISTER_USER_URL, mockUser)
    expect(res).toEqual(mockUser)
  })
})

