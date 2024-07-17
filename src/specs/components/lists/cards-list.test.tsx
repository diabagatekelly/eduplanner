import CardsList from '../../../components/lists/cards-list'
import '@testing-library/jest-dom';
import { screen, fireEvent, act } from '@testing-library/react'
import { render } from '../../util';
import * as React from 'react';
import { mockActivity, mockStudent, mockUser, mockUserCard } from '../../mocks';
import { CompletionStatus } from '../../../interfaces/CompletionStatusEnum';

jest.mock('../../../utils/useMounted', () => {
  return {
    useMounted: jest.fn()
      .mockImplementationOnce(() => false)
      .mockImplementationOnce(() => false)
      .mockImplementation(() => true)
  }
})
jest.mock('../../../api/controller');

const hash = global.window.location.hash;
const activityNoCards = {...mockActivity};
const activityWithReviewCards = {...mockActivity, cards: [{...mockUserCard, completionStatus: CompletionStatus.REVIEW}]}
const activityWithMultipleReviewCards = {...mockActivity, cards: [{...mockUserCard, completionStatus: CompletionStatus.REVIEW}, {...mockUserCard, completionStatus: CompletionStatus.REVIEW, cardId: `${btoa('surah-109-name-Naas-juz-30')}`}]}
const activityWithInactiveCards = {...mockActivity, cards: [{...mockUserCard, completionStatus: CompletionStatus.INACTIVE}]}
const activityWithCompletedCards = {...mockActivity, cards: [{...mockUserCard, completionStatus: CompletionStatus.COMPLETED}]}
const activityWithPendingAddedToday = {...mockActivity, cards: [{...mockUserCard, completionStatus: CompletionStatus.PENDING, addedOn: '2/3/2024', cardId: `${btoa('juz-30')}`}]}
const activityWithPendingShowDate = {...mockActivity, cards: [{...mockUserCard, completionStatus: CompletionStatus.PENDING, addedOn: '2/1/2024', nextShowDate: '2/3/2024', cardId: `${btoa('custom-Furqan 1 to 2')}`}]}


