import CardsList from '../../../components/lists/cards-list'
import '@testing-library/jest-dom'
import { screen, fireEvent, act } from '@testing-library/react'
import { render } from '../../util'
import * as React from 'react'
import {
  mockActivity,
  mockCookingActivity,
  mockLanguageActivity,
  mockStudent,
  mockUser,
  mockUserCard,
  mockUserLanguageGrammarCard,
  mockUserLanguageVocabCard,
  mockUserMiscCard,
} from '../../mocks'
import { useMounted } from '../../../lib/helpers/useMounted'
import { COMPLETION_STATUS } from '../../../lib/constants/completion-status'

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn(), info: jest.fn() },
}))
jest.mock('next-auth/react', () => ({
  getSession: jest.fn().mockResolvedValue(null),
}))
jest.mock('../../../lib/helpers/useMounted', () => ({
  useMounted: jest.fn(() => true),
}))

const originalHash = global.window.location.hash
const activityNoCards = { ...mockActivity }
const activityWithReviewCards = {
  ...mockActivity,
  cards: [{ ...mockUserCard, completionStatus: COMPLETION_STATUS.REVIEW }],
}
const activityWithMultipleReviewCards = {
  ...mockActivity,
  cards: [
    { ...mockUserCard, completionStatus: COMPLETION_STATUS.REVIEW },
    {
      ...mockUserCard,
      completionStatus: COMPLETION_STATUS.REVIEW,
      cardId: `${btoa('surah-109-name-Naas-juz-30')}`,
    },
  ],
}
const activityWithInactiveCards = {
  ...mockActivity,
  cards: [{ ...mockUserCard, completionStatus: COMPLETION_STATUS.INACTIVE }],
}
const activityWithCompletedCards = {
  ...mockActivity,
  cards: [{ ...mockUserCard, completionStatus: COMPLETION_STATUS.COMPLETED }],
}
const activityWithPendingAddedToday = {
  ...mockActivity,
  cards: [
    {
      ...mockUserCard,
      completionStatus: COMPLETION_STATUS.PENDING,
      addedOn: '2/3/2024',
      cardId: `${btoa('juz-30')}`,
    },
  ],
}
const activityWithPendingShowDate = {
  ...mockActivity,
  cards: [
    {
      ...mockUserCard,
      completionStatus: COMPLETION_STATUS.PENDING,
      addedOn: '2/1/2024',
      nextShowDate: '2/3/2024',
      cardId: `${btoa('custom-Furqan 1 to 2')}`,
    },
  ],
}

