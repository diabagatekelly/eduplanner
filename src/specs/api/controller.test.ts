import {createActivity, editUser, findUser, linkAccount, loginUser, registerUser} from '../../api/controller'
import { getCommand, patchCommand, postCommand } from '../../api/service'
import { mockActivity, mockStudent, mockUser } from '../mocks';

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

  it('should make a getCommand to find a user', async () => {
    (getCommand as jest.Mock).mockImplementationOnce(async () => Promise.resolve(mockUser))
    const params = {userId: mockUser.userId}
    const res = await findUser(params)

    expect(getCommand).toHaveBeenCalledWith(process.env.NEXT_GET_USER_URL, {params})
    expect(res).toEqual(mockUser)
  })

  it('should make a patchCommand to edit a user', async () => {
    const editedUser = {...mockUser, lastLogin: '5/24/24'};
    (patchCommand as jest.Mock).mockImplementationOnce(async () => Promise.resolve(editedUser))
    const params = {userId: mockUser.userId, editData: {lastLogin: '5/24/24'}}
    const res = await editUser(params)

    expect(patchCommand).toHaveBeenCalledWith(process.env.NEXT_EDIT_USER_URL, params)
    expect(res).toEqual(editedUser)
  })

  it('should make a postCommand to link user accounts', async () => {
    (postCommand as jest.Mock).mockImplementationOnce(async () => Promise.resolve({}))
    const params = {teacherId: mockUser.userId, studentId: mockStudent.userId}
    const res = await linkAccount(params)

    expect(postCommand).toHaveBeenCalledWith(process.env.NEXT_ADD_LINKED_ACCOUNT_URL, params)
    expect(res).toEqual({})
  })
})

