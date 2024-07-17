import AddActivity from '../../../components/activities/add-activity'
import '@testing-library/jest-dom'
import { screen, fireEvent, act } from '@testing-library/react'
import { render } from '../../util';
import * as React from 'react';
import { createActivity } from '../../../api/controller';
import { mockUser, mockActivity } from '../../../specs/mocks';

jest.mock('../../../api/controller');
jest.mock('next/navigation', () => {
  return {
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
    })),
  }
});

describe('Add activity', () => {
  const userDetails = {...mockUser}
  const reload = window.location.reload;

  beforeAll(() => {
    sessionStorage.setItem("user_data", JSON.stringify(userDetails))
    Object.defineProperty(window, 'location', {
      value: { reload: jest.fn() }
    });
  })

  afterAll(() => {
    sessionStorage.clear()
    window.location.reload = reload;
  })

  it('should render form to add an activity', async () => {
    render(<AddActivity {...{userDetails}} />)
 
    const heading = await screen.findByRole('heading', { level: 3 })
    const addActivityForm = await screen.findByTestId('add-activity-form')
 
    expect(heading).toHaveTextContent('Add a new activity')
    expect(addActivityForm).toBeInTheDocument()
  })

  it('should invoke createActivity controller when form is submitted', async () => {
    (createActivity as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve({status: 200, data: {message: null, details: {}}})
    })
    render(<AddActivity {...{userDetails}} />)

    const name = screen.getByLabelText(/Name:/i)
    const description = screen.getByLabelText(/Description:/i)
    const points = screen.getByLabelText('Points (optional):')
    const hasCards = screen.getByLabelText(/Yes/i)
    const submitButton = screen.getByTestId('add-activity-btn')
    
    const userActivityDTO = {userActivity: mockActivity, userId: userDetails.userId}

    await act(() => {
      fireEvent.change(name, {
        target: {value: 'Quran'}
      })
      fireEvent.change(description, {
        target: {value: 'Quran memorization'}
      })
      fireEvent.change(points, {
        target: {value: '15'}
      })
      fireEvent.click(hasCards)
    })

    await act(async () => {
      await fireEvent.click(submitButton)
    })
    
    await expect(createActivity).toHaveBeenCalledWith(userActivityDTO)
  })

  it('should not create pre-existing user activity', async () => {
    const userDetails = {...mockUser, activities: [{name: 'Quran'}]}
    render(<AddActivity {...{userDetails}} />)

    const name = screen.getByLabelText(/Name:/i)
    const description = screen.getByLabelText(/Description:/i)
    const points = screen.getByLabelText('Points (optional):')
    const hasCards = screen.getByLabelText(/Yes/i)
    const submitButton = screen.getByTestId('add-activity-btn')

    const submitMessage = await screen.findByTestId('add-activity-submit-message');

    await act(() => {
      fireEvent.change(name, {
        target: {value: 'Quran'}
      })
      fireEvent.change(description, {
        target: {value: 'Quran memorization'}
      })
      fireEvent.change(points, {
        target: {value: '15'}
      })
      fireEvent.click(hasCards)
    })

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    expect(submitMessage).toHaveTextContent("This is already one of your activities.")
    expect(name).toHaveValue('')
    expect(description).toHaveValue('')
    expect(points).toHaveValue(0)
  })

  it('should reset form when response is successful and display success message, then reset message when form in focus', async () => {
    (createActivity as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve({status: 200, data: {message: 'Successfully created activity.', details: {userId: userDetails.userId, userActivity: mockActivity}}})
    })
  
    render(<AddActivity {...{userDetails}} />)

    const name = screen.getByLabelText(/Name:/i)
    const description = screen.getByLabelText(/Description:/i)
    const points = screen.getByLabelText('Points (optional):')
    const hasCards = screen.getByLabelText(/Yes/i)
    const submitButton = screen.getByTestId('add-activity-btn')

    const submitMessage = await screen.findByTestId('add-activity-submit-message');

    await act(() => {
      fireEvent.change(name, {
        target: {value: 'Quran'}
      })
      fireEvent.change(description, {
        target: {value: 'Quran memorization'}
      })
      fireEvent.change(points, {
        target: {value: '15'}
      })
      fireEvent.click(hasCards)
    })

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    expect(submitMessage).toHaveTextContent("Successfully created activity.")
    expect(name).toHaveValue('')
    expect(description).toHaveValue('')
    expect(points).toHaveValue(0)

    await act(() => {
      fireEvent.change(name, {
        target: {value: 'Quran'}
      })
    })
    expect(submitMessage).toHaveTextContent("")
  })

  it('should not reset form when response is not 200 or 500 and display error message', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => null);

    const error = {response: {status: 400, data: {status: 'failedTransaction', message: 'Erroneous response'}}};
    (createActivity as jest.Mock).mockImplementation(() => {
      return Promise.reject(error)
    })

    render(<AddActivity {...{userDetails}} />)

    const name = screen.getByLabelText(/Name:/i)
    const description = screen.getByLabelText(/Description:/i)
    const points = screen.getByLabelText('Points (optional):')
    const hasCards = screen.getByLabelText(/Yes/i)
    const submitButton = screen.getByTestId('add-activity-btn')

    await act(() => {
      fireEvent.change(name, {
        target: {value: 'Quran'}
      })
      fireEvent.change(description, {
        target: {value: 'Quran memorization'}
      })
      fireEvent.change(points, {
        target: {value: '15'}
      })
      fireEvent.click(hasCards)
    })

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    expect(name).toHaveValue('Quran')
    expect(description).toHaveValue('Quran memorization')
    expect(points).toHaveValue(15)

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    const errorMessage = await screen.findByText(/Erroneous response/i)
  
    expect(name).toHaveValue('Quran')
    expect(description).toHaveValue('Quran memorization')
    expect(points).toHaveValue(15)
    expect(errorMessage).toBeInTheDocument()
  })

  it('should not reset form when response is 500 and display error message', async () => {
    const error = {response: {status: 500, data: {status: 'internalServerError', message: 'Server error'}}};
    (createActivity as jest.Mock).mockImplementation(() => {
      return Promise.reject(error)
    })
    render(<AddActivity {...{userDetails}} />)

    const name = screen.getByLabelText(/Name:/i)
    const description = screen.getByLabelText(/Description:/i)
    const points = screen.getByLabelText('Points (optional):')
    const hasCards = screen.getByLabelText(/Yes/i)
    const submitButton = screen.getByTestId('add-activity-btn')

    await act(() => {
      fireEvent.change(name, {
        target: {value: 'Quran'}
      })
      fireEvent.change(description, {
        target: {value: 'Quran memorization'}
      })
      fireEvent.change(points, {
        target: {value: '15'}
      })
      fireEvent.click(hasCards)
    })

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    expect(name).toHaveValue('Quran')
    expect(description).toHaveValue('Quran memorization')
    expect(points).toHaveValue(15)

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    const errorMessage = await screen.getByText(/Failed to create activity due to an internal error. Please try again later./i)
  
    expect(name).toHaveValue('Quran')
    expect(description).toHaveValue('Quran memorization')
    expect(points).toHaveValue(15)
    expect(errorMessage).toBeInTheDocument()
    expect(console.log).toHaveBeenCalledWith(error)
  })

  it('should not reset form when error is thrown with no response', async () => {
    
    (createActivity as jest.Mock).mockImplementation(() => {
      return Promise.reject({status: 500, message: 'Error thrown and caught.'});
    });
    render(<AddActivity {...{userDetails}} />)

    const name = screen.getByLabelText(/Name:/i)
    const description = screen.getByLabelText(/Description:/i)
    const points = screen.getByLabelText('Points (optional):')
    const hasCards = screen.getByLabelText(/No/i)
    const submitButton = screen.getByTestId('add-activity-btn')

    await act(() => {
      fireEvent.change(name, {
        target: {value: 'Quran'}
      })
      fireEvent.change(description, {
        target: {value: 'Quran memorization'}
      })
      fireEvent.change(points, {
        target: {value: '15'}
      })
      fireEvent.click(hasCards)
    })

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    expect(name).toHaveValue('Quran')
    expect(description).toHaveValue('Quran memorization')
    expect(points).toHaveValue(15)

    await act(async () => {
      await fireEvent.click(submitButton)
    })

    const errorMessage = await screen.getByText(/Server is down. Try again later./i)
    expect(errorMessage).toBeInTheDocument()  
    expect(console.log).toHaveBeenCalledWith({status: 500, message: 'Error thrown and caught.'})
  })
})