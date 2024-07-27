import AddCard from '../../../components/cards/add-card';
import '@testing-library/jest-dom'
import { screen } from '@testing-library/react'
import { render } from '../../util';
import * as React from 'react';
import { mockActivity, mockUser } from '../../mocks';

jest.mock('next/navigation', () => {
  return {
    usePathname: jest.fn()
  }
});

describe('Add card', () => {
  it('should display AddQuranCardForm when pathname includes activities/Quran', async () => {
    jest.spyOn(require('next/navigation'), 'usePathname').mockImplementation(() => '/activities/Quran');
    render(<AddCard {...{isMain: true, userDetails: mockUser, activity: mockActivity}} />)
    const addQuranCardForm = await screen.getByTestId('addQuranCardForm')

    expect(addQuranCardForm).toBeInTheDocument()
  })

  it('should display AddLanguageCardForm when pathname includes Language', async () => {
    jest.spyOn(require('next/navigation'), 'usePathname').mockImplementation(() => '/activities/Arabic-Language');
    render(<AddCard {...{isMain: true, userDetails: mockUser, activity: mockActivity}} />)
    const addLanguageCardForm = await screen.getByTestId('add-language-card-form')

    expect(addLanguageCardForm).toBeInTheDocument()
  })
})