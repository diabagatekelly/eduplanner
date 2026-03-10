import '@testing-library/jest-dom'
import { screen, fireEvent, act } from '@testing-library/react'
import { render } from '../../util'
import * as React from 'react'
import AddLanguageCardForm from '../../../components/forms/add-language-card-form'
import {
  mockUser,
  mockActivity,
  mockLanguageActivity,
  mockUserLanguageGrammarCard,
  mockUserLanguageVocabCard,
} from '../../mocks'
import { createCards } from '../../../api/controller'

jest.mock('../../../api/controller')

describe('Add language card form', () => {
  const user = { ...mockUser, activities: [{ ...mockLanguageActivity }] }

  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2/4/2024'))
  })

  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
    jest.useRealTimers()
  })

  describe('Display forms', () => {
    it('should display "Select language card type form on load"', async () => {
      render(<AddLanguageCardForm {...{ isMain: true, user: mockUser, activity: mockActivity }} />)

      const selectCardTypeForm = await screen.findByTestId('select-language-card-type')
      const selectCardTypeFormSelect = document.querySelector('#cardTypeSelect') as Element

      const selectInputType = await screen.findByTestId('select-input-type')
      const selectInputTypeSelect = document.querySelector('#listInputMethod') as Element

      const uploadFileForm = await screen.findByTestId('upload-file-form')
      const typeListForm = await screen.findByTestId('type-list-form')

      expect(selectCardTypeForm).not.toHaveClass('hidden')
      expect(selectInputType).toHaveClass('hidden')
      expect(uploadFileForm).toHaveClass('hidden')
      expect(typeListForm).toHaveClass('hidden')

      // From 1st dropdown, select Vocab card
      await act(async () => {
        fireEvent.change(selectCardTypeFormSelect, { target: { value: 'Vocab card' } })
      })

      expect(selectInputType).not.toHaveClass('hidden')

      // From 2nd dropdown, select Type list
      await act(async () => {
        fireEvent.change(selectInputTypeSelect, { target: { value: 'Type list' } })
      })

      expect(typeListForm).not.toHaveClass('hidden')
      expect(uploadFileForm).toHaveClass('hidden')

      // Switch 2nd dropdown to Upload file
      await act(async () => {
        fireEvent.change(selectInputTypeSelect, { target: { value: 'Upload file' } })
      })

      expect(typeListForm).toHaveClass('hidden')
      expect(uploadFileForm).not.toHaveClass('hidden')

      // Switch 1st dropdown to Grammar card
      await act(async () => {
        fireEvent.change(selectCardTypeFormSelect, { target: { value: 'Grammar card' } })
      })

      expect(selectInputType).toHaveClass('hidden')
      expect(uploadFileForm).toHaveClass('hidden')
      expect(typeListForm).not.toHaveClass('hidden')

      // Switch 1st dropdown back to Vocab card
      await act(async () => {
        fireEvent.change(selectCardTypeFormSelect, { target: { value: 'Vocab card' } })
      })

      expect(selectInputType).not.toHaveClass('hidden')
      expect(uploadFileForm).toHaveClass('hidden')
      expect(typeListForm).toHaveClass('hidden')

      // Switch 2nd dropdown to Upload file then Choose ...
      await act(async () => {
        fireEvent.change(selectInputTypeSelect, { target: { value: 'Upload file' } })
      })

      expect(uploadFileForm).not.toHaveClass('hidden')

      await act(async () => {
        fireEvent.change(selectInputTypeSelect, { target: { value: 'Choose ...' } })
      })

      expect(uploadFileForm).toHaveClass('hidden')

      // Switch 1st dropdown back to Choose ...
      await act(async () => {
        fireEvent.change(selectCardTypeFormSelect, { target: { value: 'Choose ...' } })
      })

      expect(selectInputType).toHaveClass('hidden')
    })
  })

  describe('Create grammar cards list', () => {
    it('should not validate empty grammar cards list', async () => {
      render(<AddLanguageCardForm {...{ isMain: true, user: mockUser, activity: mockActivity }} />)

      const selectCardTypeFormSelect = document.querySelector('#cardTypeSelect') as Element
      const typeListForm = await screen.findByTestId('type-list-form')
      const validateTypeBoxBtn = await screen.findByTestId('add-type-cards-validate-button')
      const outcomeMsg = await screen.findByTestId('outcome-message')

      // Switch 1st dropdown to Grammar card
      await act(async () => {
        fireEvent.change(selectCardTypeFormSelect, { target: { value: 'Grammar card' } })
      })

      expect(typeListForm).not.toHaveClass('hidden')

      await act(async () => {
        fireEvent.click(validateTypeBoxBtn)
      })

      expect(outcomeMsg).toHaveTextContent('Oops, you are trying to validate an empty list')
    })

    it('should allow to create an unlimited number of grammar cards', async () => {
      render(<AddLanguageCardForm {...{ isMain: true, user: mockUser, activity: mockActivity }} />)

      const selectCardTypeFormSelect = document.querySelector('#cardTypeSelect') as Element
      const textArea = (await screen.findByTestId('textarea-for-typed-list')) as HTMLTextAreaElement
      const outcomeMsg = await screen.findByTestId('outcome-message')

      // Switch 1st dropdown to Grammar card
      await act(async () => {
        fireEvent.change(selectCardTypeFormSelect, { target: { value: 'Grammar card' } })
      })

      expect(textArea).not.toHaveClass('hidden')

      await act(async () => {
        await fireEvent.change(textArea, {
          target: {
            value: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 2',
          },
        })
      })

      expect(outcomeMsg).not.toHaveTextContent('Oops, this is as long as your list can get!')
    })

    it('should open popup with expected grammar list', async () => {
      render(<AddLanguageCardForm {...{ isMain: true, user: mockUser, activity: mockActivity }} />)

      const selectCardTypeFormSelect = document.querySelector('#cardTypeSelect') as Element
      const textArea = (await screen.findByTestId('textarea-for-typed-list')) as HTMLTextAreaElement
      const validateTypeBoxBtn = await screen.findByTestId('add-type-cards-validate-button')
      const outcomeMsg = await screen.findByTestId('outcome-message')

      await expect(screen.queryByTestId('validate-popup')).toBeNull()
      // Switch 1st dropdown to Grammar card
      await act(async () => {
        fireEvent.change(selectCardTypeFormSelect, { target: { value: 'Grammar card' } })
      })

      expect(textArea).not.toHaveClass('hidden')

      await act(async () => {
        await fireEvent.change(textArea, {
          target: { value: '1, 2, 3, 4, 5, , 7, 8, 9, 10 , 11, 12, 13, 14' },
        })
        await fireEvent.click(validateTypeBoxBtn)
      })

      await expect(screen.queryByTestId('validate-popup')).not.toBeNull()
      await expect(screen.queryByTestId('validate-popup')).toHaveTextContent(
        '1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14'
      )

      const closeBtn = await screen.findByTestId('validate-popup-close-btn')

      await act(async () => {
        await fireEvent.click(closeBtn)
      })

      await expect(screen.queryByTestId('validate-popup')).toHaveAttribute('hidden')
      expect(outcomeMsg).toHaveTextContent('Validation canceled.')
    })

    describe('Submitting', () => {
      it('should submit with expected list', async () => {
        ;(createCards as jest.Mock).mockImplementation(() =>
          Promise.resolve({ status: 200, data: { message: 'Cards added', details: [] } })
        )
        render(
          <AddLanguageCardForm
            {...{ isMain: true, user: mockUser, activity: mockLanguageActivity }}
          />
        )

        const selectCardTypeFormSelect = document.querySelector('#cardTypeSelect') as Element
        const textArea = (await screen.findByTestId(
          'textarea-for-typed-list'
        )) as HTMLTextAreaElement
        const validateTypeBoxBtn = await screen.findByTestId('add-type-cards-validate-button')

        // Switch 1st dropdown to Grammar card
        await act(async () => {
          fireEvent.change(selectCardTypeFormSelect, { target: { value: 'Grammar card' } })
        })

        await act(async () => {
          await fireEvent.change(textArea, {
            target: { value: 'conjugate, Madinah 1 pg. 6 ex. 1' },
          })
          await fireEvent.click(validateTypeBoxBtn)
        })

        const popupYesBtn = await screen.findByTestId('validate-btn')

        await act(async () => {
          await fireEvent.click(popupYesBtn)
        })

        const expectedCardsPayload = [
          { ...mockUserLanguageGrammarCard, cardId: `${btoa('arabic-grammar-conjugate')}` },
          {
            ...mockUserLanguageGrammarCard,
            cardId: `${btoa('arabic-grammar-Madinah 1 pg. 6 ex. 1')}`,
          },
        ]

        expect(createCards).toHaveBeenCalledWith({
          userId: mockUser.userId,
          activity: mockLanguageActivity.name,
          cards: expectedCardsPayload,
        })
      })
    })
  })

  describe('Create typed vocab cards list', () => {
    it('should allow to create an unlimited number of vocab cards', async () => {
      render(<AddLanguageCardForm {...{ isMain: true, user: mockUser, activity: mockActivity }} />)

      const selectCardTypeFormSelect = document.querySelector('#cardTypeSelect') as Element
      const textArea = (await screen.findByTestId('textarea-for-typed-list')) as HTMLTextAreaElement
      const outcomeMsg = await screen.findByTestId('outcome-message')

      // Switch 1st dropdown to Grammar card
      await act(async () => {
        fireEvent.change(selectCardTypeFormSelect, { target: { value: 'Vocab card' } })
      })

      const selectInputTypeSelect = document.querySelector('#listInputMethod') as Element

      // From 2nd dropdown, select Type list
      await act(async () => {
        fireEvent.change(selectInputTypeSelect, { target: { value: 'Type list' } })
      })

      expect(textArea).not.toHaveClass('hidden')

      await act(async () => {
        await fireEvent.change(textArea, { target: { value: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 2' } })
      })

      expect(outcomeMsg).not.toHaveTextContent('Oops, this is as long as your list can get!')
    })
  })

  describe('Create vocab cards list from upload', () => {
    it('should not validate empty upload', async () => {
      render(<AddLanguageCardForm {...{ isMain: true, user: mockUser, activity: mockActivity }} />)

      const selectCardTypeFormSelect = document.querySelector('#cardTypeSelect') as Element
      const uploadFileForm = await screen.findByTestId('upload-file-form')
      const validateTypeBoxBtn = await screen.findByTestId('add-type-cards-validate-button')
      const outcomeMsg = await screen.findByTestId('outcome-message')

      // Switch 1st dropdown to Grammar card
      await act(async () => {
        fireEvent.change(selectCardTypeFormSelect, { target: { value: 'Vocab card' } })
      })

      const selectInputTypeSelect = document.querySelector('#listInputMethod') as Element

      await act(async () => {
        fireEvent.change(selectInputTypeSelect, { target: { value: 'Upload file' } })
      })

      expect(uploadFileForm).not.toHaveClass('hidden')

      await act(async () => {
        fireEvent.click(validateTypeBoxBtn)
      })

      expect(outcomeMsg).toHaveTextContent('Oops, you are trying to validate an empty list')
    })

    it('should allow to upload an unlimited number of words', async () => {
      render(<AddLanguageCardForm {...{ isMain: true, user: mockUser, activity: mockActivity }} />)

      const selectCardTypeFormSelect = document.querySelector('#cardTypeSelect') as Element
      const uploadFileForm = (await screen.findByTestId('upload-form')) as HTMLInputElement
      const outcomeMsg = await screen.findByTestId('outcome-message')

      // Switch 1st dropdown to Vocab card
      await act(async () => {
        fireEvent.change(selectCardTypeFormSelect, { target: { value: 'Vocab card' } })
      })

      // Select Upload File from dropdown
      const selectInputTypeSelect = document.querySelector('#listInputMethod') as Element
      await act(async () => {
        fireEvent.change(selectInputTypeSelect, { target: { value: 'Upload file' } })
      })
      expect(uploadFileForm).not.toHaveClass('hidden')

      // Upload text file
      const file = new File(
        ['cat, man, dog, house, mother, father, brother, sister, fruits, vegetables, chicken'],
        'foo.txt',
        { type: 'text/plain' }
      )
      file.text = jest.fn(() =>
        Promise.resolve(
          'cat, man, dog, house, mother, father, brother, sister, fruits, vegetables, chicken'
        )
      )
      await act(async () => {
        await fireEvent.input(uploadFileForm, { target: { files: [file] } })
      })
      expect(await uploadFileForm.files?.[0].text()).toEqual(
        'cat, man, dog, house, mother, father, brother, sister, fruits, vegetables, chicken'
      )

      expect(outcomeMsg).not.toHaveTextContent(
        'Oops, your uploaded list has more than 10 words! Please remove 1 word.'
      )
    })

    it('should open popup with uploaded vocab list', async () => {
      render(
        <AddLanguageCardForm
          {...{ isMain: true, user: mockUser, activity: mockLanguageActivity }}
        />
      )
      ;(createCards as jest.Mock).mockImplementationOnce(() => {
        return Promise.resolve({
          status: 200,
          data: { message: 'Cards added', details: [{ ...mockUserLanguageVocabCard }] },
        })
      })

      const selectCardTypeFormSelect = document.querySelector('#cardTypeSelect') as Element
      const uploadFileForm = (await screen.findByTestId('upload-form')) as HTMLInputElement
      const validateUploadBtn = await screen.findByTestId('add-upload-cards-val-button')

      await expect(screen.queryByTestId('validate-popup')).toBeNull()

      // Switch 1st dropdown to Vocab card
      await act(async () => {
        fireEvent.change(selectCardTypeFormSelect, { target: { value: 'Vocab card' } })
      })

      // Select Upload File from dropdown
      const selectInputTypeSelect = document.querySelector('#listInputMethod') as Element
      await act(async () => {
        fireEvent.change(selectInputTypeSelect, { target: { value: 'Upload file' } })
      })
      expect(uploadFileForm).not.toHaveClass('hidden')

      // Upload text file
      const file = new File(['cat, man, dog, , cat,'], 'foo.txt', { type: 'text/plain' })
      file.text = jest.fn(() => Promise.resolve('cat, man, dog, , cat,'))
      await act(async () => {
        await fireEvent.input(uploadFileForm, { target: { files: [file] } })
      })
      expect(await uploadFileForm.files?.[0].text()).toEqual('cat, man, dog, , cat,')

      // Validate list
      await act(async () => {
        fireEvent.click(validateUploadBtn)
      })

      await expect(screen.queryByTestId('validate-popup')).not.toBeNull()
      await expect(screen.queryByTestId('validate-popup')).toHaveTextContent('cat, man, dog')

      const popupYesButton = await screen.findByTestId('validate-btn')

      await act(async () => {
        await fireEvent.click(popupYesButton)
      })

      await expect(screen.queryByTestId('validate-popup')).toHaveAttribute('hidden')
    })

    it('should remove uploaded file as expected', async () => {
      render(<AddLanguageCardForm {...{ isMain: true, user: mockUser, activity: mockActivity }} />)

      const selectCardTypeFormSelect = document.querySelector('#cardTypeSelect') as Element
      const uploadFileForm = (await screen.findByTestId('upload-form')) as HTMLInputElement
      const validateUploadBtn = await screen.findByTestId('add-upload-cards-val-button')
      const outcomeMsg = await screen.findByTestId('outcome-message')
      const removeUploadBtn = await screen.findByTestId('remove-upload-btn')

      await expect(screen.queryByTestId('validate-popup')).toBeNull()

      // Switch 1st dropdown to Vocab card
      await act(async () => {
        fireEvent.change(selectCardTypeFormSelect, { target: { value: 'Vocab card' } })
      })

      // Select Upload File from dropdown
      const selectInputTypeSelect = document.querySelector('#listInputMethod') as Element
      await act(async () => {
        fireEvent.change(selectInputTypeSelect, { target: { value: 'Upload file' } })
      })
      expect(uploadFileForm).not.toHaveClass('hidden')

      // Upload text file
      const file = new File(['cat, man, dog, , cat,'], 'foo.txt', { type: 'text/plain' })
      file.text = jest.fn(() => Promise.resolve('cat, man, dog, , cat,'))

      await act(async () => {
        await fireEvent.input(uploadFileForm, { target: { files: [file] } })
      })
      expect(await uploadFileForm.files?.[0].text()).toEqual('cat, man, dog, , cat,')
      expect(uploadFileForm.files?.[0].name).toEqual('foo.txt')

      await act(async () => {
        fireEvent.click(removeUploadBtn)
      })

      // Validate list
      await act(async () => {
        fireEvent.click(validateUploadBtn)
      })

      await expect(screen.queryByTestId('validate-popup')).toBeNull()
      expect(outcomeMsg).toHaveTextContent('Oops, you are trying to validate an empty list')
    })

    it('should not allow upload of non-text file', async () => {
      render(<AddLanguageCardForm {...{ isMain: true, user: mockUser, activity: mockActivity }} />)

      const selectCardTypeFormSelect = document.querySelector('#cardTypeSelect') as Element
      const uploadFileForm = (await screen.findByTestId('upload-form')) as HTMLInputElement
      const outcomeMsg = await screen.findByTestId('outcome-message')

      await expect(screen.queryByTestId('validate-popup')).toBeNull()

      // Switch 1st dropdown to Vocab card
      await act(async () => {
        fireEvent.change(selectCardTypeFormSelect, { target: { value: 'Vocab card' } })
      })

      // Select Upload File from dropdown
      const selectInputTypeSelect = document.querySelector('#listInputMethod') as Element
      await act(async () => {
        fireEvent.change(selectInputTypeSelect, { target: { value: 'Upload file' } })
      })
      expect(uploadFileForm).not.toHaveClass('hidden')

      // Upload image file
      const file = new File(['cat, man, dog, , cat,'], 'foo.png', { type: 'image/png' })
      file.text = jest.fn(() => Promise.resolve('cat, man, dog, , cat,'))

      await act(async () => {
        await fireEvent.input(uploadFileForm, { target: { files: [file] } })
      })

      expect(outcomeMsg).toHaveTextContent('The file uploaded is not a text (.txt) file.')
    })

    describe('Submitting', () => {
      it('should submit with expected list', async () => {
        const houseUserCards = [{ ...mockUserLanguageVocabCard }]
        const catUserCards = [
          { ...mockUserLanguageVocabCard, cardId: `${btoa('arabic-vocab-cat')}` },
        ]

        const expectedReturnedCards = [...houseUserCards, ...catUserCards]
        const expectedControllerPayload = {
          userId: `${btoa('mock.user@email.com')}`,
          activity: 'Arabic-Language',
          cards: [...houseUserCards, ...catUserCards],
        }

        ;(createCards as jest.Mock).mockImplementationOnce(() => {
          return Promise.resolve({
            status: 200,
            data: { message: 'Cards added', details: expectedReturnedCards },
          })
        })

        render(
          <AddLanguageCardForm
            {...{ isMain: true, user: mockUser, activity: mockLanguageActivity }}
          />
        )

        const selectCardTypeFormSelect = document.querySelector('#cardTypeSelect') as Element
        const uploadFileForm = (await screen.findByTestId('upload-form')) as HTMLInputElement
        const validateUploadBtn = await screen.findByTestId('add-upload-cards-val-button')

        // Switch 1st dropdown to Vocab card
        await act(async () => {
          fireEvent.change(selectCardTypeFormSelect, { target: { value: 'Vocab card' } })
        })

        // Select Upload File from dropdown
        const selectInputTypeSelect = document.querySelector('#listInputMethod') as Element
        await act(async () => {
          fireEvent.change(selectInputTypeSelect, { target: { value: 'Upload file' } })
        })

        // Upload text file
        const file = new File(['house, cat'], 'foo.txt', { type: 'text/plain' })
        file.text = jest.fn(() => Promise.resolve('house, cat'))
        await act(async () => {
          await fireEvent.input(uploadFileForm, { target: { files: [file] } })
        })

        // Validate list
        await act(async () => {
          fireEvent.click(validateUploadBtn)
        })

        const popupYesBtn = await screen.findByTestId('validate-btn')

        await act(async () => {
          await fireEvent.click(popupYesBtn)
        })

        expect(createCards).toHaveBeenCalledWith(expectedControllerPayload)
      })
    })
  })

  describe('Submitting errors', () => {
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

      render(
        <AddLanguageCardForm
          {...{ isMain: true, user: mockUser, activity: mockLanguageActivity }}
        />
      )

      const selectCardTypeFormSelect = document.querySelector('#cardTypeSelect') as Element
      const uploadFileForm = (await screen.findByTestId('upload-form')) as HTMLInputElement
      const validateUploadBtn = await screen.findByTestId('add-upload-cards-val-button')

      // Switch 1st dropdown to Vocab card
      await act(async () => {
        fireEvent.change(selectCardTypeFormSelect, { target: { value: 'Vocab card' } })
      })

      // Select Upload File from dropdown
      const selectInputTypeSelect = document.querySelector('#listInputMethod') as Element
      await act(async () => {
        fireEvent.change(selectInputTypeSelect, { target: { value: 'Upload file' } })
      })

      // Upload text file
      const file = new File(['cat, man, dog, , cat,'], 'foo.txt', { type: 'text/plain' })
      file.text = jest.fn(() => Promise.resolve('cat, man, dog, , cat,'))
      await act(async () => {
        await fireEvent.input(uploadFileForm, { target: { files: [file] } })
      })

      // Validate list
      await act(async () => {
        fireEvent.click(validateUploadBtn)
      })

      const popupYesBtn = await screen.findByTestId('validate-btn')

      await act(async () => {
        await fireEvent.click(popupYesBtn)
      })

      const errorMessage = await screen.findByText(/Erroneous response/i)
      expect(errorMessage).toBeInTheDocument()
    })

    it('should not reset form when response is 500 and display error message', async () => {
      const error = {
        response: { status: 500, data: { status: 'internalServerError', message: 'Server error' } },
      }
      ;(createCards as jest.Mock).mockImplementationOnce(() => {
        return Promise.reject(error)
      })

      render(
        <AddLanguageCardForm
          {...{ isMain: true, user: mockUser, activity: mockLanguageActivity }}
        />
      )

      const selectCardTypeFormSelect = document.querySelector('#cardTypeSelect') as Element
      const uploadFileForm = (await screen.findByTestId('upload-form')) as HTMLInputElement
      const validateUploadBtn = await screen.findByTestId('add-upload-cards-val-button')

      // Switch 1st dropdown to Vocab card
      await act(async () => {
        fireEvent.change(selectCardTypeFormSelect, { target: { value: 'Vocab card' } })
      })

      // Select Upload File from dropdown
      const selectInputTypeSelect = document.querySelector('#listInputMethod') as Element
      await act(async () => {
        fireEvent.change(selectInputTypeSelect, { target: { value: 'Upload file' } })
      })

      // Upload text file
      const file = new File(['cat, man, dog, , cat,'], 'foo.txt', { type: 'text/plain' })
      file.text = jest.fn(() => Promise.resolve('cat, man, dog, , cat,'))
      await act(async () => {
        await fireEvent.input(uploadFileForm, { target: { files: [file] } })
      })

      // Validate list
      await act(async () => {
        fireEvent.click(validateUploadBtn)
      })

      const popupYesBtn = await screen.findByTestId('validate-btn')

      await act(async () => {
        await fireEvent.click(popupYesBtn)
      })

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

      render(
        <AddLanguageCardForm
          {...{ isMain: true, user: mockUser, activity: mockLanguageActivity }}
        />
      )

      const selectCardTypeFormSelect = document.querySelector('#cardTypeSelect') as Element
      const uploadFileForm = (await screen.findByTestId('upload-form')) as HTMLInputElement
      const validateUploadBtn = await screen.findByTestId('add-upload-cards-val-button')

      // Switch 1st dropdown to Vocab card
      await act(async () => {
        fireEvent.change(selectCardTypeFormSelect, { target: { value: 'Vocab card' } })
      })

      // Select Upload File from dropdown
      const selectInputTypeSelect = document.querySelector('#listInputMethod') as Element
      await act(async () => {
        fireEvent.change(selectInputTypeSelect, { target: { value: 'Upload file' } })
      })

      // Upload text file
      const file = new File(['cat, man, dog, , cat,'], 'foo.txt', { type: 'text/plain' })
      file.text = jest.fn(() => Promise.resolve('cat, man, dog, , cat,'))
      await act(async () => {
        await fireEvent.input(uploadFileForm, { target: { files: [file] } })
      })

      // Validate list
      await act(async () => {
        fireEvent.click(validateUploadBtn)
      })

      const popupYesBtn = await screen.findByTestId('validate-btn')

      await act(async () => {
        await fireEvent.click(popupYesBtn)
      })

      const errorMessage = await screen.getByText(/Server is down. Try again later./i)
      expect(errorMessage).toBeInTheDocument()
      expect(console.log).toHaveBeenCalledWith({ status: 500, message: 'Error thrown and caught.' })
    })
  })
})
