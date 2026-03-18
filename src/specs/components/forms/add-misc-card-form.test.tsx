import '@testing-library/jest-dom'
import { screen, fireEvent, act, waitFor } from '@testing-library/react'
import { render } from '../../util'
import * as React from 'react'
import AddMiscCardForm from '../../../components/forms/add-misc-card-form'
import { mockUser, mockCookingActivity, mockUserMiscCard } from '../../mocks'
import { toast } from 'sonner'
import { server } from '../../msw/server'
import { http, HttpResponse } from 'msw'

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn(), info: jest.fn() },
}))
jest.mock('next-auth/react', () => ({
  getSession: jest.fn().mockResolvedValue(null),
}))

describe('Add misc card form', () => {
  const user = { ...mockUser, activities: [{ ...mockCookingActivity }] }

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Display forms', () => {
    it('should display textarea', async () => {
      render(
        <AddMiscCardForm {...{ isMain: true, user: mockUser, activity: mockCookingActivity }} />
      )
      const typeListForm = await screen.findByTestId('type-list-form')
      expect(typeListForm).not.toHaveClass('hidden')
    })
  })

  describe('Create misc cards list', () => {
    it('should not validate empty misc cards list', async () => {
      render(
        <AddMiscCardForm {...{ isMain: true, user: mockUser, activity: mockCookingActivity }} />
      )

      const validateTypeBoxBtn = await screen.findByTestId('add-type-cards-validate-button')

      await act(async () => {
        fireEvent.click(validateTypeBoxBtn)
      })

      expect(toast.warning).toHaveBeenCalledWith('Oops, you are trying to validate an empty list')
    })

    it('should allow unlimited number of cards to be created', async () => {
      render(
        <AddMiscCardForm {...{ isMain: true, user: mockUser, activity: mockCookingActivity }} />
      )

      const textArea = (await screen.findByTestId('textarea-for-typed-list')) as HTMLTextAreaElement

      await act(async () => {
        await fireEvent.change(textArea, { target: { value: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 2' } })
      })

      expect(toast.warning).not.toHaveBeenCalledWith('Oops, this is as long as your list can get!')
    })

    it('should open popup with expected list', async () => {
      render(
        <AddMiscCardForm {...{ isMain: true, user: mockUser, activity: mockCookingActivity }} />
      )

      const textArea = (await screen.findByTestId('textarea-for-typed-list')) as HTMLTextAreaElement
      const validateTypeBoxBtn = await screen.findByTestId('add-type-cards-validate-button')

      await act(async () => {
        await fireEvent.change(textArea, { target: { value: '1, 2 , 3, 4, 5, , 7' } })
        await fireEvent.click(validateTypeBoxBtn)
      })

      await expect(screen.queryByTestId('validate-popup')).not.toBeNull()
      await expect(screen.queryByTestId('validate-popup')).toHaveTextContent('1, 2, 3, 4, 5, 7')

      const closeBtn = await screen.findByTestId('validate-popup-close-btn')

      await act(async () => {
        await fireEvent.click(closeBtn)
      })

      await expect(screen.queryByTestId('validate-popup')).toBeNull()
      expect(toast.info).toHaveBeenCalledWith('Validation canceled.')
    })

    describe('Submitting', () => {
      it('should submit with expected list', async () => {
        server.use(
          http.post('*/user/cards/add', () =>
            HttpResponse.json({ message: 'Cards added', details: [] })
          )
        )
        render(
          <AddMiscCardForm {...{ isMain: true, user: mockUser, activity: mockCookingActivity }} />
        )

        const textArea = (await screen.findByTestId(
          'textarea-for-typed-list'
        )) as HTMLTextAreaElement
        const validateTypeBoxBtn = await screen.findByTestId('add-type-cards-validate-button')

        await act(async () => {
          await fireEvent.change(textArea, { target: { value: 'cook an egg, make your bed' } })
          await fireEvent.click(validateTypeBoxBtn)
        })

        const popupYesBtn = await screen.findByTestId('validate-btn')

        await act(async () => {
          await fireEvent.click(popupYesBtn)
        })

        await waitFor(() => {
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

        render(
          <AddMiscCardForm {...{ isMain: true, user: mockUser, activity: mockCookingActivity }} />
        )

        const textArea = (await screen.findByTestId(
          'textarea-for-typed-list'
        )) as HTMLTextAreaElement
        const validateTypeBoxBtn = await screen.findByTestId('add-type-cards-validate-button')

        await act(async () => {
          await fireEvent.change(textArea, { target: { value: 'cook an egg, make your bed' } })
          await fireEvent.click(validateTypeBoxBtn)
        })

        const popupYesBtn = await screen.findByTestId('validate-btn')

        await act(async () => {
          await fireEvent.click(popupYesBtn)
        })

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

        render(
          <AddMiscCardForm {...{ isMain: true, user: mockUser, activity: mockCookingActivity }} />
        )

        const textArea = (await screen.findByTestId(
          'textarea-for-typed-list'
        )) as HTMLTextAreaElement
        const validateTypeBoxBtn = await screen.findByTestId('add-type-cards-validate-button')

        await act(async () => {
          await fireEvent.change(textArea, { target: { value: 'cook an egg, make your bed' } })
          await fireEvent.click(validateTypeBoxBtn)
        })

        const popupYesBtn = await screen.findByTestId('validate-btn')

        await act(async () => {
          await fireEvent.click(popupYesBtn)
        })

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith(
            'Failed to add cards due to an internal error. Please try again later.'
          )
        })
      })

      it('should not reset form when error is thrown with no response', async () => {
        server.use(http.post('*/user/cards/add', () => HttpResponse.error()))

        render(
          <AddMiscCardForm {...{ isMain: true, user: mockUser, activity: mockCookingActivity }} />
        )

        const textArea = (await screen.findByTestId(
          'textarea-for-typed-list'
        )) as HTMLTextAreaElement
        const validateTypeBoxBtn = await screen.findByTestId('add-type-cards-validate-button')

        await act(async () => {
          await fireEvent.change(textArea, { target: { value: 'cook an egg, make your bed' } })
          await fireEvent.click(validateTypeBoxBtn)
        })

        const popupYesBtn = await screen.findByTestId('validate-btn')

        await act(async () => {
          await fireEvent.click(popupYesBtn)
        })

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith('Server is down. Try again later.')
        })
      })
    })
  })
})
