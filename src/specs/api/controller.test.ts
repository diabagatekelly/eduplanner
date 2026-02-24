import {
  createActivity,
  editActivity,
  deleteUser,
  editUser,
  findUser,
  linkAccount,
  loginUser,
  registerUser,
  unlinkAccount,
  deleteActivity,
  createCards,
  activateCard,
  editAnyCardAttr,
  editCardStage,
  resetCardStage,
  requestCardReview,
  deleteCard,
} from '../../api/controller'
import { deleteCommand, getCommand, patchCommand, postCommand } from '../../api/service'
import { mockActivity, mockStudent, mockUser, mockUserCard } from '../mocks'

jest.mock('../../api/service')

describe('Controller', () => {
  describe('Auth', () => {
    it('should make a postCommand call to register a student', async () => {
      ;(postCommand as jest.Mock).mockImplementationOnce(async () => Promise.resolve(mockUser))
      const res = await registerUser(mockUser)

      expect(postCommand).toHaveBeenCalledWith(process.env.NEXT_REGISTER_USER_URL, mockUser)
      expect(res).toEqual(mockUser)
    })

    it('should make a getCommand call to login user', async () => {
      ;(getCommand as jest.Mock).mockImplementationOnce(async () => Promise.resolve(mockUser))
      const params = { email: mockUser.email, password: mockUser.password }
      const res = await loginUser(params)

      expect(getCommand).toHaveBeenCalledWith(process.env.NEXT_LOGIN_USER_URL, { params })
      expect(res).toEqual(mockUser)
    })
  })

  describe('Users', () => {
    it('should make a getCommand call to find a user', async () => {
      ;(getCommand as jest.Mock).mockImplementationOnce(async () => Promise.resolve(mockUser))
      const params = { userId: mockUser.userId }
      const res = await findUser(params)

      expect(getCommand).toHaveBeenCalledWith(process.env.NEXT_GET_USER_URL, { params })
      expect(res).toEqual(mockUser)
    })

    it('should make a patchCommand call to edit a user', async () => {
      const editedUser = { ...mockUser, lastLogin: '5/24/24' }
      ;(patchCommand as jest.Mock).mockImplementationOnce(async () => Promise.resolve(editedUser))
      const params = { userId: mockUser.userId, editData: { lastLogin: '5/24/24' } }
      const res = await editUser(params)

      expect(patchCommand).toHaveBeenCalledWith(process.env.NEXT_EDIT_USER_URL, params)
      expect(res).toEqual(editedUser)
    })

    it('should make a deleteCommand call to delete user', async () => {
      ;(deleteCommand as jest.Mock).mockImplementationOnce(async () => Promise.resolve({}))

      const res = await deleteUser(mockUser.userId)
      expect(res).toEqual({})
    })
  })

  describe('Linked accounts', () => {
    it('should make a postCommand call to link user accounts', async () => {
      ;(postCommand as jest.Mock).mockImplementationOnce(async () => Promise.resolve({}))
      const params: { teacherId: string; studentId: [string, string] } = {
        teacherId: mockUser.userId,
        studentId: [mockStudent.userId, mockUser.username],
      }
      const res = await linkAccount(params)

      expect(postCommand).toHaveBeenCalledWith(process.env.NEXT_ADD_LINKED_ACCOUNT_URL, params)
      expect(res).toEqual({})
    })

    it('should make a deleteCommand call to unlink accounts', async () => {
      ;(deleteCommand as jest.Mock).mockImplementationOnce(async () => Promise.resolve({}))

      const res = await unlinkAccount({ teacherId: mockUser.userId, studentId: mockStudent.userId })
      expect(res).toEqual({})
    })
  })

  describe('Activities', () => {
    it('should make a postCommand call to create an activity', async () => {
      ;(postCommand as jest.Mock).mockImplementationOnce(async () => Promise.resolve(mockActivity))
      const res = await createActivity({ userActivity: mockActivity, userId: 'someuserid' })

      expect(postCommand).toHaveBeenCalledWith(process.env.NEXT_CREATE_ACTIVITY_URL, {
        userActivity: mockActivity,
        userId: 'someuserid',
      })
      expect(res).toEqual(mockActivity)
    })

    it('should make a patchCommand call to edit an activity', async () => {
      ;(patchCommand as jest.Mock).mockImplementationOnce(async () => Promise.resolve(mockActivity))
      const res = await editActivity({ userId: mockUser.userId, updatedActivity: mockActivity })

      expect(patchCommand).toHaveBeenCalledWith(process.env.NEXT_EDIT_ACTIVITY_URL, {
        userId: mockUser.userId,
        updatedActivity: mockActivity,
      })
      expect(res).toEqual(mockActivity)
    })

    it('should make a deleteCommand call to delete activity', async () => {
      ;(deleteCommand as jest.Mock).mockImplementationOnce(async () => Promise.resolve({}))

      const res = await deleteActivity({ userId: mockUser.userId, activityName: mockActivity.name })
      expect(res).toEqual({})
    })
  })

  describe('Cards', () => {
    it('should make a postCommand call to create user cards', async () => {
      const payload = {
        userId: `${btoa('mock.user@email.com')}`,
        activity: 'Quran',
        cards: [mockUserCard],
      }

      ;(postCommand as jest.Mock).mockImplementationOnce(async () =>
        Promise.resolve([mockUserCard])
      )
      const res = await createCards(payload)

      expect(postCommand).toHaveBeenCalledWith(process.env.NEXT_CREATE_CARD_URL, payload)
      expect(res).toEqual([mockUserCard])
    })

    it('should make post command call to activate card', async () => {
      const payload = {
        userId: `${btoa('mock.user@email.com')}`,
        activity: 'Quran',
        cardId: mockUserCard.cardId,
      }

      ;(postCommand as jest.Mock).mockImplementationOnce(async () => Promise.resolve(mockUserCard))
      const res = await activateCard(payload)

      expect(postCommand).toHaveBeenCalledWith(process.env.NEXT_ACTIVATE_CARD_URL, payload)
      expect(res).toEqual(mockUserCard)
    })

    it('should make post command call to edit any other card attribute', async () => {
      const payload = {
        userId: `${btoa('mock.user@email.com')}`,
        activity: 'Quran',
        cardId: mockUserCard.cardId,
        editData: { stage: '4' },
      }

      ;(postCommand as jest.Mock).mockImplementationOnce(async () => Promise.resolve(mockUserCard))
      const res = await editAnyCardAttr(payload)

      expect(postCommand).toHaveBeenCalledWith(process.env.NEXT_EDIT_CARD_URL, payload)
      expect(res).toEqual(mockUserCard)
    })

    it('should make post command call to edit card to promote or demote card', async () => {
      const payload = {
        userId: `${btoa('mock.user@email.com')}`,
        activity: 'Quran',
        cardId: mockUserCard.cardId,
        editData: { promote: true },
      }

      ;(postCommand as jest.Mock).mockImplementationOnce(async () => Promise.resolve(mockUserCard))
      const res = await editCardStage(payload)

      expect(postCommand).toHaveBeenCalledWith(process.env.NEXT_EDIT_CARD_STAGE_URL, payload)
      expect(res).toEqual(mockUserCard)
    })

    it('should make post command call to reset card stage', async () => {
      const payload = {
        userId: `${btoa('mock.user@email.com')}`,
        activity: 'Quran',
        cardId: mockUserCard.cardId,
      }

      ;(postCommand as jest.Mock).mockImplementationOnce(async () => Promise.resolve(mockUserCard))
      const res = await resetCardStage(payload)

      expect(postCommand).toHaveBeenCalledWith(process.env.NEXT_RESET_CARD_STAGE_URL, payload)
      expect(res).toEqual(mockUserCard)
    })

    it('should make post command call to request card review', async () => {
      const payload = {
        id: mockUserCard.cardId,
        teacherId: mockUser.userId,
        student: {
          id: mockStudent.userId,
          fullName: 'Mock student',
          email: mockStudent.email,
        },
      }

      ;(postCommand as jest.Mock).mockImplementationOnce(async () => Promise.resolve(mockUserCard))
      const res = await requestCardReview(payload)

      expect(postCommand).toHaveBeenCalledWith(process.env.NEXT_REQUEST_REVIEW_CARD_URL, payload)
      expect(res).toEqual(mockUserCard)
    })

    it('should make post command call to delete card', async () => {
      const payload = [
        {
          userId: mockUser.userId,
          activity: mockActivity.name,
          cardId: mockUserCard.cardId,
        },
        {
          userId: mockStudent.userId,
          activity: mockActivity.name,
          cardId: mockUserCard.cardId,
        },
      ]

      ;(postCommand as jest.Mock).mockImplementationOnce(async () => Promise.resolve(mockUserCard))
      const res = await deleteCard(payload)

      expect(postCommand).toHaveBeenCalledWith(process.env.NEXT_DELETE_CARD_URL, payload)
      expect(res).toEqual(mockUserCard)
    })
  })
})
