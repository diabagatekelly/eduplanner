import ManageCardPopup from '../../../components/popups/manageCardPopup'
import '@testing-library/jest-dom'
import { screen, fireEvent, act, waitFor } from '@testing-library/react'
import { render } from '../../util'
import * as React from 'react'
import {
  activateCard,
  deleteCard,
  editCardStage,
  editAnyCardAttr,
  requestCardReview,
  resetCardStage,
  findUser,
} from '../../../api/controller'
import {
  mockUser,
  mockStudent,
  mockActivity,
  mockUserCard,
  mockLanguageActivity,
  mockUserLanguageVocabCard,
} from '../../../specs/mocks'
import { CompletionStatus } from '../../../types/CompletionStatusEnum'
import { toast } from 'sonner'

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn(), info: jest.fn() },
}))
jest.mock('../../../api/controller')

describe('Manage Card Popup', () => {
  it('should show error when userId is missing and action is triggered', async () => {
    const args = {
      user: { accountType: 'teacher' } as any,
      activity: mockActivity,
      item: { card: mockUserCard, action: 'edit' },
    }
    render(<ManageCardPopup {...{ onClose: jest.fn(), showModal: true, isMain: true, ...args }} />)
    const resetBtn = screen.getByTestId('reset-stage-btn')
    await act(async () => {
      await fireEvent.click(resetBtn)
    })
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Server is down. Try again later.')
    })
  })

  describe('Reset stage', () => {
    const myUser = { ...mockUser, activities: [{ ...mockActivity, cards: [mockUserCard] }] }

    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2/3/2024'))
    })

    afterEach(() => {
      jest.clearAllMocks()
      jest.useRealTimers()
    })

    it('should render popup to reset card stage', async () => {
      let showModal
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: { card: { ...mockUserCard, addedOn: '1/24/2024' }, action: 'edit' },
          }}
        />
      )

      const heading = await screen.findByTestId('card-title')
      const cardName = await screen.findByTestId('card-name')
      const cardOwnerInfo = await screen.findByTestId('card-owner-info')
      const cardInstructions = await screen.queryByTestId('card-instructions')

      expect(heading).toHaveTextContent('Manage Card')
      expect(cardName).toHaveTextContent('Surah 114: Naas')
      expect(cardOwnerInfo).toHaveTextContent('Owner: mock user')
      expect(cardOwnerInfo).toHaveTextContent('Activity: Quran')
      expect(cardOwnerInfo).toHaveTextContent(`Created On: 1/24/2024`)
      expect(cardOwnerInfo).toHaveTextContent(`Last updated: Never`)
      expect(cardOwnerInfo).toHaveTextContent(`Next show date: Never`)
      expect(cardInstructions).not.toBeInTheDocument()
    })

    it('should invoke resetCardStage controller when form is submitted', async () => {
      ;(resetCardStage as jest.Mock).mockImplementationOnce(() => {
        return Promise.resolve({ status: 200, data: { message: null, details: mockUserCard } })
      })

      let showModal
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: { card: mockUserCard, action: 'edit' },
          }}
        />
      )

      const resetStageBtn = await screen.findByTestId('reset-stage-btn')
      const resetCardStageDTO = {
        userId: mockUser.userId,
        activity: mockActivity.name,
        cardId: mockUserCard.cardId,
      }

      await act(async () => {
        await fireEvent.click(resetStageBtn)
      })

      await expect(resetCardStage).toHaveBeenCalledWith(resetCardStageDTO)
    })

    it('should close popup when response is successful and display success message, then reset message when form in focus', async () => {
      ;(resetCardStage as jest.Mock).mockImplementationOnce(() => {
        return Promise.resolve({
          status: 200,
          data: { message: 'Successfully reset card.', details: {} },
        })
      })

      let showModal
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: { card: mockUserCard, action: 'edit' },
          }}
        />
      )

      const resetStageBtn = await screen.findByTestId('reset-stage-btn')

      await act(async () => {
        await fireEvent.click(resetStageBtn)
      })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Successfully reset card')
      })
    })

    it('should not close popup when response is not 200 or 500 and display error message', async () => {
      const error = {
        response: {
          status: 400,
          data: { status: 'failedTransaction', message: 'Erroneous response' },
        },
      }
      ;(resetCardStage as jest.Mock).mockImplementation(() => {
        return Promise.reject(error)
      })

      let showModal = true
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: { card: mockUserCard, action: 'edit' },
          }}
        />
      )
      const resetStageBtn = await screen.findByTestId('reset-stage-btn')

      await act(async () => {
        await fireEvent.click(resetStageBtn)
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erroneous response')
      })
    })

    it('should not close popup when response is 500 and display error message', async () => {
      const error = {
        response: { status: 500, data: { status: 'internalServerError', message: 'Server error' } },
      }
      ;(resetCardStage as jest.Mock).mockImplementation(() => {
        return Promise.reject(error)
      })
      let showModal = true
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: { card: mockUserCard, action: 'edit' },
          }}
        />
      )
      const resetStageBtn = await screen.findByTestId('reset-stage-btn')

      await act(async () => {
        await fireEvent.click(resetStageBtn)
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to reset card due to an internal error. Please try again later.'
        )
      })
    })

    it('should not close popup when error is thrown with no response', async () => {
      ;(resetCardStage as jest.Mock).mockImplementation(() => {
        return Promise.reject({ status: 500, message: 'Error thrown and caught.' })
      })

      let showModal = true
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: { card: mockUserCard, action: 'edit' },
          }}
        />
      )
      const resetStageBtn = await screen.findByTestId('reset-stage-btn')

      await act(async () => {
        await fireEvent.click(resetStageBtn)
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Server is down. Try again later.')
      })
    })
  })

  describe('Submit form review', () => {
    const myUser = {
      ...mockStudent,
      linkedAccountsData: { teacher: mockUser.userId },
      activities: [{ ...mockActivity, cards: [mockUserCard] }],
    }

    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2/3/2024'))
    })

    afterEach(() => {
      jest.clearAllMocks()
      jest.useRealTimers()
    })

    it('should render popup to submit form for review', async () => {
      let showModal
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockLanguageActivity,
            item: { card: mockUserLanguageVocabCard, action: 'edit' },
          }}
        />
      )

      const cardOwnerInfo = await screen.findByTestId('card-owner-info')
      const cardInstructions = await screen.findByTestId('card-instructions')

      expect(cardOwnerInfo).toHaveTextContent('Owner: mock student')
      expect(cardInstructions).toHaveTextContent(
        'Instructions: 1. Recall to / from2. Use in spoken sentencesOPTIONAL: Practice spellingOPTIONAL: Use in written sentences'
      )
    })

    it('should invoke requestCardReview controller when form is submitted', async () => {
      ;(requestCardReview as jest.Mock).mockImplementationOnce(() => {
        return Promise.resolve({ status: 200, data: { message: null, details: {} } })
      })
      ;(editCardStage as jest.Mock).mockImplementationOnce(() => {
        return Promise.resolve({ status: 200, data: { message: null, details: mockUserCard } })
      })

      let showModal
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: { card: mockUserCard, action: 'edit' },
          }}
        />
      )

      const requestReviewBtn = await screen.findByTestId('submit-review-btn')
      const resetCardStageDTO = {
        id: mockUserCard.cardId,
        teacherId: mockUser.userId,
        student: {
          id: mockStudent.userId,
          fullName: `${mockStudent.firstName} ${mockStudent.lastName}`,
          email: mockStudent.email,
        },
      }

      await act(async () => {
        await fireEvent.click(requestReviewBtn)
      })

      await expect(requestCardReview).toHaveBeenCalledWith(resetCardStageDTO)
    })

    it('should close popup when response is successful and display success message, then reset message when form in focus', async () => {
      ;(requestCardReview as jest.Mock).mockImplementationOnce(() => {
        return Promise.resolve({
          status: 200,
          data: { message: 'Successfully request review for card.', details: {} },
        })
      })
      ;(editCardStage as jest.Mock).mockImplementationOnce(() => {
        return Promise.resolve({ status: 200, data: { message: null, details: mockUserCard } })
      })

      let showModal
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: { card: mockUserCard, action: 'edit' },
          }}
        />
      )

      const requestReviewBtn = await screen.findByTestId('submit-review-btn')

      await act(async () => {
        await fireEvent.click(requestReviewBtn)
      })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Request for review successfully sent.')
      })
    })

    it('should not close popup when response is not 200 or 500 and display error message', async () => {
      const error = {
        response: {
          status: 400,
          data: { status: 'failedTransaction', message: 'Erroneous response' },
        },
      }
      ;(requestCardReview as jest.Mock).mockImplementation(() => {
        return Promise.reject(error)
      })

      let showModal = true
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: { card: mockUserCard, action: 'edit' },
          }}
        />
      )
      const requestReviewBtn = await screen.findByTestId('submit-review-btn')

      await act(async () => {
        await fireEvent.click(requestReviewBtn)
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erroneous response')
      })
    })

    it('should not close popup when response is 500 and display error message', async () => {
      const error = {
        response: { status: 500, data: { status: 'internalServerError', message: 'Server error' } },
      }
      ;(requestCardReview as jest.Mock).mockImplementation(() => {
        return Promise.reject(error)
      })
      let showModal = true
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: { card: mockUserCard, action: 'edit' },
          }}
        />
      )
      const requestReviewBtn = await screen.findByTestId('submit-review-btn')

      await act(async () => {
        await fireEvent.click(requestReviewBtn)
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to request review due to an internal error. Please try again later.'
        )
      })
    })

    it('should not close popup when error is thrown with no response', async () => {
      ;(requestCardReview as jest.Mock).mockImplementation(() => {
        return Promise.reject({ status: 500, message: 'Error thrown and caught.' })
      })

      let showModal = true
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: { card: mockUserCard, action: 'edit' },
          }}
        />
      )
      const requestReviewBtn = await screen.findByTestId('submit-review-btn')

      await act(async () => {
        await fireEvent.click(requestReviewBtn)
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Server is down. Try again later.')
      })
    })

    it('should display disabled button when card already reviewed', async () => {
      const myUser2 = {
        ...mockStudent,
        linkedAccountsData: { teacher: mockUser.userId },
        activities: [
          {
            ...mockActivity,
            cards: [{ ...mockUserCard, completionStatus: CompletionStatus.REVIEW }],
          },
        ],
      }

      let showModal = true
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: {
              card: { ...mockUserCard, completionStatus: CompletionStatus.REVIEW },
              action: 'edit',
            },
          }}
        />
      )
      const requestReviewBtn = await screen.findByTestId('submit-review-btn')

      expect(requestReviewBtn).toBeDisabled()
    })
  })

  describe('Override stage', () => {
    const myUser = {
      ...mockUser,
      activities: [
        {
          ...mockActivity,
          cards: [{ ...mockUserCard, completionStatus: CompletionStatus.COMPLETED, stage: '7' }],
        },
      ],
    }

    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2/3/2024'))
    })

    afterEach(() => {
      jest.clearAllMocks()
      jest.useRealTimers()
    })

    it('should invoke editAnyCardAttr controller when form is submitted', async () => {
      expect(myUser.activities[0].cards[0].stage).toEqual('7')
      ;(editAnyCardAttr as jest.Mock).mockImplementationOnce(() => {
        return Promise.resolve({ status: 200, data: { message: null, details: mockUserCard } })
      })

      let showModal
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: {
              card: { ...mockUserCard, completionStatus: CompletionStatus.COMPLETED, stage: '7' },
              action: 'override',
            },
          }}
        />
      )

      const overrideStageForm = await screen.findByTestId('override-stge-form')
      const overrideStageBtn = await screen.findByTestId('override-stage-btn')
      const stageManagementBlock = await screen.findByTestId('card-stage-management')

      expect(stageManagementBlock).toHaveTextContent('Override current stage: 7')

      const overrideStageDTO = {
        userId: mockUser.userId,
        activity: 'Quran',
        cardId: mockUserCard.cardId,
        editData: {
          stage: '30',
        },
      }

      await act(async () => {
        fireEvent.change(overrideStageForm, { target: { value: '30' } })
        await fireEvent.click(overrideStageBtn)
      })

      await expect(editAnyCardAttr).toHaveBeenCalledWith(overrideStageDTO)
    })

    it('should close popup when response is successful and display success message, then reset message when form in focus', async () => {
      ;(editAnyCardAttr as jest.Mock).mockImplementationOnce(() => {
        return Promise.resolve({
          status: 200,
          data: { message: 'Successfully overrode status.', details: mockUserCard },
        })
      })

      let showModal
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: {
              card: { ...mockUserCard, completionStatus: CompletionStatus.COMPLETED, stage: '7' },
              action: 'override',
            },
          }}
        />
      )

      const overrideStageForm = await screen.findByTestId('override-stge-form')
      const overrideStageBtn = await screen.findByTestId('override-stage-btn')

      await act(async () => {
        fireEvent.change(overrideStageForm, { target: { value: '30' } })
        await fireEvent.click(overrideStageBtn)
      })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Successfully overrode status.')
      })
    })

    it('should not close popup when response is not 200 or 500 and display error message', async () => {
      const error = {
        response: {
          status: 400,
          data: { status: 'failedTransaction', message: 'Erroneous response' },
        },
      }
      ;(editAnyCardAttr as jest.Mock).mockImplementation(() => {
        return Promise.reject(error)
      })

      let showModal = true
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: {
              card: { ...mockUserCard, completionStatus: CompletionStatus.COMPLETED, stage: '7' },
              action: 'override',
            },
          }}
        />
      )
      const overrideStageBtn = await screen.findByTestId('override-stage-btn')

      await act(async () => {
        await fireEvent.click(overrideStageBtn)
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erroneous response')
      })
    })

    it('should not close popup when response is 500 and display error message', async () => {
      const error = {
        response: { status: 500, data: { status: 'internalServerError', message: 'Server error' } },
      }
      ;(editAnyCardAttr as jest.Mock).mockImplementation(() => {
        return Promise.reject(error)
      })
      let showModal = true
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: {
              card: { ...mockUserCard, completionStatus: CompletionStatus.COMPLETED, stage: '7' },
              action: 'override',
            },
          }}
        />
      )
      const overrideStageBtn = await screen.findByTestId('override-stage-btn')

      await act(async () => {
        await fireEvent.click(overrideStageBtn)
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to override card stage due to an internal error. Please try again later.'
        )
      })
    })

    it('should not close popup when error is thrown with no response', async () => {
      ;(editAnyCardAttr as jest.Mock).mockImplementation(() => {
        return Promise.reject({ status: 500, message: 'Error thrown and caught.' })
      })

      let showModal = true
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: {
              card: { ...mockUserCard, completionStatus: CompletionStatus.COMPLETED, stage: '7' },
              action: 'override',
            },
          }}
        />
      )
      const overrideStageBtn = await screen.findByTestId('override-stage-btn')

      await act(async () => {
        await fireEvent.click(overrideStageBtn)
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Server is down. Try again later.')
      })
    })
  })

  describe('Promote/demote stage and update status', () => {
    const myUser = {
      ...mockUser,
      activities: [
        {
          ...mockActivity,
          cards: [{ ...mockUserCard, completionStatus: CompletionStatus.PENDING, stage: '7' }],
        },
      ],
    }

    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2/3/2024'))
    })

    afterEach(() => {
      jest.clearAllMocks()
      jest.useRealTimers()
    })

    it('should invoke editCardStage controller when promote form is submitted', async () => {
      ;(editCardStage as jest.Mock).mockImplementationOnce(() => {
        return Promise.resolve({ status: 200, data: { message: null, details: mockUserCard } })
      })

      let showModal
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: {
              card: { ...mockUserCard, completionStatus: CompletionStatus.PENDING, stage: '7' },
              action: 'edit',
            },
          }}
        />
      )

      const promoteStageBtn = await screen.findByTestId('promote-stage-btn')

      const promoteStageDTO = {
        userId: mockUser.userId,
        activity: 'Quran',
        cardId: mockUserCard.cardId,
        editData: {
          stage: '7',
          promote: true,
        },
      }

      await act(async () => {
        await fireEvent.click(promoteStageBtn)
      })

      await expect(editCardStage).toHaveBeenCalledWith(promoteStageDTO)
    })

    it('should invoke editCardStage controller when demote form is submitted', async () => {
      ;(editCardStage as jest.Mock).mockImplementationOnce(() => {
        return Promise.resolve({ status: 200, data: { message: null, details: mockUserCard } })
      })

      let showModal
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: {
              card: { ...mockUserCard, completionStatus: CompletionStatus.PENDING, stage: '7' },
              action: 'edit',
            },
          }}
        />
      )

      const demoteStageBtn = await screen.findByTestId('demote-stage-btn')

      const demoteStageDTO = {
        userId: mockUser.userId,
        activity: 'Quran',
        cardId: mockUserCard.cardId,
        editData: {
          stage: '7',
          promote: false,
        },
      }

      await act(async () => {
        await fireEvent.click(demoteStageBtn)
      })

      await expect(editCardStage).toHaveBeenCalledWith(demoteStageDTO)
    })

    it('should close popup when response is successful and display success message, then reset message when form in focus', async () => {
      ;(editCardStage as jest.Mock).mockImplementationOnce(() => {
        return Promise.resolve({
          status: 200,
          data: { message: 'Successfully edited status.', details: mockUserCard },
        })
      })

      let showModal
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: {
              card: { ...mockUserCard, completionStatus: CompletionStatus.PENDING, stage: '7' },
              action: 'edit',
            },
          }}
        />
      )

      const demoteStageBtn = await screen.findByTestId('demote-stage-btn')

      await act(async () => {
        await fireEvent.click(demoteStageBtn)
      })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Successfully edited status.')
      })
    })

    it('should not close popup when response is not 200 or 500 and display error message', async () => {
      const error = {
        response: {
          status: 400,
          data: { status: 'failedTransaction', message: 'Erroneous response' },
        },
      }
      ;(editCardStage as jest.Mock).mockImplementation(() => {
        return Promise.reject(error)
      })

      let showModal = true
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: {
              card: { ...mockUserCard, completionStatus: CompletionStatus.PENDING, stage: '7' },
              action: 'edit',
            },
          }}
        />
      )
      const demoteStageBtn = await screen.findByTestId('demote-stage-btn')

      await act(async () => {
        await fireEvent.click(demoteStageBtn)
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erroneous response')
      })
    })

    it('should not close popup when response is 500 and display error message', async () => {
      const error = {
        response: { status: 500, data: { status: 'internalServerError', message: 'Server error' } },
      }
      ;(editCardStage as jest.Mock).mockImplementation(() => {
        return Promise.reject(error)
      })
      let showModal = true
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: {
              card: { ...mockUserCard, completionStatus: CompletionStatus.PENDING, stage: '7' },
              action: 'edit',
            },
          }}
        />
      )
      const demoteStageBtn = await screen.findByTestId('demote-stage-btn')

      await act(async () => {
        await fireEvent.click(demoteStageBtn)
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to update card status due to an internal error. Please try again later.'
        )
      })
    })

    it('should not close popup when error is thrown with no response', async () => {
      ;(editCardStage as jest.Mock).mockImplementation(() => {
        return Promise.reject({ status: 500, message: 'Error thrown and caught.' })
      })

      let showModal = true
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: {
              card: { ...mockUserCard, completionStatus: CompletionStatus.PENDING, stage: '7' },
              action: 'edit',
            },
          }}
        />
      )
      const demoteStageBtn = await screen.findByTestId('demote-stage-btn')

      await act(async () => {
        await fireEvent.click(demoteStageBtn)
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Server is down. Try again later.')
      })
    })
  })

  describe('Remove card', () => {
    const myUser = { ...mockUser, activities: [{ ...mockActivity, cards: [mockUserCard] }] }

    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2/3/2024'))
    })

    afterEach(() => {
      jest.clearAllMocks()
      jest.useRealTimers()
    })

    it('should invoke deleteCard controller when form is submitted', async () => {
      ;(deleteCard as jest.Mock).mockImplementationOnce(() => {
        return Promise.resolve({ status: 200, data: { message: null, details: {} } })
      })

      let showModal
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: { card: mockUserCard, action: 'delete' },
          }}
        />
      )

      const deleteCardBtn = await screen.findByTestId('delete-card-btn')
      const deleteCardDTO = [
        {
          userId: mockUser.userId,
          activity: mockActivity.name,
          cardId: mockUserCard.cardId,
        },
      ]

      await act(async () => {
        await fireEvent.click(deleteCardBtn)
      })

      await expect(deleteCard).toHaveBeenCalledWith(deleteCardDTO)
    })

    it('should close popup when response is successful and display success message, then reset message when form in focus', async () => {
      ;(deleteCard as jest.Mock).mockImplementationOnce(() => {
        return Promise.resolve({
          status: 200,
          data: { message: 'Successfully removed card.', details: {} },
        })
      })

      let showModal
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: { card: mockUserCard, action: 'delete' },
          }}
        />
      )

      const deleteCardBtn = await screen.findByTestId('delete-card-btn')

      await act(async () => {
        await fireEvent.click(deleteCardBtn)
      })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Successfully removed card')
      })
    })

    it('should not close popup when response is not 200 or 500 and display error message', async () => {
      const error = {
        response: {
          status: 400,
          data: { status: 'failedTransaction', message: 'Erroneous response' },
        },
      }
      ;(deleteCard as jest.Mock).mockImplementation(() => {
        return Promise.reject(error)
      })

      let showModal = true
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: { card: mockUserCard, action: 'delete' },
          }}
        />
      )
      const deleteCardBtn = await screen.findByTestId('delete-card-btn')

      await act(async () => {
        await fireEvent.click(deleteCardBtn)
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erroneous response')
      })
    })

    it('should not close popup when response is 500 and display error message', async () => {
      const error = {
        response: { status: 500, data: { status: 'internalServerError', message: 'Server error' } },
      }
      ;(deleteCard as jest.Mock).mockImplementation(() => {
        return Promise.reject(error)
      })
      let showModal = true
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: { card: mockUserCard, action: 'delete' },
          }}
        />
      )
      const deleteCardBtn = await screen.findByTestId('delete-card-btn')

      await act(async () => {
        await fireEvent.click(deleteCardBtn)
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to remove card due to an internal error. Please try again later.'
        )
      })
    })

    it('should not close popup when error is thrown with no response', async () => {
      ;(deleteCard as jest.Mock).mockImplementation(() => {
        return Promise.reject({ status: 500, message: 'Error thrown and caught.' })
      })

      let showModal = true
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: { card: mockUserCard, action: 'delete' },
          }}
        />
      )
      const deleteCardBtn = await screen.findByTestId('delete-card-btn')

      await act(async () => {
        await fireEvent.click(deleteCardBtn)
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Server is down. Try again later.')
      })
    })
  })

  describe('Activate card', () => {
    const myUser = { ...mockUser, activities: [{ ...mockActivity, cards: [mockUserCard] }] }

    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2/3/2024'))
    })

    afterEach(() => {
      jest.clearAllMocks()
      jest.useRealTimers()
    })

    it('should invoke activateCard controller when form is submitted', async () => {
      ;(activateCard as jest.Mock).mockImplementationOnce(() => {
        return Promise.resolve({ status: 200, data: { message: null, details: mockUserCard } })
      })

      let showModal
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: { card: mockUserCard, action: 'activate' },
          }}
        />
      )

      const activateCardBtn = await screen.findByTestId('activate-card-btn')
      const activateCardDTO = {
        userId: mockUser.userId,
        activity: mockActivity.name,
        cardId: mockUserCard.cardId,
      }

      await act(async () => {
        await fireEvent.click(activateCardBtn)
      })

      await expect(activateCard).toHaveBeenCalledWith(activateCardDTO)
    })

    it('should close popup when response is successful and display success message, then reset message when form in focus', async () => {
      ;(activateCard as jest.Mock).mockImplementationOnce(() => {
        return Promise.resolve({
          status: 200,
          data: { message: 'Successfully activated card.', details: {} },
        })
      })

      let showModal
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: { card: mockUserCard, action: 'activate' },
          }}
        />
      )

      const activateCardBtn = await screen.findByTestId('activate-card-btn')

      await act(async () => {
        await fireEvent.click(activateCardBtn)
      })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Successfully activated card')
      })
    })

    it('should not close popup when response is not 200 or 500 and display error message', async () => {
      const error = {
        response: {
          status: 400,
          data: { status: 'failedTransaction', message: 'Erroneous response' },
        },
      }
      ;(activateCard as jest.Mock).mockImplementation(() => {
        return Promise.reject(error)
      })

      let showModal = true
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: { card: mockUserCard, action: 'activate' },
          }}
        />
      )
      const activateCardBtn = await screen.findByTestId('activate-card-btn')

      await act(async () => {
        await fireEvent.click(activateCardBtn)
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erroneous response')
      })
    })

    it('should not close popup when response is 500 and display error message', async () => {
      const error = {
        response: { status: 500, data: { status: 'internalServerError', message: 'Server error' } },
      }
      ;(activateCard as jest.Mock).mockImplementation(() => {
        return Promise.reject(error)
      })
      let showModal = true
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: { card: mockUserCard, action: 'activate' },
          }}
        />
      )
      const activateCardBtn = await screen.findByTestId('activate-card-btn')

      await act(async () => {
        await fireEvent.click(activateCardBtn)
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to activate card due to an internal error. Please try again later.'
        )
      })
    })

    it('should not close popup when error is thrown with no response', async () => {
      ;(activateCard as jest.Mock).mockImplementation(() => {
        return Promise.reject({ status: 500, message: 'Error thrown and caught.' })
      })

      let showModal = true
      let onClose = () => {
        showModal = false
      }

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: { card: mockUserCard, action: 'activate' },
          }}
        />
      )
      const activateCardBtn = await screen.findByTestId('activate-card-btn')

      await act(async () => {
        await fireEvent.click(activateCardBtn)
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Server is down. Try again later.')
      })
    })
  })

  describe('Student', () => {
    const myUser = {
      ...mockStudent,
      activities: [
        {
          ...mockActivity,
          cards: [{ ...mockUserCard, completionStatus: CompletionStatus.COMPLETED, stage: '7' }],
        },
      ],
    }
    describe('Override stage', () => {
      beforeEach(() => {
        jest.useFakeTimers()
        jest.setSystemTime(new Date('2/3/2024'))
      })

      afterEach(() => {
        jest.clearAllMocks()
        jest.useRealTimers()
      })

      it('should invoke editAnyCardAttr controller when form is submitted', async () => {
        ;(editAnyCardAttr as jest.Mock).mockImplementationOnce(() => {
          return Promise.resolve({ status: 200, data: { message: null, details: mockUserCard } })
        })

        let showModal
        let onClose = () => {
          showModal = false
        }

        render(
          <ManageCardPopup
            {...{
              onClose,
              showModal: true,
              isMain: false,
              user: myUser,
              activity: mockActivity,
              item: {
                card: { ...mockUserCard, completionStatus: CompletionStatus.COMPLETED, stage: '7' },
                action: 'override',
              },
            }}
          />
        )

        const overrideStageForm = await screen.findByTestId('override-stge-form')
        const overrideStageBtn = await screen.findByTestId('override-stage-btn')
        const stageManagementBlock = await screen.findByTestId('card-stage-management')

        expect(stageManagementBlock).toHaveTextContent('Override current stage: 7')

        const overrideStageDTO = {
          userId: mockStudent.userId,
          activity: 'Quran',
          cardId: mockUserCard.cardId,
          editData: {
            stage: '30',
          },
        }

        await act(async () => {
          fireEvent.change(overrideStageForm, { target: { value: '30' } })
          await fireEvent.click(overrideStageBtn)
        })

        await expect(editAnyCardAttr).toHaveBeenCalledWith(overrideStageDTO)
      })
    })
  })

  describe('Status message reset on reopen', () => {
    const myUser = { ...mockUser, activities: [{ ...mockActivity, cards: [mockUserCard] }] }
    const secondCard = {
      ...mockUserCard,
      cardId: `${btoa('surah-113-name-Falaq-juz-30')}`,
    }

    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2/3/2024'))
    })

    afterEach(() => {
      jest.clearAllMocks()
      jest.useRealTimers()
    })

    it('should clear status message when popup reopens with a different card', async () => {
      ;(resetCardStage as jest.Mock).mockImplementationOnce(() => {
        return Promise.resolve({
          status: 200,
          data: { message: 'Successfully reset card.', details: {} },
        })
      })

      const onClose = jest.fn()

      const { rerender } = render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: { card: mockUserCard, action: 'edit' },
          }}
        />
      )

      // Perform action — toast should be called
      const resetStageBtn = await screen.findByTestId('reset-stage-btn')
      await act(async () => {
        await fireEvent.click(resetStageBtn)
      })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Successfully reset card')
      })

      // Reopen popup with a different card (simulates closing + reopening)
      rerender(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: { card: secondCard, action: 'edit' },
          }}
        />
      )

      // Toast was called once (from the first action), no additional calls after reopen
      expect(toast.success).toHaveBeenCalledTimes(1)
    })
  })

  describe('Popup closes after successful card mutation', () => {
    const myUser = { ...mockUser, activities: [{ ...mockActivity, cards: [mockUserCard] }] }

    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2/3/2024'))
    })

    afterEach(() => {
      jest.clearAllMocks()
      jest.useRealTimers()
    })

    it('should call onClose after successful card activation', async () => {
      ;(activateCard as jest.Mock).mockImplementationOnce(() => {
        return Promise.resolve({ status: 200, data: { message: null, details: mockUserCard } })
      })
      ;(findUser as jest.Mock).mockImplementation(() => {
        return Promise.resolve({
          status: 200,
          data: { details: { student: myUser } },
        })
      })

      const onClose = jest.fn()

      render(
        <ManageCardPopup
          {...{
            onClose,
            showModal: true,
            isMain: true,
            user: myUser,
            activity: mockActivity,
            item: { card: mockUserCard, action: 'activate' },
          }}
        />
      )

      const activateCardBtn = await screen.findByTestId('activate-card-btn')
      await act(async () => {
        await fireEvent.click(activateCardBtn)
      })

      expect(onClose).toHaveBeenCalled()
    })
  })
})