describe('Cards List', () => {
  beforeAll(() => {
    Object.defineProperty(global.window, 'location', {
      value: { hash: null }
    });
  })

  afterAll(() => {
    global.window.location.hash = hash;
  })

  describe('Not mounted', () => {    
    beforeEach(() => {
      sessionStorage.setItem("user_data", JSON.stringify({...mockUser, activities: activityWithReviewCards}))
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2/3/2024'))
    })

    afterEach(() => {
      jest.clearAllMocks()
      jest.useRealTimers()
      sessionStorage.clear()
    })

    it('should display no list due to not mounted', async () => {
      window.location.hash = '';
      render(<CardsList {...{isMain: true, userDetails: mockUser, activity: activityWithReviewCards}} />)
      
      const message = document.querySelector('.today-page-title')
      expect(message).not.toBeInTheDocument()
    })

  })

  describe('Mounted', () => {
    describe('Teacher', () => {
      describe('Cards of the day', () => {
        describe('No cards of the day', () => {
          beforeEach(() => {
            sessionStorage.setItem("user_data", JSON.stringify({...mockUser, activities: activityNoCards}))
            jest.useFakeTimers()
            jest.setSystemTime(new Date('2/3/2024'))
          })
  
          afterEach(() => {
            jest.clearAllMocks()
            jest.useRealTimers()
            sessionStorage.clear()
          })
  
          it('should display no list', async () => {
            window.location.hash = '';
            render(<CardsList {...{isMain: true, userDetails: mockUser, activity: activityNoCards}} />)
            
            const message = await screen.findByTestId("no-cards-msg")
            expect(message).toBeInTheDocument()
            expect(message).toHaveTextContent(/You have no cards to review today./)
          })
        })
  
        describe('Some cards of the today', () => {
          beforeEach(() => {
            jest.useFakeTimers()
            jest.setSystemTime(new Date('2/3/2024'))
          })
  
          afterEach(() => {
            jest.clearAllMocks()
            jest.useRealTimers()
            sessionStorage.clear()
          })
  
          it('should display review cards today', async () => {
            window.location.hash = '';
            sessionStorage.setItem("user_data", JSON.stringify({...mockUser, activities: activityWithMultipleReviewCards}))
            render(<CardsList {...{isMain: true, userDetails: mockUser, activity: activityWithMultipleReviewCards}} />)
            
            const reviewCards = await screen.findAllByTestId("list-today-cards");
            const reviewCardName = await screen.findAllByTestId("today-card-name");
            const showBtn = await screen.findAllByTestId("today-card-show-btn");

            expect(reviewCards[1]).toBeInTheDocument();
            expect(reviewCardName[1]).toHaveTextContent('Surah 114: Naas');
            expect(showBtn[1]).not.toHaveClass('hidden');

            await act(async () => {
              await fireEvent.click(showBtn[1])
            })

            const manageCardPopup = screen.getByTestId('manage-card-popup-show');
            expect(manageCardPopup).toBeVisible()
          
            const closemanageCardPopupBtn = screen.getByTestId("manage-card-popup-close-btn")
            await act(async () => {
              await fireEvent.click(closemanageCardPopupBtn)
            })

            expect(manageCardPopup).not.toBeVisible()
          })
  
          it('should display pending cards added today', async () => {
            window.location.hash = '';
            sessionStorage.setItem("user_data", JSON.stringify({...mockUser, activities: activityWithPendingAddedToday}))
            render(<CardsList {...{isMain: true, userDetails: mockUser, activity: activityWithPendingAddedToday}} />)
            
            const reviewCards = await screen.findByTestId("list-today-cards");
            const reviewCardName = await screen.findByTestId("today-card-name");
            const editBtn = await screen.findByTestId("today-card-edit-btn");
            expect(reviewCards).toBeInTheDocument()
            expect(reviewCardName).toHaveTextContent('Juz 30')
            expect(editBtn).not.toHaveClass('hidden');

            await act(async () => {
              await fireEvent.click(editBtn)
            })

            const manageCardPopup = screen.getByTestId('manage-card-popup-edit');
            expect(manageCardPopup).toBeVisible()
          
            const closemanageCardPopupBtn = screen.getByTestId("manage-card-popup-close-btn")
            await act(async () => {
              await fireEvent.click(closemanageCardPopupBtn)
            })

            expect(manageCardPopup).not.toBeVisible()
          })
  
          it('should display pending cards next show date today', async () => {
            window.location.hash = '';
            sessionStorage.setItem("user_data", JSON.stringify({...mockUser, activities: activityWithPendingShowDate}))
            render(<CardsList {...{isMain: true, userDetails: mockUser, activity: activityWithPendingShowDate}} />)
            
            const reviewCards = await screen.findByTestId("list-today-cards");
            const reviewCardName = await screen.findByTestId("today-card-name");
           
            const deleteBtn = await screen.findByTestId("today-card-delete-btn");
            expect(reviewCards).toBeInTheDocument()
            expect(reviewCardName).toHaveTextContent('Furqan 1 to 2')
            expect(deleteBtn).not.toHaveClass('hidden');

            await act(async () => {
              await fireEvent.click(deleteBtn)
            })

            const manageCardPopup = screen.getByTestId('manage-card-popup-delete');
            expect(manageCardPopup).toBeVisible()
          
            const closemanageCardPopupBtn = screen.getByTestId("manage-card-popup-close-btn")
            await act(async () => {
              await fireEvent.click(closemanageCardPopupBtn)
            })

            expect(manageCardPopup).not.toBeVisible()
          })
  
          it('should not display inactive cards today', async () => {
            window.location.hash = '';
            sessionStorage.setItem("user_data", JSON.stringify({...mockUser, activities: activityWithInactiveCards}))
            render(<CardsList {...{isMain: true, userDetails: mockUser, activity: activityWithInactiveCards}} />)
            
            const message = await screen.findByTestId("no-cards-msg")
            expect(message).toBeInTheDocument()
            expect(message).toHaveTextContent(/You have no cards to review today./)
          })
  
          it('should not display completed cards today', async () => {
            window.location.hash = '';
            sessionStorage.setItem("user_data", JSON.stringify({...mockUser, activities: activityWithCompletedCards}))
            render(<CardsList {...{isMain: true, userDetails: mockUser, activity: activityWithCompletedCards}} />)
            
            const message = await screen.findByTestId("no-cards-msg")
            expect(message).toBeInTheDocument()
            expect(message).toHaveTextContent(/You have no cards to review today./)
          })
        })
      })

      describe('Active cards', () => {
        describe('No active cards', () => {
          beforeEach(() => {
            sessionStorage.setItem("user_data", JSON.stringify({...mockUser, activities: activityNoCards}))
            jest.useFakeTimers()
            jest.setSystemTime(new Date('2/3/2024'))
          })
  
          afterEach(() => {
            jest.clearAllMocks()
            jest.useRealTimers()
            sessionStorage.clear()
          })
  
          it('should display no list', async () => {
            window.location.hash = '#active';
            render(<CardsList {...{isMain: true, userDetails: mockUser, activity: activityNoCards}} />)
            
            const message = await screen.findByTestId("no-cards-msg")
            expect(message).toBeInTheDocument()
            expect(message).toHaveTextContent(/You have no active cards./)
          })
        })
  
        describe('Some active cards', () => {
          beforeEach(() => {
            jest.useFakeTimers()
            jest.setSystemTime(new Date('2/3/2024'))
          })
  
          afterEach(() => {
            jest.clearAllMocks()
            jest.useRealTimers()
            sessionStorage.clear()
          })
  
          it('should display active cards', async () => {
            const activityWithReviewCards2 = {...mockActivity, cards: [{...mockUserCard, completionStatus: CompletionStatus.REVIEW, cardId: `${btoa('surah-1-name-Faatiha-juz-1')}`}]}
            window.location.hash = '#active';
            sessionStorage.setItem("user_data", JSON.stringify({...mockUser, activities: activityWithReviewCards2}))
            render(<CardsList {...{isMain: true, userDetails: mockUser, activity: activityWithReviewCards2}} />)
            
            const reviewCards = await screen.findByTestId("list-active-cards");
            const reviewCardName = await screen.findByTestId("active-card-name");
            const showBtn = await screen.findByTestId("active-card-show-btn");

            expect(reviewCards).toBeInTheDocument();
            expect(reviewCardName).toHaveTextContent('Surah 1: Faatiha');
            expect(showBtn).not.toHaveClass('hidden');

            await act(async () => {
              await fireEvent.click(showBtn)
            })

            const manageCardPopup = screen.getByTestId('manage-card-popup-show');
            expect(manageCardPopup).toBeVisible()
          
            const closemanageCardPopupBtn = screen.getByTestId("manage-card-popup-close-btn")
            await act(async () => {
              await fireEvent.click(closemanageCardPopupBtn)
            })

            expect(manageCardPopup).not.toBeVisible()
          })
  
          it('should display pending cards added today', async () => {
            window.location.hash = '#active';
            sessionStorage.setItem("user_data", JSON.stringify({...mockUser, activities: activityWithPendingAddedToday}))
            render(<CardsList {...{isMain: true, userDetails: mockUser, activity: activityWithPendingAddedToday}} />)
            
            const reviewCards = await screen.findByTestId("list-active-cards");
            const reviewCardName = await screen.findByTestId("active-card-name");
            const overrideBtn = await screen.findByTestId("active-card-override-btn");
            expect(reviewCards).toBeInTheDocument()
            expect(reviewCardName).toHaveTextContent('Juz 30')
            expect(overrideBtn).not.toHaveClass('hidden');

            await act(async () => {
              await fireEvent.click(overrideBtn)
            })

            const manageCardPopup = screen.getByTestId('manage-card-popup-override');
            expect(manageCardPopup).toBeVisible()
          
            const closemanageCardPopupBtn = screen.getByTestId("manage-card-popup-close-btn")
            await act(async () => {
              await fireEvent.click(closemanageCardPopupBtn)
            })

            expect(manageCardPopup).not.toBeVisible()
          })
  
          it('should display pending cards next show date active', async () => {
            window.location.hash = '#active';
            sessionStorage.setItem("user_data", JSON.stringify({...mockUser, activities: activityWithPendingShowDate}))
            render(<CardsList {...{isMain: true, userDetails: mockUser, activity: activityWithPendingShowDate}} />)
            
            const reviewCards = await screen.findByTestId("list-active-cards");
            const reviewCardName = await screen.findByTestId("active-card-name");
           
            const deleteBtn = await screen.findByTestId("active-card-delete-btn");
            expect(reviewCards).toBeInTheDocument()
            expect(reviewCardName).toHaveTextContent('Furqan 1 to 2')
            expect(deleteBtn).not.toHaveClass('hidden');

            await act(async () => {
              await fireEvent.click(deleteBtn)
            })

            const manageCardPopup = screen.getByTestId('manage-card-popup-delete');
            expect(manageCardPopup).toBeVisible()
          
            const closemanageCardPopupBtn = screen.getByTestId("manage-card-popup-close-btn")
            await act(async () => {
              await fireEvent.click(closemanageCardPopupBtn)
            })

            expect(manageCardPopup).not.toBeVisible()
          })
        })
      })

      describe('Inactive cards', () => {
        describe('No inactive cards', () => {
          beforeEach(() => {
            sessionStorage.setItem("user_data", JSON.stringify({...mockUser, activities: activityNoCards}))
            jest.useFakeTimers()
            jest.setSystemTime(new Date('2/3/2024'))
          })
  
          afterEach(() => {
            jest.clearAllMocks()
            jest.useRealTimers()
            sessionStorage.clear()
          })
  
          it('should display no list', async () => {
            window.location.hash = '#inactive';
            render(<CardsList {...{isMain: true, userDetails: mockUser, activity: activityNoCards}} />)
            
            const message = await screen.findByTestId("no-cards-msg")
            expect(message).toBeInTheDocument()
            expect(message).toHaveTextContent(/You have no inactive cards./)
          })
        })

        describe('Some inactive cards', () => {
          beforeEach(() => {
            jest.useFakeTimers()
            jest.setSystemTime(new Date('2/3/2024'))
          })
  
          afterEach(() => {
            jest.clearAllMocks()
            jest.useRealTimers()
            sessionStorage.clear()
          })
  
          it('should display active cards', async () => {
            const activityWithReviewCards2 = {...mockActivity, cards: [{...mockUserCard, completionStatus: CompletionStatus.INACTIVE, cardId: `${btoa('surah-1-name-Faatiha-juz-1')}`}]}
            window.location.hash = '#inactive';
            sessionStorage.setItem("user_data", JSON.stringify({...mockUser, activities: activityWithReviewCards2}))
            render(<CardsList {...{isMain: true, userDetails: mockUser, activity: activityWithReviewCards2}} />)
            
            const reviewCards = await screen.findByTestId("list-inactive-cards");
            const reviewCardName = await screen.findByTestId("inactive-card-name");
            const showBtn = await screen.findByTestId("inactive-card-show-btn");

            expect(reviewCards).toBeInTheDocument();
            expect(reviewCardName).toHaveTextContent('Surah 1: Faatiha');
            expect(showBtn).not.toHaveClass('hidden');

            await act(async () => {
              await fireEvent.click(showBtn)
            })

            const manageCardPopup = screen.getByTestId('manage-card-popup-show');
            expect(manageCardPopup).toBeVisible()
          
            const closemanageCardPopupBtn = screen.getByTestId("manage-card-popup-close-btn")
            await act(async () => {
              await fireEvent.click(closemanageCardPopupBtn)
            })

            expect(manageCardPopup).not.toBeVisible()
          })
  
          it('should display pending cards added today', async () => {
            window.location.hash = '#inactive';
            const inactiveCards = {...mockActivity, cards: [{...mockUserCard, completionStatus: CompletionStatus.INACTIVE, addedOn: '2/3/2024', cardId: `${btoa('juz-30')}`}]}
            sessionStorage.setItem("user_data", JSON.stringify({...mockUser, activities: inactiveCards}))
            render(<CardsList {...{isMain: true, userDetails: mockUser, activity: inactiveCards}} />)
            
            const reviewCards = await screen.findByTestId("list-inactive-cards");
            const reviewCardName = await screen.findByTestId("inactive-card-name");
            const activateBtn = await screen.findByTestId("inactive-card-activate-btn");
            expect(reviewCards).toBeInTheDocument()
            expect(reviewCardName).toHaveTextContent('Juz 30')
            expect(activateBtn).not.toHaveClass('hidden');

            await act(async () => {
              await fireEvent.click(activateBtn)
            })

            const manageCardPopup = screen.getByTestId('manage-card-popup-activate');
            expect(manageCardPopup).toBeVisible()
          
            const closemanageCardPopupBtn = screen.getByTestId("manage-card-popup-close-btn")
            await act(async () => {
              await fireEvent.click(closemanageCardPopupBtn)
            })

            expect(manageCardPopup).not.toBeVisible()
          })
  
          it('should display pending cards next show date active', async () => {
            window.location.hash = '#inactive';
            const inactiveCards = {...mockActivity, cards: [{...mockUserCard, completionStatus: CompletionStatus.INACTIVE, addedOn: '2/1/2024', nextShowDate: '2/3/2024', cardId: `${btoa('custom-Furqan 1 to 2')}`}]}
            sessionStorage.setItem("user_data", JSON.stringify({...mockUser, activities: inactiveCards}))
            render(<CardsList {...{isMain: true, userDetails: mockUser, activity: inactiveCards}} />)
            
            const reviewCards = await screen.findByTestId("list-inactive-cards");
            const reviewCardName = await screen.findByTestId("inactive-card-name");
           
            const deleteBtn = await screen.findByTestId("inactive-card-delete-btn");
            expect(reviewCards).toBeInTheDocument()
            expect(reviewCardName).toHaveTextContent('Furqan 1 to 2')
            expect(deleteBtn).not.toHaveClass('hidden');

            await act(async () => {
              await fireEvent.click(deleteBtn)
            })

            const manageCardPopup = screen.getByTestId('manage-card-popup-delete');
            expect(manageCardPopup).toBeVisible()
          
            const closemanageCardPopupBtn = screen.getByTestId("manage-card-popup-close-btn")
            await act(async () => {
              await fireEvent.click(closemanageCardPopupBtn)
            })

            expect(manageCardPopup).not.toBeVisible()
          })
        })
      })
    })
  
    describe('Student', () => {
      describe('Cards of the day', () => {
        describe('Some cards of the today', () => {
          beforeEach(() => {
            jest.useFakeTimers()
            jest.setSystemTime(new Date('2/3/2024'))
          })
  
          afterEach(() => {
            jest.clearAllMocks()
            jest.useRealTimers()
            sessionStorage.clear()
          })
  
          it('should display review cards today', async () => {
            window.location.hash = '';
            sessionStorage.setItem("user_data", JSON.stringify({...mockStudent, activities: activityWithReviewCards}))
            render(<CardsList {...{isMain: true, userDetails: mockStudent, activity: activityWithReviewCards}} />)
            
            const deleteBtn = await screen.findByTestId("today-card-delete-btn");
            expect(deleteBtn).toHaveClass('hidden');
          })
        })
      })

      describe('Active card', () => {
        describe('Some active cards', () => {
          beforeEach(() => {
            jest.useFakeTimers()
            jest.setSystemTime(new Date('2/3/2024'))
          })
  
          afterEach(() => {
            jest.clearAllMocks()
            jest.useRealTimers()
            sessionStorage.clear()
          })

          it('should display pending cards added today', async () => {
            window.location.hash = '#active';
            sessionStorage.setItem("user_data", JSON.stringify({...mockStudent, activities: activityWithPendingAddedToday}))
            render(<CardsList {...{isMain: true, userDetails: mockStudent, activity: activityWithPendingAddedToday}} />)
            
            const reviewCards = await screen.findByTestId("list-active-cards");
            const reviewCardName = await screen.findByTestId("active-card-name");
            const overrideBtn = await screen.findByTestId("active-card-override-btn");
            expect(reviewCards).toBeInTheDocument()
            expect(reviewCardName).toHaveTextContent('Juz 30')
            expect(overrideBtn).toHaveClass('hidden');
          })
  
          it('should display pending cards next show date active', async () => {
            window.location.hash = '#active';
            sessionStorage.setItem("user_data", JSON.stringify({...mockStudent, activities: activityWithPendingShowDate}))
            render(<CardsList {...{isMain: true, userDetails: mockStudent, activity: activityWithPendingShowDate}} />)
            
            const reviewCards = await screen.findByTestId("list-active-cards");
            const reviewCardName = await screen.findByTestId("active-card-name");
           
            const deleteBtn = await screen.findByTestId("active-card-delete-btn");
            expect(reviewCards).toBeInTheDocument()
            expect(reviewCardName).toHaveTextContent('Furqan 1 to 2')
            expect(deleteBtn).toHaveClass('hidden');
          })
        })
      })

      describe('Inactive card', () => {
        describe('Some inactive cards', () => {
          beforeEach(() => {
            jest.useFakeTimers()
            jest.setSystemTime(new Date('2/3/2024'))
          })
  
          afterEach(() => {
            jest.clearAllMocks()
            jest.useRealTimers()
            sessionStorage.clear()
          })

          it('should display inactive cards no activate', async () => {
            window.location.hash = '#inactive';
            const inactiveCards = {...mockActivity, cards: [{...mockUserCard, completionStatus: CompletionStatus.INACTIVE, addedOn: '2/3/2024', cardId: `${btoa('juz-30')}`}]}
            sessionStorage.setItem("user_data", JSON.stringify({...mockStudent, activities: inactiveCards}))
            render(<CardsList {...{isMain: true, userDetails: mockStudent, activity: inactiveCards}} />)
            
            const reviewCards = await screen.findByTestId("list-inactive-cards");
            const reviewCardName = await screen.findByTestId("inactive-card-name");
            const activateBtn = await screen.findByTestId("inactive-card-activate-btn");
            expect(reviewCards).toBeInTheDocument()
            expect(reviewCardName).toHaveTextContent('Juz 30')
            expect(activateBtn).toHaveClass('hidden');
          })
  
          it('should display inactive cards no delete', async () => {
            window.location.hash = '#inactive';
            const inactiveCards = {...mockActivity, cards: [{...mockUserCard, completionStatus: CompletionStatus.INACTIVE, addedOn: '2/3/2024', cardId: `${btoa('juz-30')}`}]}
            sessionStorage.setItem("user_data", JSON.stringify({...mockStudent, activities: inactiveCards}))
            render(<CardsList {...{isMain: true, userDetails: mockStudent, activity: inactiveCards}} />)
            
            const reviewCards = await screen.findByTestId("list-inactive-cards");
            const reviewCardName = await screen.findByTestId("inactive-card-name");
           
            const deleteBtn = await screen.findByTestId("inactive-card-delete-btn");
            expect(reviewCards).toBeInTheDocument()
            expect(reviewCardName).toHaveTextContent('Juz 30')
            expect(deleteBtn).toHaveClass('hidden');
          })
        })
      })
    })
  })
})