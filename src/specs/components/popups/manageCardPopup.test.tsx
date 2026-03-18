import ManageCardPopup from '../../../components/popups/manageCardPopup'
import '@testing-library/jest-dom'
import { screen, fireEvent, act, waitFor } from '@testing-library/react'
import { render } from '../../util'
import * as React from 'react'
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
import { server } from '../../msw/server'
import { http, HttpResponse } from 'msw'

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn(), info: jest.fn() },
}))
jest.mock('next-auth/react', () => ({
  getSession: jest.fn().mockResolvedValue(null),
}))

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

    afterEach(() => {
      jest.clearAllMocks()
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

    it('should show success toast after resetting card stage', async () => {
      let receivedBody: any
      server.use(
        http.post('*/user/cards/reset-stage', async ({ request }) => {
          receivedBody = await request.json()
          return HttpResponse.json({ message: null, details: mockUserCard })
        })
      )

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
        expect(receivedBody).toEqual({
          userId: mockUser.userId,
          activity: mockActivity.name,
          cardId: mockUserCard.cardId,
        })
        expect(toast.success).toHaveBeenCalledWith('Successfully reset card')
      })
    })

    it('should close popup when response is successful and display success message, then reset message when form in focus', async () => {
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
      server.use(
        http.post('*/user/cards/reset-stage', () =>
          HttpResponse.json(
            { status: 'failedTransaction', message: 'Erroneous response' },
            { status: 400 }
          )
        )
      )

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
      server.use(
        http.post('*/user/cards/reset-stage', () =>
          HttpResponse.json(
            { status: 'internalServerError', message: 'Server error' },
            { status: 500 }
          )
        )
      )
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
      server.use(http.post('*/user/cards/reset-stage', () => HttpResponse.error()))

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

    afterEach(() => {
      jest.clearAllMocks()
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

    it('should show success toast after requesting review', async () => {
      let receivedBody: any
      server.use(
        http.post('*/user/cards/request-review', async ({ request }) => {
          receivedBody = await request.json()
          return HttpResponse.json({ message: null, details: {} })
        })
      )

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
        expect(receivedBody).toEqual({
          id: mockUserCard.cardId,
          teacherId: mockUser.userId,
          student: {
            id: mockStudent.userId,
            fullName: `${mockStudent.firstName} ${mockStudent.lastName}`,
            email: mockStudent.email,
          },
        })
        expect(toast.success).toHaveBeenCalledWith('Request for review successfully sent.')
      })
    })

    it('should close popup when response is successful and display success message, then reset message when form in focus', async () => {
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
      server.use(
        http.post('*/user/cards/request-review', () =>
          HttpResponse.json(
            { status: 'failedTransaction', message: 'Erroneous response' },
            { status: 400 }
          )
        )
      )

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
      server.use(
        http.post('*/user/cards/request-review', () =>
          HttpResponse.json(
            { status: 'internalServerError', message: 'Server error' },
            { status: 500 }
          )
        )
      )
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
      server.use(http.post('*/user/cards/request-review', () => HttpResponse.error()))

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

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should show success toast after overriding card stage', async () => {
      let receivedBody: any
      server.use(
        http.post('*/user/cards/edit', async ({ request }) => {
          receivedBody = await request.json()
          return HttpResponse.json({ message: null, details: mockUserCard })
        })
      )

      expect(myUser.activities[0].cards[0].stage).toEqual('7')

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

      await act(async () => {
        fireEvent.change(overrideStageForm, { target: { value: '30' } })
        await fireEvent.click(overrideStageBtn)
      })

      await waitFor(() => {
        expect(receivedBody).toEqual({
          userId: mockUser.userId,
          activity: 'Quran',
          cardId: mockUserCard.cardId,
          editData: { stage: '30' },
        })
        expect(toast.success).toHaveBeenCalledWith('Successfully overrode status.')
      })
    })

    it('should close popup when response is successful and display success message, then reset message when form in focus', async () => {
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
      server.use(
        http.post('*/user/cards/edit', () =>
          HttpResponse.json(
            { status: 'failedTransaction', message: 'Erroneous response' },
            { status: 400 }
          )
        )
      )

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
      server.use(
        http.post('*/user/cards/edit', () =>
          HttpResponse.json(
            { status: 'internalServerError', message: 'Server error' },
            { status: 500 }
          )
        )
      )
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
      server.use(http.post('*/user/cards/edit', () => HttpResponse.error()))

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

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should show success toast after promoting stage', async () => {
      let receivedBody: any
      server.use(
        http.post('*/user/cards/edit-stage', async ({ request }) => {
          receivedBody = await request.json()
          return HttpResponse.json({ message: null, details: mockUserCard })
        })
      )

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

      await act(async () => {
        await fireEvent.click(promoteStageBtn)
      })

      await waitFor(() => {
        expect(receivedBody).toEqual({
          userId: mockUser.userId,
          activity: 'Quran',
          cardId: mockUserCard.cardId,
          editData: { stage: '7', promote: true },
        })
        expect(toast.success).toHaveBeenCalledWith('Successfully edited status.')
      })
    })

    it('should show success toast after demoting stage', async () => {
      let receivedBody: any
      server.use(
        http.post('*/user/cards/edit-stage', async ({ request }) => {
          receivedBody = await request.json()
          return HttpResponse.json({ message: null, details: mockUserCard })
        })
      )

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
        expect(receivedBody).toEqual({
          userId: mockUser.userId,
          activity: 'Quran',
          cardId: mockUserCard.cardId,
          editData: { stage: '7', promote: false },
        })
        expect(toast.success).toHaveBeenCalledWith('Successfully edited status.')
      })
    })

    it('should close popup when response is successful and display success message, then reset message when form in focus', async () => {
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
      server.use(
        http.post('*/user/cards/edit-stage', () =>
          HttpResponse.json(
            { status: 'failedTransaction', message: 'Erroneous response' },
            { status: 400 }
          )
        )
      )

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
      server.use(
        http.post('*/user/cards/edit-stage', () =>
          HttpResponse.json(
            { status: 'internalServerError', message: 'Server error' },
            { status: 500 }
          )
        )
      )
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
      server.use(http.post('*/user/cards/edit-stage', () => HttpResponse.error()))

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

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should show success toast after deleting card', async () => {
      let receivedBody: any
      server.use(
        http.post('*/user/cards/delete', async ({ request }) => {
          receivedBody = await request.json()
          return HttpResponse.json({ message: null, details: {} })
        })
      )

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
        expect(receivedBody).toEqual([
          {
            userId: mockUser.userId,
            activity: mockActivity.name,
            cardId: mockUserCard.cardId,
          },
        ])
        expect(toast.success).toHaveBeenCalledWith('Successfully removed card')
      })
    })

    it('should close popup when response is successful and display success message, then reset message when form in focus', async () => {
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
      server.use(
        http.post('*/user/cards/delete', () =>
          HttpResponse.json(
            { status: 'failedTransaction', message: 'Erroneous response' },
            { status: 400 }
          )
        )
      )

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
      server.use(
        http.post('*/user/cards/delete', () =>
          HttpResponse.json(
            { status: 'internalServerError', message: 'Server error' },
            { status: 500 }
          )
        )
      )
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
      server.use(http.post('*/user/cards/delete', () => HttpResponse.error()))

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

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should show success toast after activating card', async () => {
      let receivedBody: any
      server.use(
        http.post('*/user/cards/activate', async ({ request }) => {
          receivedBody = await request.json()
          return HttpResponse.json({ message: null, details: {} })
        })
      )

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
        expect(receivedBody).toEqual({
          userId: mockUser.userId,
          activity: mockActivity.name,
          cardId: mockUserCard.cardId,
        })
        expect(toast.success).toHaveBeenCalledWith('Successfully activated card')
      })
    })

    it('should close popup when response is successful and display success message, then reset message when form in focus', async () => {
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
      server.use(
        http.post('*/user/cards/activate', () =>
          HttpResponse.json(
            { status: 'failedTransaction', message: 'Erroneous response' },
            { status: 400 }
          )
        )
      )

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
      server.use(
        http.post('*/user/cards/activate', () =>
          HttpResponse.json(
            { status: 'internalServerError', message: 'Server error' },
            { status: 500 }
          )
        )
      )
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
      server.use(http.post('*/user/cards/activate', () => HttpResponse.error()))

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
      afterEach(() => {
        jest.clearAllMocks()
      })

      it('should show success toast after overriding student card stage', async () => {
        let receivedBody: any
        server.use(
          http.post('*/user/cards/edit', async ({ request }) => {
            receivedBody = await request.json()
            return HttpResponse.json({ message: null, details: mockUserCard })
          })
        )

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

        await act(async () => {
          fireEvent.change(overrideStageForm, { target: { value: '30' } })
          await fireEvent.click(overrideStageBtn)
        })

        await waitFor(() => {
          expect(receivedBody).toEqual({
            userId: mockStudent.userId,
            activity: 'Quran',
            cardId: mockUserCard.cardId,
            editData: { stage: '30' },
          })
          expect(toast.success).toHaveBeenCalledWith('Successfully overrode status.')
        })
      })
    })
  })

  describe('Status message reset on reopen', () => {
    const myUser = { ...mockUser, activities: [{ ...mockActivity, cards: [mockUserCard] }] }
    const secondCard = {
      ...mockUserCard,
      cardId: `${btoa('surah-113-name-Falaq-juz-30')}`,
    }

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should clear status message when popup reopens with a different card', async () => {
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

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should call onClose after successful card activation', async () => {
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
