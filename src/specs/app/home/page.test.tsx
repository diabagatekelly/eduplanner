import Home from '../../../app/home/page'
import '@testing-library/jest-dom'
import { screen } from '@testing-library/react'
import { render } from '../../util'
import * as React from 'react'

describe('Home', () => {
  it('should display homepage', async () => {
    render(<Home />)
    const homePageTxt = await screen.findByTestId('home')
    expect(homePageTxt).toBeInTheDocument()
  })
})