describe('Cards List', () => {
  afterAll(() => {
    global.window.location.hash = originalHash
  })

  describe('Not mounted', () => {
    beforeEach(() => {
      ;(useMounted as jest.Mock).mockReturnValue(false)
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2/3/2024'))
    })

    afterEach(() => {
      ;(useMounted as jest.Mock).mockReturnValue(true)
      jest.clearAllMocks()
      jest.useRealTimers()
    })

    it('should display no list due to not mounted', async () => {
      window.location.hash = ''
      render(
        <CardsList
          {...{ isMain: true, userDetails: mockUser, activity: activityWithReviewCards }}
        />
      )

      const message = document.querySelector('.today-page-title')
      expect(message).not.toBeInTheDocument()
    })
  })

  describe('Mounted', () => {
    describe('Teacher', () => {
      describe('Cards of the day', () => {
        describe('No cards of the day', () => {
          beforeEach(() => {
            jest.useFakeTimers()
            jest.setSystemTime(new Date('2/3/2024'))
          })

          afterEach(() => {
            jest.clearAllMocks()
            jest.useRealTimers()
          })

          it('should display no list', async () => {
            window.location.hash = ''
            render(
              <CardsList {...{ isMain: true, userDetails: mockUser, activity: activityNoCards }} />
            )

            const message = await screen.findByTestId('no-cards-msg')
            expect(message).toBeInTheDocument()
            expect(message).toHaveTextContent(/You have no cards to review today./)
          })
        })

        describe('Some cards of the today', () => {
          beforeEach(() => {
            jest.useFakeTimers()
            jest.setSystemTime(new Date('2/3/2024'))
          })

          afterEach(() => {
            jest.clearAllMocks()
            jest.useRealTimers()
          })

          it('should display review cards today', async () => {
            window.location.hash = ''
            render(
              <CardsList
                {...{
                  isMain: true,
                  userDetails: mockUser,
                  activity: activityWithMultipleReviewCards,
                }}
              />
            )

            const reviewCards = await screen.findAllByTestId('list-today-cards')
            const reviewCardName = await screen.findAllByTestId('today-card-name')
            const showBtn = await screen.findAllByTestId('today-card-show-btn')

            expect(reviewCards[1]).toBeInTheDocument()
            expect(reviewCardName[1]).toHaveTextContent('Surah 114: Naas')
            expect(showBtn[1]).not.toHaveClass('hidden')

            await act(async () => {
              await fireEvent.click(showBtn[1])
            })

            const manageCardPopup = screen.getByTestId('manage-card-popup-show')
            expect(manageCardPopup).toBeVisible()

            const closemanageCardPopupBtn = screen.getByTestId('manage-card-popup-close-btn')
            await act(async () => {
              await fireEvent.click(closemanageCardPopupBtn)
            })

            expect(manageCardPopup).not.toBeVisible()
          })

          it('should display pending cards added today', async () => {
            window.location.hash = ''
            const updatedActivity = {
              ...mockLanguageActivity,
              cards: [
                {
                  ...mockUserLanguageGrammarCard,
                  completionStatus: COMPLETION_STATUS.PENDING,
                  addedOn: '2/3/2024',
                  cardId: `${btoa('arabic-grammar-conjugate')}`,
                },
              ],
            }
            render(
              <CardsList {...{ isMain: true, userDetails: mockUser, activity: updatedActivity }} />
            )

            const reviewCards = await screen.findByTestId('list-today-cards')
            const reviewCardName = await screen.findByTestId('today-card-name')
            const editBtn = await screen.findByTestId('today-card-edit-btn')
            expect(reviewCards).toBeInTheDocument()
            expect(reviewCardName).toHaveTextContent('Arabic Grammar: conjugate')
            expect(editBtn).not.toHaveClass('hidden')

            await act(async () => {
              await fireEvent.click(editBtn)
            })

            const manageCardPopup = screen.getByTestId('manage-card-popup-edit')
            expect(manageCardPopup).toBeVisible()

            const closemanageCardPopupBtn = screen.getByTestId('manage-card-popup-close-btn')
            await act(async () => {
              await fireEvent.click(closemanageCardPopupBtn)
            })

            expect(manageCardPopup).not.toBeVisible()
          })

          it('should display pending cards next show date today', async () => {
            window.location.hash = ''
            render(
              <CardsList
                {...{ isMain: true, userDetails: mockUser, activity: activityWithPendingShowDate }}
              />
            )

            const reviewCards = await screen.findByTestId('list-today-cards')
            const reviewCardName = await screen.findByTestId('today-card-name')

            const deleteBtn = await screen.findByTestId('today-card-delete-btn')
            expect(reviewCards).toBeInTheDocument()
            expect(reviewCardName).toHaveTextContent('Furqan 1 to 2')
            expect(deleteBtn).not.toHaveClass('hidden')

            await act(async () => {
              await fireEvent.click(deleteBtn)
            })

            const manageCardPopup = screen.getByTestId('manage-card-popup-delete')
            expect(manageCardPopup).toBeVisible()

            const closemanageCardPopupBtn = screen.getByTestId('manage-card-popup-close-btn')
            await act(async () => {
              await fireEvent.click(closemanageCardPopupBtn)
            })

            expect(manageCardPopup).not.toBeVisible()
          })

          it('should not display inactive cards today', async () => {
            window.location.hash = ''
            render(
              <CardsList
                {...{ isMain: true, userDetails: mockUser, activity: activityWithInactiveCards }}
              />
            )

            const message = await screen.findByTestId('no-cards-msg')
            expect(message).toBeInTheDocument()
            expect(message).toHaveTextContent(/You have no cards to review today./)
          })

          it('should not display completed cards today', async () => {
            window.location.hash = ''
            render(
              <CardsList
                {...{ isMain: true, userDetails: mockUser, activity: activityWithCompletedCards }}
              />
            )

            const message = await screen.findByTestId('no-cards-msg')
            expect(message).toBeInTheDocument()
            expect(message).toHaveTextContent(/You have no cards to review today./)
          })
        })
      })

      describe('Active cards', () => {
        describe('No active cards', () => {
          beforeEach(() => {
            jest.useFakeTimers()
            jest.setSystemTime(new Date('2/3/2024'))
          })

          afterEach(() => {
            jest.clearAllMocks()
            jest.useRealTimers()
          })

          it('should display no list', async () => {
            window.location.hash = '#active'
            render(
              <CardsList {...{ isMain: true, userDetails: mockUser, activity: activityNoCards }} />
            )

            const message = await screen.findByTestId('no-cards-msg')
            expect(message).toBeInTheDocument()
            expect(message).toHaveTextContent(/You have no active cards./)
          })
        })

        describe('Some active cards', () => {
          beforeEach(() => {
            jest.useFakeTimers()
            jest.setSystemTime(new Date('2/3/2024'))
          })

          afterEach(() => {
            jest.clearAllMocks()
            jest.useRealTimers()
          })

          it('should display active cards', async () => {
            const activityWithReviewCards2 = {
              ...mockLanguageActivity,
              cards: [
                {
                  ...mockUserLanguageVocabCard,
                  completionStatus: COMPLETION_STATUS.REVIEW,
                  cardId: `${btoa('arabic-vocab-house')}`,
                },
              ],
            }
            window.location.hash = '#active'
            render(
              <CardsList
                {...{ isMain: true, userDetails: mockUser, activity: activityWithReviewCards2 }}
              />
            )

            const reviewCards = await screen.findByTestId('list-active-cards')
            const reviewCardName = await screen.findByTestId('active-card-name')
            const showBtn = await screen.findByTestId('active-card-show-btn')

            expect(reviewCards).toBeInTheDocument()
            expect(reviewCardName).toHaveTextContent('Arabic Vocab: house')
            expect(showBtn).not.toHaveClass('hidden')

            await act(async () => {
              await fireEvent.click(showBtn)
            })

            const manageCardPopup = screen.getByTestId('manage-card-popup-show')
            expect(manageCardPopup).toBeVisible()

            const closemanageCardPopupBtn = screen.getByTestId('manage-card-popup-close-btn')
            await act(async () => {
              await fireEvent.click(closemanageCardPopupBtn)
            })

            expect(manageCardPopup).not.toBeVisible()
          })

          it('should display pending cards added today', async () => {
            window.location.hash = '#active'
            const updatedActivity = {
              ...mockCookingActivity,
              cards: [
                {
                  ...mockUserMiscCard,
                  completionStatus: COMPLETION_STATUS.PENDING,
                  addedOn: '2/3/2024',
                  cardId: `${btoa('misc-card-cook an egg')}`,
                },
              ],
            }
            render(
              <CardsList {...{ isMain: true, userDetails: mockUser, activity: updatedActivity }} />
            )

            const reviewCards = await screen.findByTestId('list-active-cards')
            const reviewCardName = await screen.findByTestId('active-card-name')
            const overrideBtn = await screen.findByTestId('active-card-override-btn')
            expect(reviewCards).toBeInTheDocument()
            expect(reviewCardName).toHaveTextContent('Miscellaneous Card: cook an egg')
            expect(overrideBtn).not.toHaveClass('hidden')

            await act(async () => {
              await fireEvent.click(overrideBtn)
            })

            const manageCardPopup = screen.getByTestId('manage-card-popup-override')
            expect(manageCardPopup).toBeVisible()

            const closemanageCardPopupBtn = screen.getByTestId('manage-card-popup-close-btn')
            await act(async () => {
              await fireEvent.click(closemanageCardPopupBtn)
            })

            expect(manageCardPopup).not.toBeVisible()
          })

          it('should display pending cards next show date active', async () => {
            window.location.hash = '#active'
            render(
              <CardsList
                {...{ isMain: true, userDetails: mockUser, activity: activityWithPendingShowDate }}
              />
            )

            const reviewCards = await screen.findByTestId('list-active-cards')
            const reviewCardName = await screen.findByTestId('active-card-name')

            const deleteBtn = await screen.findByTestId('active-card-delete-btn')
            expect(reviewCards).toBeInTheDocument()
            expect(reviewCardName).toHaveTextContent('Furqan 1 to 2')
            expect(deleteBtn).not.toHaveClass('hidden')

            await act(async () => {
              await fireEvent.click(deleteBtn)
            })

            const manageCardPopup = screen.getByTestId('manage-card-popup-delete')
            expect(manageCardPopup).toBeVisible()

            const closemanageCardPopupBtn = screen.getByTestId('manage-card-popup-close-btn')
            await act(async () => {
              await fireEvent.click(closemanageCardPopupBtn)
            })

            expect(manageCardPopup).not.toBeVisible()
          })
        })
      })

      describe('Inactive cards', () => {
        describe('No inactive cards', () => {
          beforeEach(() => {
            jest.useFakeTimers()
            jest.setSystemTime(new Date('2/3/2024'))
          })

          afterEach(() => {
            jest.clearAllMocks()
            jest.useRealTimers()
          })

          it('should display no list', async () => {
            window.location.hash = '#inactive'
            render(
              <CardsList {...{ isMain: true, userDetails: mockUser, activity: activityNoCards }} />
            )

            const message = await screen.findByTestId('no-cards-msg')
            expect(message).toBeInTheDocument()
            expect(message).toHaveTextContent(/You have no inactive cards./)
          })
        })

        describe('Some inactive cards', () => {
          beforeEach(() => {
            jest.useFakeTimers()
            jest.setSystemTime(new Date('2/3/2024'))
          })

          afterEach(() => {
            jest.clearAllMocks()
            jest.useRealTimers()
          })

          it('should display active cards', async () => {
            const activityWithReviewCards2 = {
              ...mockActivity,
              cards: [
                {
                  ...mockUserCard,
                  completionStatus: COMPLETION_STATUS.INACTIVE,
                  cardId: `${btoa('surah-1-name-Faatiha-juz-1')}`,
                },
              ],
            }
            window.location.hash = '#inactive'
            render(
              <CardsList
                {...{ isMain: true, userDetails: mockUser, activity: activityWithReviewCards2 }}
              />
            )

            const reviewCards = await screen.findByTestId('list-inactive-cards')
            const reviewCardName = await screen.findByTestId('inactive-card-name')
            const showBtn = await screen.findByTestId('inactive-card-show-btn')

            expect(reviewCards).toBeInTheDocument()
            expect(reviewCardName).toHaveTextContent('Surah 1: Faatiha')
            expect(showBtn).not.toHaveClass('hidden')

            await act(async () => {
              await fireEvent.click(showBtn)
            })

            const manageCardPopup = screen.getByTestId('manage-card-popup-show')
            expect(manageCardPopup).toBeVisible()

            const closemanageCardPopupBtn = screen.getByTestId('manage-card-popup-close-btn')
            await act(async () => {
              await fireEvent.click(closemanageCardPopupBtn)
            })

            expect(manageCardPopup).not.toBeVisible()
          })

          it('should display pending cards added today', async () => {
            window.location.hash = '#inactive'
            const inactiveCards = {
              ...mockActivity,
              cards: [
                {
                  ...mockUserCard,
                  completionStatus: COMPLETION_STATUS.INACTIVE,
                  addedOn: '2/3/2024',
                  cardId: `${btoa('juz-30')}`,
                },
              ],
            }
            render(
              <CardsList {...{ isMain: true, userDetails: mockUser, activity: inactiveCards }} />
            )

            const reviewCards = await screen.findByTestId('list-inactive-cards')
            const reviewCardName = await screen.findByTestId('inactive-card-name')
            const activateBtn = await screen.findByTestId('inactive-card-activate-btn')
            expect(reviewCards).toBeInTheDocument()
            expect(reviewCardName).toHaveTextContent('Juz 30')
            expect(activateBtn).not.toHaveClass('hidden')

            await act(async () => {
              await fireEvent.click(activateBtn)
            })

            const manageCardPopup = screen.getByTestId('manage-card-popup-activate')
            expect(manageCardPopup).toBeVisible()

            const closemanageCardPopupBtn = screen.getByTestId('manage-card-popup-close-btn')
            await act(async () => {
              await fireEvent.click(closemanageCardPopupBtn)
            })

            expect(manageCardPopup).not.toBeVisible()
          })

          it('should display pending cards next show date active', async () => {
            window.location.hash = '#inactive'
            const inactiveCards = {
              ...mockActivity,
              cards: [
                {
                  ...mockUserCard,
                  completionStatus: COMPLETION_STATUS.INACTIVE,
                  addedOn: '2/1/2024',
                  nextShowDate: '2/3/2024',
                  cardId: `${btoa('custom-Furqan 1 to 2')}`,
                },
              ],
            }
            render(
              <CardsList {...{ isMain: true, userDetails: mockUser, activity: inactiveCards }} />
            )

            const reviewCards = await screen.findByTestId('list-inactive-cards')
            const reviewCardName = await screen.findByTestId('inactive-card-name')

            const deleteBtn = await screen.findByTestId('inactive-card-delete-btn')
            expect(reviewCards).toBeInTheDocument()
            expect(reviewCardName).toHaveTextContent('Furqan 1 to 2')
            expect(deleteBtn).not.toHaveClass('hidden')

            await act(async () => {
              await fireEvent.click(deleteBtn)
            })

            const manageCardPopup = screen.getByTestId('manage-card-popup-delete')
            expect(manageCardPopup).toBeVisible()

            const closemanageCardPopupBtn = screen.getByTestId('manage-card-popup-close-btn')
            await act(async () => {
              await fireEvent.click(closemanageCardPopupBtn)
            })

            expect(manageCardPopup).not.toBeVisible()
          })
        })
      })
    })

    describe('Student', () => {
      describe('Cards of the day', () => {
        describe('Some cards of the today', () => {
          beforeEach(() => {
            jest.useFakeTimers()
            jest.setSystemTime(new Date('2/3/2024'))
          })

          afterEach(() => {
            jest.clearAllMocks()
            jest.useRealTimers()
          })

          it('should display review cards today', async () => {
            window.location.hash = ''
            render(
              <CardsList
                {...{ isMain: true, userDetails: mockStudent, activity: activityWithReviewCards }}
              />
            )

            const deleteBtn = await screen.findByTestId('today-card-delete-btn')
            expect(deleteBtn).toHaveClass('hidden')
          })
        })
      })

      describe('Active card', () => {
        describe('Some active cards', () => {
          beforeEach(() => {
            jest.useFakeTimers()
            jest.setSystemTime(new Date('2/3/2024'))
          })

          afterEach(() => {
            jest.clearAllMocks()
            jest.useRealTimers()
          })

          it('should display pending cards added today', async () => {
            window.location.hash = '#active'
            render(
              <CardsList
                {...{
                  isMain: true,
                  userDetails: mockStudent,
                  activity: activityWithPendingAddedToday,
                }}
              />
            )

            const reviewCards = await screen.findByTestId('list-active-cards')
            const reviewCardName = await screen.findByTestId('active-card-name')
            const overrideBtn = await screen.findByTestId('active-card-override-btn')
            expect(reviewCards).toBeInTheDocument()
            expect(reviewCardName).toHaveTextContent('Juz 30')
            expect(overrideBtn).toHaveClass('hidden')
          })

          it('should display pending cards next show date active', async () => {
            window.location.hash = '#active'
            render(
              <CardsList
                {...{
                  isMain: true,
                  userDetails: mockStudent,
                  activity: activityWithPendingShowDate,
                }}
              />
            )

            const reviewCards = await screen.findByTestId('list-active-cards')
            const reviewCardName = await screen.findByTestId('active-card-name')

            const deleteBtn = await screen.findByTestId('active-card-delete-btn')
            expect(reviewCards).toBeInTheDocument()
            expect(reviewCardName).toHaveTextContent('Furqan 1 to 2')
            expect(deleteBtn).toHaveClass('hidden')
          })
        })
      })

      describe('Inactive card', () => {
        describe('Some inactive cards', () => {
          beforeEach(() => {
            jest.useFakeTimers()
            jest.setSystemTime(new Date('2/3/2024'))
          })

          afterEach(() => {
            jest.clearAllMocks()
            jest.useRealTimers()
          })

          it('should display inactive cards no activate', async () => {
            window.location.hash = '#inactive'
            const inactiveCards = {
              ...mockActivity,
              cards: [
                {
                  ...mockUserCard,
                  completionStatus: COMPLETION_STATUS.INACTIVE,
                  addedOn: '2/3/2024',
                  cardId: `${btoa('juz-30')}`,
                },
              ],
            }
            render(
              <CardsList {...{ isMain: true, userDetails: mockStudent, activity: inactiveCards }} />
            )

            const reviewCards = await screen.findByTestId('list-inactive-cards')
            const reviewCardName = await screen.findByTestId('inactive-card-name')
            const activateBtn = await screen.findByTestId('inactive-card-activate-btn')
            expect(reviewCards).toBeInTheDocument()
            expect(reviewCardName).toHaveTextContent('Juz 30')
            expect(activateBtn).toHaveClass('hidden')
          })

          it('should display inactive cards no delete', async () => {
            window.location.hash = '#inactive'
            const inactiveCards = {
              ...mockActivity,
              cards: [
                {
                  ...mockUserCard,
                  completionStatus: COMPLETION_STATUS.INACTIVE,
                  addedOn: '2/3/2024',
                  cardId: `${btoa('juz-30')}`,
                },
              ],
            }
            render(
              <CardsList {...{ isMain: true, userDetails: mockStudent, activity: inactiveCards }} />
            )

            const reviewCards = await screen.findByTestId('list-inactive-cards')
            const reviewCardName = await screen.findByTestId('inactive-card-name')

            const deleteBtn = await screen.findByTestId('inactive-card-delete-btn')
            expect(reviewCards).toBeInTheDocument()
            expect(reviewCardName).toHaveTextContent('Juz 30')
            expect(deleteBtn).toHaveClass('hidden')
          })
        })
      })
    })
  })
})
