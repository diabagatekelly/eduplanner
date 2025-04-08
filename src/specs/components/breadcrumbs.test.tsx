import Breadcrumbs from '../../components/breadcrumbs'
import '@testing-library/jest-dom'
import { act, fireEvent, screen } from '@testing-library/react'
import { render } from '../util';
import * as React from 'react';
import { mockActivity, mockUser } from '../mocks';

jest.mock('next/navigation', () => {
  return {
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn()
    })),
    useParams: jest.fn(() => {
      return {
        username: mockUser.username,
        activity: mockActivity.name,
        student: 'Yusuf'
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
      jest.spyOn(require('next/navigation'), 'usePathname').mockImplementation(() => `root/${mockUser.username}/activities/Quran`)
      render(<Breadcrumbs />)

      const breadcrumbsHome = await screen.findByTestId("breadcrumbs-Home")
      const breadcrumbsDashboard = await screen.findByTestId("breadcrumbs-Dashboard")
      const breadcrumbsActivity = await screen.findByTestId("breadcrumbs-Quran")

      expect(breadcrumbsHome).toBeInTheDocument();
      expect(breadcrumbsDashboard).toBeInTheDocument();
      expect(breadcrumbsActivity).toBeInTheDocument();

      expect(breadcrumbsActivity).toHaveTextContent('Quran');
      expect(breadcrumbsActivity).not.toHaveAttribute('href');
    })
  })
  describe('Student', () => {
    describe('Student activities list', () => {
      it('should display "Home" and "Dashboard" and a student name in breadcrumbs', async () => {
        jest.spyOn(require('next/navigation'), 'usePathname').mockImplementation(() => `root/${mockUser.username}/students/Yusuf`)
        render(<Breadcrumbs />)
  
        const breadcrumbsHome = await screen.findByTestId("breadcrumbs-Home")
        const breadcrumbsDashboard = await screen.findByTestId("breadcrumbs-Dashboard")
        const breadcrumbsStudent = await screen.findByTestId("breadcrumbs-Yusuf")

        expect(breadcrumbsHome).toBeInTheDocument();
        expect(breadcrumbsDashboard).toBeInTheDocument();
        expect(breadcrumbsStudent).toBeInTheDocument();

        expect(breadcrumbsStudent).toHaveTextContent('Yusuf');
        expect(breadcrumbsStudent).not.toHaveAttribute('href');
      })
    })

    describe('Student activity', () => {
      it('should display "Home" and "Dashboard", "All student activities", and an activity in breadcrumbs', async () => {
        jest.spyOn(require('next/navigation'), 'usePathname').mockImplementation(() => `root/${mockUser.username}/students/Yusuf/activities/Quran`)
        render(<Breadcrumbs />)
  
        const breadcrumbsHome = await screen.findByTestId("breadcrumbs-Home")
        const breadcrumbsDashboard = await screen.findByTestId("breadcrumbs-Dashboard")
        const breadcrumbsStudentActivities = await screen.findByTestId("breadcrumbs-All Yusuf activities")
        const breadcrumbsStudentActivity = await screen.findByTestId("breadcrumbs-Quran")
        
        expect(breadcrumbsHome).toBeInTheDocument();
        expect(breadcrumbsDashboard).toBeInTheDocument();
        expect(breadcrumbsStudentActivities).toBeInTheDocument();
        expect(breadcrumbsStudentActivity).toBeInTheDocument();

        expect(breadcrumbsStudentActivities).toHaveTextContent('All Yusuf activities');
        expect(breadcrumbsStudentActivity).toHaveTextContent('Quran');

        expect(breadcrumbsStudentActivity).not.toHaveAttribute('href');

        breadcrumbsStudentActivities.addEventListener("click", (e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
          const target = e.target as HTMLAnchorElement;
          const destination = target.getAttribute('href')
          expect(destination).toEqual(`/${mockUser.username}/students/Yusuf`)
        })
  
        await act(async () => {
          await fireEvent.click(breadcrumbsStudentActivities)
        })

      })
    })
  })
})