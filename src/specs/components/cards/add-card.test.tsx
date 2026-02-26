import AddCard from '../../../components/cards/add-card'
import '@testing-library/jest-dom'
import { screen } from '@testing-library/react'
import { render } from '../../util'
import * as React from 'react'
import { mockActivity, mockUser } from '../../mocks'

jest.mock('next/navigation', () => {
  return {
    usePathname: jest.fn(),
  }
})

describe('Add card', () => {
  it('should display AddQuranCardForm when pathname includes activities/Quran', async () => {
    jest
      .spyOn(require('next/navigation'), 'usePathname')
      .mockImplementation(() => '/activities/Quran')
    render(<AddCard {...{ isMain: true, userDetails: mockUser, activity: mockActivity }} />)
    const addQuranCardForm = await screen.getByTestId('addQuranCardForm')

    expect(addQuranCardForm).toBeInTheDocument()
    expect(await screen.queryByTestId('add-language-card-form')).not.toBeInTheDocument()
    expect(await screen.queryByTestId('add-misc-card-form')).not.toBeInTheDocument()
  })

  it('should display AddLanguageCardForm when pathname includes Language', async () => {
    jest
      .spyOn(require('next/navigation'), 'usePathname')
      .mockImplementation(() => '/activities/Arabic-Language')
    render(<AddCard {...{ isMain: true, userDetails: mockUser, activity: mockActivity }} />)
    const addLanguageCardForm = await screen.getByTestId('add-language-card-form')

    expect(addLanguageCardForm).toBeInTheDocument()
    expect(await screen.queryByTestId('addQuranCardForm')).not.toBeInTheDocument()
    expect(await screen.queryByTestId('add-misc-card-form')).not.toBeInTheDocument()
  })

  it('should display AddMiscCardForm when pathname does not includes Language and is not Quran', async () => {
    jest
      .spyOn(require('next/navigation'), 'usePathname')
      .mockImplementation(() => '/activities/Cooking')
    render(<AddCard {...{ isMain: true, userDetails: mockUser, activity: mockActivity }} />)
    const addMiscCardForm = await screen.getByTestId('add-misc-card-form')

    expect(addMiscCardForm).toBeInTheDocument()
    expect(await screen.queryByTestId('addQuranCardForm')).not.toBeInTheDocument()
    expect(await screen.queryByTestId('add-language-card-form')).not.toBeInTheDocument()
  })
})
