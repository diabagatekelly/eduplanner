import * as React from 'react'
import '@testing-library/jest-dom'
import { screen, fireEvent, act, waitFor } from '@testing-library/react'
import { render } from '../../util'
import AddQuranCardForm from '../../../components/forms/add-quran-card-form'
import { mockActivity, mockUser, mockUserCard } from '../../mocks'
import { quranCards } from '../../../lib/constants/quran-bank'
import { toast } from 'sonner'
import { server } from '../../msw/server'
import { http, HttpResponse } from 'msw'

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn(), info: jest.fn() },
}))
jest.mock('next-auth/react', () => ({
  getSession: jest.fn().mockResolvedValue(null),
}))
jest.mock('next/navigation', () => {
  return {
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
    })),
    usePathname: jest.fn(),
  }
})

describe('Add Quran card form', () => {
  describe('Display', () => {
    const user = { ...mockUser, activities: [{ ...mockActivity }] }

    afterEach(() => {
      jest.restoreAllMocks()
      jest.clearAllMocks()
    })

    it('should render the page with default checkboxes for each juz and surah', async () => {
      render(<AddQuranCardForm {...{ isMain: true, user, activity: { ...mockActivity } }} />)
      const checkboxes = await screen.findAllByTestId('quran-checkbox')
      const inputs = await screen.findAllByTestId('quran-checkbox-input')

      expect(checkboxes.length).toEqual(quranCards.length)
      expect(checkboxes[0].textContent).toContain('Juz 1')
      expect(checkboxes[1].textContent).toContain('1 - Faatiha')
      expect(checkboxes[checkboxes.length - 1].textContent).toContain('114 - Naas')
      expect((inputs[0] as HTMLInputElement).checked).toBe(false)
      expect((inputs[0] as HTMLInputElement).disabled).toBe(false)
    })

    it('should check/uncheck checkboxes as expected', async () => {
      render(<AddQuranCardForm {...{ isMain: true, user, activity: { ...mockActivity } }} />)
      const inputs = await screen.findAllByTestId('quran-checkbox-input')
      expect((inputs[inputs.length - 1] as HTMLInputElement).checked).toBe(false)
      await act(async () => {
        await fireEvent.click(inputs[inputs.length - 1])
      })
      expect((inputs[inputs.length - 1] as HTMLInputElement).checked).toBe(true)

      const inputs2 = await screen.findAllByTestId('quran-checkbox-input')
      await act(async () => {
        await fireEvent.click(inputs2[inputs.length - 1])
      })
      expect((inputs2[inputs.length - 1] as HTMLInputElement).checked).toBe(false)

      const inputs3 = await screen.findAllByTestId('quran-checkbox-input')
      await act(async () => {
        await fireEvent.click(inputs3[0])
      })
      expect((inputs3[0] as HTMLInputElement).checked).toBe(true)
    })

    it('should render page with some disabled checkboxes', async () => {
      const activityWithCard = { ...mockActivity, cards: [{ ...mockUserCard }] }
      const userWithCards = { ...mockUser, activities: [activityWithCard] }

      render(
        <AddQuranCardForm {...{ isMain: true, user: userWithCards, activity: activityWithCard }} />
      )
      const inputs = await screen.findAllByTestId('quran-checkbox-input')

      expect((inputs[inputs.length - 1] as HTMLInputElement).value).toEqual(mockUserCard.cardId)
      expect((inputs[inputs.length - 1] as HTMLInputElement).disabled).toBe(true)
    })
  })

  describe('Submitting', () => {
    describe('Wihout juz', () => {
      const user = { ...mockUser, activities: [{ ...mockActivity }] }

      afterEach(() => {
        jest.restoreAllMocks()
        jest.clearAllMocks()
      })

      it('should prompt with message when trying to submit empty form', async () => {
        render(<AddQuranCardForm {...{ isMain: true, user, activity: mockActivity }} />)

        const submitButton = await screen.findByTestId('add-cards-submit-button')
        await act(async () => {
          await fireEvent.click(submitButton)
        })

        expect(toast.warning).toHaveBeenCalledWith('Please select the cards you want to add.')
      })

      it('should send correct payload and show success toast after submitting cards', async () => {
        let receivedBody: any
        server.use(
          http.post('*/user/cards/add', async ({ request }) => {
            receivedBody = await request.json()
            return HttpResponse.json({ message: 'Cards added', details: [mockUserCard] })
          })
        )

        render(<AddQuranCardForm {...{ isMain: true, user, activity: mockActivity }} />)

        const inputs = await screen.findAllByTestId('quran-checkbox-input')
        const customField = await screen.findByTestId('custom-quran')
        const submitButton = await screen.findByTestId('add-cards-submit-button')

        await act(async () => {
          await fireEvent.click(inputs[inputs.length - 1])
          fireEvent.change(customField, {
            target: { value: 'Furqan 1 to 2' },
          })
        })

        await act(async () => {
          await fireEvent.click(submitButton)
        })

        await waitFor(() => {
          expect(receivedBody).toEqual({
            userId: `${btoa('mock.user@email.com')}`,
            activity: 'Quran',
            cards: [
              { ...mockUserCard },
              { ...mockUserCard, cardId: `${btoa('custom-Furqan 1 to 2')}` },
            ],
          })
          expect(toast.success).toHaveBeenCalledWith('Cards added')
        })
      })

      it('should not reset form when response is not 200 or 500 and display error message', async () => {
        server.use(
          http.post('*/user/cards/add', () =>
            HttpResponse.json(
              { status: 'failedTransaction', message: 'Erroneous response' },
              { status: 400 }
            )
          )
        )

        render(<AddQuranCardForm {...{ isMain: true, user, activity: mockActivity }} />)

        const inputs = await screen.findAllByTestId('quran-checkbox-input')
        const submitButton = await screen.findByTestId('add-cards-submit-button')

        await act(async () => {
          await fireEvent.click(inputs[0])
        })

        expect((inputs[0] as HTMLInputElement).checked).toBe(true)

        await act(async () => {
          await fireEvent.click(submitButton)
        })

        expect((inputs[0] as HTMLInputElement).checked).toBe(true)

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith('Erroneous response')
        })
      })

      it('should not reset form when response is 500 and display error message', async () => {
        server.use(
          http.post('*/user/cards/add', () =>
            HttpResponse.json(
              { status: 'internalServerError', message: 'Server error' },
              { status: 500 }
            )
          )
        )

        render(<AddQuranCardForm {...{ isMain: true, user, activity: mockActivity }} />)

        const inputs = await screen.findAllByTestId('quran-checkbox-input')
        const submitButton = await screen.findByTestId('add-cards-submit-button')

        await act(async () => {
          await fireEvent.click(inputs[2])
        })

        expect((inputs[2] as HTMLInputElement).checked).toBe(true)

        await act(async () => {
          await fireEvent.click(submitButton)
        })

        expect((inputs[2] as HTMLInputElement).checked).toBe(true)

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith(
            'Failed to add cards due to an internal error. Please try again later.'
          )
        })
      })

      it('should not reset form when error is thrown with no response', async () => {
        server.use(http.post('*/user/cards/add', () => HttpResponse.error()))

        render(<AddQuranCardForm {...{ isMain: true, user, activity: mockActivity }} />)

        const inputs = await screen.findAllByTestId('quran-checkbox-input')
        const submitButton = await screen.findByTestId('add-cards-submit-button')

        await act(async () => {
          await fireEvent.click(inputs[3])
        })

        expect((inputs[3] as HTMLInputElement).checked).toBe(true)

        await act(async () => {
          await fireEvent.click(submitButton)
        })

        expect((inputs[3] as HTMLInputElement).checked).toBe(true)

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith('Server is down. Try again later.')
        })
      })
    })

    describe('With juz', () => {
      const updatedCards = [
        { ...mockUserCard, cardId: `${btoa('surah-1-name-Faatiha-juz-1')}` },
        { ...mockUserCard, cardId: `${btoa('surah-2-name-Baqara-juz-1')}` },
        { ...mockUserCard, cardId: `${btoa('juz-3')}` },
      ]
      const updatedActivity = { ...mockActivity, cards: updatedCards }
      const updatedUser = { ...mockUser, activities: [updatedActivity] }

      afterEach(() => {
        jest.restoreAllMocks()
        jest.clearAllMocks()
      })

      it('should show success toast after submitting juz card and deleting associated surahs', async () => {
        const userCardWithJuz = { ...mockUserCard, cardId: `${btoa('juz-1')}` }

        server.use(
          http.post('*/user/cards/add', () =>
            HttpResponse.json({ message: 'Cards added', details: [userCardWithJuz] })
          ),
          http.post('*/user/cards/delete', () =>
            HttpResponse.json({ message: 'Cards deleted', details: {} })
          )
        )

        render(
          <AddQuranCardForm {...{ isMain: true, user: updatedUser, activity: updatedActivity }} />
        )

        const submitButton = await screen.findByTestId('add-cards-submit-button')

        // Check
        const inputs = await screen.findAllByTestId('quran-checkbox-input')
        await act(async () => {
          await fireEvent.click(inputs[0])
        })
        expect(inputs[0]).toBeChecked()

        // Uncheck
        const inputs2 = await screen.findAllByTestId('quran-checkbox-input')
        await act(async () => {
          await fireEvent.click(inputs2[0])
        })
        expect(inputs2[0]).not.toBeChecked()

        // Re-check
        const inputs3 = await screen.findAllByTestId('quran-checkbox-input')
        await act(async () => {
          await fireEvent.click(inputs3[0])
        })
        expect(inputs3[0]).toBeChecked()

        await act(async () => {
          await fireEvent.click(submitButton)
        })

        await waitFor(() => {
          expect(toast.success).toHaveBeenCalledWith('Cards added')
        })
      })
    })
  })
})
