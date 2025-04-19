import UserProfile from '../../../../../app/[username]/profile/components/user-profile';
import { mockUser } from '../../../../mocks';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react'
import { render } from '../../../../util';
import * as React from 'react';

describe('User profile', () => {
  it('should display profile as expected', async () => {
    const user = {
      ...mockUser,
      lastLogin: '5/31/2024',
      linkedAccountsData: {
        students: [[btoa('mock.student@email.com'), 'student1'], [btoa('mock.student2@email.com'), 'student2']]
      }
    }
    render(<UserProfile {...{user}} />)

    const firstName = await screen.findByTestId("profile-first");
    const lastName = await screen.findByTestId("profile-last");
    const email = await screen.findByTestId("profile-email");
    const accountType = await screen.findByTestId("profile-accountType");
    const linked = await screen.findByTestId("profile-linkedAccounts");
    const loginDate = await screen.findByTestId("profile-login");
  
    expect(firstName).toHaveTextContent('mock')
    expect(lastName).toHaveTextContent('user')
    expect(email).toHaveTextContent('mock.user@email.com')
    expect(accountType).toHaveTextContent('teacher')
    expect(linked).toHaveTextContent('student1, student2 (students)')
    expect(loginDate).toHaveTextContent('5/31/2024')
  })
})
