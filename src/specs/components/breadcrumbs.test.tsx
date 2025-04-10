import Breadcrumbs from '../../components/breadcrumbs'
import '@testing-library/jest-dom'
import { act, fireEvent, screen } from '@testing-library/react'
import { render } from '../util';
import * as React from 'react';
import { mockLanguageActivity, mockUser } from '../mocks';

jest.mock('next/navigation', () => {
  return {
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn()
    })),
    useParams: jest.fn(() => {
      return {
        username: mockUser.username,
        activity: mockLanguageActivity.name,
        student: 'Yusuf-Spencer'
      }
    }),
    usePathname: jest.fn(() => `root/${mockUser.username}`)
  }
});

describe('Breadcrumbs', () => {
  describe('Home', () => {
    it('should display "Home" breadcrumbs and navigate as expected', async () => {
      jest.spyOn(require('next/navigation'), 'usePathname').mockImplementation(() => `root/${mockUser.username}`)
      render(<Breadcrumbs />)

      const breadcrumbsHome = await screen.findByTestId("breadcrumbs-Home")
      expect(breadcrumbsHome).toBeInTheDocument();
      expect(breadcrumbsHome).toHaveTextContent('Home');

      breadcrumbsHome.addEventListener("click", (e) => { 
        e.preventDefault(); 
        e.stopPropagation(); 
        const target = e.target as HTMLAnchorElement;
        const destination = target.getAttribute('href')
        expect(destination).toEqual('/')
      })

      await act(async () => {
        await fireEvent.click(breadcrumbsHome)
      })
    })
  })

  describe('Dashboard', () => {
    it('should display "Home" and "Dashboard" breadcrumbs and navigate as expected', async () => {
      jest.spyOn(require('next/navigation'), 'usePathname').mockImplementation(() => `root/${mockUser.username}/students`)
      render(<Breadcrumbs />)

      const breadcrumbsHome = await screen.findByTestId("breadcrumbs-Home")
      const breadcrumbsDashboard = await screen.findByTestId("breadcrumbs-Dashboard")
      
      expect(breadcrumbsHome).toBeInTheDocument();
      expect(breadcrumbsDashboard).toBeInTheDocument();

      expect(breadcrumbsDashboard).toHaveTextContent('Dashboard');

      breadcrumbsDashboard.addEventListener("click", (e) => { 
        e.preventDefault(); 
        e.stopPropagation(); 
        const target = e.target as HTMLAnchorElement;
        const destination = target.getAttribute('href')
        expect(destination).toEqual(`/${mockUser.username}`)
      })

      await act(async () => {
        await fireEvent.click(breadcrumbsDashboard)
      })
    })
  })
  describe('Main user activity', () => {
    it('should display "Home" and "Dashboard" and an activity in breadcrumbs', async () => {
      jest.spyOn(require('next/navigation'), 'usePathname').mockImplementation(() => `root/${mockUser.username}/activities/${mockLanguageActivity.name}`)
      render(<Breadcrumbs />)

      const breadcrumbsHome = await screen.findByTestId("breadcrumbs-Home")
      const breadcrumbsDashboard = await screen.findByTestId("breadcrumbs-Dashboard")
      const breadcrumbsActivity = await screen.findByTestId("breadcrumbs-Arabic-Language")

      expect(breadcrumbsHome).toBeInTheDocument();
      expect(breadcrumbsDashboard).toBeInTheDocument();
      expect(breadcrumbsActivity).toBeInTheDocument();

      expect(breadcrumbsActivity).toHaveTextContent('Arabic Language');
      expect(breadcrumbsActivity).not.toHaveAttribute('href');
    })
  })
  describe('Student', () => {
    describe('Student activities list', () => {
      it('should display "Home" and "Dashboard" and a student name in breadcrumbs', async () => {
        jest.spyOn(require('next/navigation'), 'usePathname').mockImplementation(() => `root/${mockUser.username}/students/Yusuf-Spencer`)
        render(<Breadcrumbs />)
  
        const breadcrumbsHome = await screen.findByTestId("breadcrumbs-Home")
        const breadcrumbsDashboard = await screen.findByTestId("breadcrumbs-Dashboard")
        const breadcrumbsStudent = await screen.findByTestId("breadcrumbs-Yusuf-Spencer")

        expect(breadcrumbsHome).toBeInTheDocument();
        expect(breadcrumbsDashboard).toBeInTheDocument();
        expect(breadcrumbsStudent).toBeInTheDocument();

        expect(breadcrumbsStudent).toHaveTextContent('Yusuf Spencer');
        expect(breadcrumbsStudent).not.toHaveAttribute('href');
      })
    })

    describe('Student activity', () => {
      it('should display "Home" and "Dashboard", "All student activities", and an activity in breadcrumbs', async () => {
        jest.spyOn(require('next/navigation'), 'usePathname').mockImplementation(() => `root/${mockUser.username}/students/Yusuf-Spencer/activities/${mockLanguageActivity.name}`)
        render(<Breadcrumbs />)
  
        const breadcrumbsHome = await screen.findByTestId("breadcrumbs-Home")
        const breadcrumbsDashboard = await screen.findByTestId("breadcrumbs-Dashboard")
        const breadcrumbsStudentActivities = await screen.findByTestId("breadcrumbs-All Yusuf-Spencer's Activities")
        const breadcrumbsStudentActivity = await screen.findByTestId("breadcrumbs-Arabic-Language")
        
        expect(breadcrumbsHome).toBeInTheDocument();
        expect(breadcrumbsDashboard).toBeInTheDocument();
        expect(breadcrumbsStudentActivities).toBeInTheDocument();
        expect(breadcrumbsStudentActivity).toBeInTheDocument();

        expect(breadcrumbsStudentActivities).toHaveTextContent("All Yusuf Spencer's Activities");
        expect(breadcrumbsStudentActivity).toHaveTextContent('Arabic Language');

        expect(breadcrumbsStudentActivity).not.toHaveAttribute('href');

        breadcrumbsStudentActivities.addEventListener("click", (e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
          const target = e.target as HTMLAnchorElement;
          const destination = target.getAttribute('href')
          expect(destination).toEqual(`/${mockUser.username}/students/Yusuf-Spencer`)
        })
  
        await act(async () => {
          await fireEvent.click(breadcrumbsStudentActivities)
        })

      })
    })
  })
})