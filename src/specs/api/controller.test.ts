import {createActivity, loginUser, registerUser} from '../../api/controller'
import { getCommand, postCommand } from '../../api/service'
import { mockActivity, mockUser } from '../mocks';

jest.mock('../../api/service');

describe('Controller', () => {
  it('should make a postCommand call to register a student', async () => {
    (postCommand as jest.Mock).mockImplementationOnce(async () => Promise.resolve(mockUser))
    const res = await registerUser(mockUser)

    expect(postCommand).toHaveBeenCalledWith(process.env.NEXT_REGISTER_USER_URL, mockUser)
    expect(res).toEqual(mockUser)
  })

  it('should make a getCommand call to login user', async () => {
    (getCommand as jest.Mock).mockImplementationOnce(async () => Promise.resolve(mockUser))
    const params = {email: mockUser.email, password: mockUser.password}
    const res = await loginUser(params)

    expect(getCommand).toHaveBeenCalledWith(process.env.NEXT_LOGIN_USER_URL, {params})
    expect(res).toEqual(mockUser)
  })

  it('should make a postCommand to create an activity', async () => {
    (postCommand as jest.Mock).mockImplementationOnce(async () => Promise.resolve(mockActivity))
    const res = await createActivity({userActivity: mockActivity, userId: 'someuserid'})

    expect(postCommand).toHaveBeenCalledWith(process.env.NEXT_CREATE_ACTIVITY_URL, {userActivity: mockActivity, userId: 'someuserid'})
    expect(res).toEqual(mockActivity)
  })
})

