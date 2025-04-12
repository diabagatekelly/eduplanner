import RootLayout from '../../app/layout';
import Home from '../../app/page';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import * as React from 'react';
import {act} from 'react';

jest.mock('next/navigation', () => {
  return {
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
    })),
    usePathname: jest.fn(),
    useSearchParams: jest.fn()
  }
});

describe('Root layout', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render as expected', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => null)
    await act(async () => {
      render(<RootLayout {...{children: <Home />}}/>)
    })
    expect(await screen.findByTestId('home')).toBeInTheDocument()
  })
})