import ValidatePopup from '../../../components/popups/validatePopup'
import '@testing-library/jest-dom'
import { screen, fireEvent, act } from '@testing-library/react'
import { render } from '../../util'
import * as React from 'react'

describe('Validate Popup', () => {
  it('should display content as expected', async () => {
    const childArgs = { item: { list: 'man, cat, dog' } }
    let showModal
    let onClose = () => {
      showModal = false
    }
    render(<ValidatePopup {...{ onClose, showModal: true, ...childArgs }} />)

    const heading = await screen.findByRole('heading', { level: 3 })
    const listOfCards = await screen.findByRole('heading', { level: 5 })

    expect(heading).toHaveTextContent('Is this the correct list of cards you want to create?')
    expect(listOfCards).toHaveTextContent('man, cat, dog')
  })

  it('should validate and close when button in clicked as expected', async () => {
    let showModal
    const onClose = jest.fn().mockImplementation(() => (showModal = false))
    const setFormSubmitOutcomeMessage = jest.fn().mockImplementation(() => '')
    const submitList = jest.fn().mockImplementation(() => null)

    const childArgs = { item: { list: 'man, cat, dog' }, setFormSubmitOutcomeMessage, submitList }
    render(<ValidatePopup {...{ onClose, showModal: true, ...childArgs }} />)

    const submitYesButton = screen.getByTestId('validate-btn')

    await act(async () => {
      await fireEvent.click(submitYesButton)
    })

    expect(submitList).toHaveBeenCalledWith('man, cat, dog')
    expect(setFormSubmitOutcomeMessage).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })
})
