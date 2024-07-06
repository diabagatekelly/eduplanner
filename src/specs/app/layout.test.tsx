import RootLayout from '../../app/layout';
import Home from '../../app/page';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { render } from '../util';
import * as React from 'react';

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
  it('should render as expected', async () => {
    render(<RootLayout {...{children: <Home />}}/>)
    const homeContent = await screen.getByTestId('home')
    expect(homeContent).toBeInTheDocument()
  })
})