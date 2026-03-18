import Popup, { PopupConfig } from '../../../components/popups/popup'
import '@testing-library/jest-dom'
import { render } from '../../util'
import * as React from 'react'
import { mockUser, mockStudent, mockActivity, mockUserCard } from '../../../specs/mocks'

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn(), warning: jest.fn(), info: jest.fn() },
}))
jest.mock('../../../api/controller')
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ data: null })),
  signOut: jest.fn(),
}))

describe('Popup', () => {
  const onClose = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render DeleteAccountPopup for deleteAccount config', () => {
    const config: PopupConfig = { type: 'deleteAccount', user: mockUser }
    render(<Popup showModal={true} config={config} onClose={onClose} />)
    const popup = document.querySelector('#popup-modal')
    expect(popup).toBeInTheDocument()
    expect(popup).toHaveTextContent('Are you sure you want to delete this account forever?')
  })

  it('should render LinkAccountPopup for addStudent config', () => {
    const config: PopupConfig = { type: 'addStudent', user: mockUser, newStudent: mockStudent }
    render(<Popup showModal={true} config={config} onClose={onClose} />)
    const popup = document.querySelector('[data-testid="link-account-popup"]')
    expect(popup).toBeInTheDocument()
  })

  it('should render UnlinkAccountPopup for removeStudent config', () => {
    const config: PopupConfig = {
      type: 'removeStudent',
      user: mockStudent,
      teacherId: mockUser.userId!,
    }
    render(<Popup showModal={true} config={config} onClose={onClose} />)
    const popup = document.querySelector('[data-testid="unlink-account-popup"]')
    expect(popup).toBeInTheDocument()
  })

  it('should render DeleteActivityPopup for removeActivity config', () => {
    const config: PopupConfig = {
      type: 'removeActivity',
      user: mockUser,
      item: { activityName: 'Quran' },
    }
    render(<Popup showModal={true} config={config} onClose={onClose} />)
    const popup = document.querySelector('[data-testid="delete-activity-popup"]')
    expect(popup).toBeInTheDocument()
  })

  it('should render ManageCardPopup for manageCard config', () => {
    const config: PopupConfig = {
      type: 'manageCard',
      isMain: true,
      user: mockUser,
      activity: mockActivity,
      item: { card: mockUserCard, action: 'show' },
    }
    render(<Popup showModal={true} config={config} onClose={onClose} />)
    const popup = document.querySelector('[data-testid="manage-card-popup-show"]')
    expect(popup).toBeInTheDocument()
  })

  it('should render ValidatePopup for validate config', () => {
    const config: PopupConfig = {
      type: 'validate',
      item: { list: 'item1, item2' },
      submitList: jest.fn(),
    }
    render(<Popup showModal={true} config={config} onClose={onClose} />)
    const popup = document.querySelector('[data-testid="validate-popup"]')
    expect(popup).toBeInTheDocument()
  })

  it('should hide popup content when showModal is false', () => {
    const config: PopupConfig = { type: 'deleteAccount', user: mockUser }
    render(<Popup showModal={false} config={config} onClose={onClose} />)
    const popup = document.querySelector('#popup-modal')
    expect(popup).toHaveAttribute('hidden')
  })
})
