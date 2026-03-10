import * as React from 'react'
import '@testing-library/jest-dom'
import { screen, fireEvent, act } from '@testing-library/react'
import { render } from '../../util'
import AddQuranCardForm from '../../../components/forms/add-quran-card-form'
import { mockActivity, mockUser, mockUserCard } from '../../mocks'
import { quranCards } from '../../../lib/constants/quran-bank'
import { createCards, deleteCard } from '../../../api/controller'

jest.mock('../../../api/controller')
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

    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2/4/2024'))
    })

    afterEach(() => {
      jest.resetAllMocks()
      jest.clearAllMocks()
      jest.useRealTimers()
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

      beforeEach(() => {
        jest.useFakeTimers()
        jest.setSystemTime(new Date('2/4/2024'))
      })

      afterEach(() => {
        jest.resetAllMocks()
        jest.clearAllMocks()
        jest.useRealTimers()
      })

      it('should prompt with message when trying to submit empty form', async () => {
        ;(createCards as jest.Mock).mockImplementationOnce(() => {
          return Promise.resolve({
            status: 200,
            data: { message: 'Cards added', details: [mockUserCard] },
          })
        })

        render(<AddQuranCardForm {...{ isMain: true, user, activity: mockActivity }} />)

        const submitButton = await screen.findByTestId('add-cards-submit-button')
        await act(async () => {
          await fireEvent.click(submitButton)
        })

        const outcomeMessage = await screen.findByText(/Please select the cards you want to add./i)
        await expect(createCards).not.toHaveBeenCalled()
        expect(outcomeMessage).toBeInTheDocument()
      })

      it('should invoke createCards controller when form is submitted', async () => {
        const expectedPaylod = {
          userId: `${btoa('mock.user@email.com')}`,
          activity: 'Quran',
          cards: [
            { ...mockUserCard },
            { ...mockUserCard, cardId: `${btoa(`custom-Furqan 1 to 2`)}` },
          ],
        }

        ;(createCards as jest.Mock).mockImplementationOnce(() => {
          return Promise.resolve({
            status: 200,
            data: {
              message: 'Cards added',
              details: [
                { ...mockUserCard },
                { ...mockUserCard, cardId: `${btoa(`custom-Furqan 1 to 2`)}` },
              ],
            },
          })
        })
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

        const outcomeMessage = await screen.findByText(/Cards added/i)
        await expect(createCards).toHaveBeenCalledWith(expectedPaylod)
        expect(outcomeMessage).toBeInTheDocument()
      })

      it('should not reset form when response is not 200 or 500 and display error message', async () => {
        jest.spyOn(console, 'log').mockImplementation(() => null)
        const error = {
          response: {
            status: 400,
            data: { status: 'failedTransaction', message: 'Erroneous response' },
          },
        }
        ;(createCards as jest.Mock).mockImplementationOnce(() => {
          return Promise.reject(error)
        })

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

        const errorMessage = await screen.findByText(/Erroneous response/i)
        expect(errorMessage).toBeInTheDocument()
      })

      it('should not reset form when response is 500 and display error message', async () => {
        const error = {
          response: {
            status: 500,
            data: { status: 'internalServerError', message: 'Server error' },
          },
        }
        ;(createCards as jest.Mock).mockImplementationOnce(() => {
          return Promise.reject(error)
        })

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

        const errorMessage = await screen.getByText(
          /Failed to add cards due to an internal error. Please try again later./i
        )

        expect(errorMessage).toBeInTheDocument()
        expect(console.log).toHaveBeenCalledWith(error)
      })

      it('should not reset form when error is thrown with no response', async () => {
        ;(createCards as jest.Mock).mockImplementationOnce(() => {
          return Promise.reject({ status: 500, message: 'Error thrown and caught.' })
        })

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

        const errorMessage = await screen.getByText(/Server is down. Try again later./i)
        expect(errorMessage).toBeInTheDocument()
        expect(console.log).toHaveBeenCalledWith({
          status: 500,
          message: 'Error thrown and caught.',
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

      beforeEach(() => {
        jest.useFakeTimers()
        jest.setSystemTime(new Date('2/4/2024'))
      })

      afterEach(() => {
        jest.resetAllMocks()
        jest.clearAllMocks()
        jest.useRealTimers()
      })

      it('should invoke createCards controller with card for juz and no associated surahs', async () => {
        const userCardWithJuz = { ...mockUserCard, cardId: `${btoa('juz-1')}` }
        const expectedPaylod = {
          userId: mockUser.userId,
          activity: 'Quran',
          cards: [{ ...userCardWithJuz }],
        }

        ;(createCards as jest.Mock).mockImplementationOnce(() => {
          return Promise.resolve({
            status: 200,
            data: { message: 'Cards added', details: [userCardWithJuz] },
          })
        })
        ;(deleteCard as jest.Mock).mockImplementationOnce(() => {
          return Promise.resolve({ status: 200, data: { message: 'Cards deleted', details: {} } })
        })

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

        await expect(createCards).toHaveBeenCalledWith(expectedPaylod)
        await expect(deleteCard).toHaveBeenCalledWith([
          {
            activity: 'Quran',
            cardId: `${btoa('surah-1-name-Faatiha-juz-1')}`,
            userId: mockUser.userId,
          },
          {
            activity: 'Quran',
            cardId: `${btoa('surah-2-name-Baqara-juz-1')}`,
            userId: mockUser.userId,
          },
        ])
      })
    })
  })
})
