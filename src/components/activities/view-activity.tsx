"use client"

import { useState } from "react"
import { editActivity, requestCardReview } from "../../api/controller"
import { useDispatch } from "react-redux"
import { editUserActivity } from "../../store/actions/userActions"
import ListUi from "@/components/lists/lists-ui";
import { CompletionStatus } from "../../interfaces/CompletionStatusEnum"
import { IActivity } from "@/interfaces/IActivity"
import { IUser } from "@/interfaces/IUser"
import { ISODateString } from "@/interfaces/isoDateType"
import { IResponse } from "@/interfaces/IApiResponse"
import { ICard } from "@/interfaces/ICard"
import { fromDbFormat } from "@/utils/formatActivityName"

interface IViewActivity {
  submit: () => Promise<void>
}

export default function ViewActivity<IViewActivity>({ userDetails, userActivity, isMain }: {userDetails: IUser, userActivity: IActivity, isMain: boolean}) {
  const dispatch = useDispatch()
  let args;

  const [isLoading, setIsLoading] = useState(false)
  const [formSubmitOutcomeMessage, setFormSubmitOutcomeMessage] = useState("")  


  async function submit(): Promise<void> {
    if (userActivity.cards?.some((card: ICard) => ![CompletionStatus.COMPLETED, CompletionStatus.INACTIVE].includes(card.completionStatus))) {
      setFormSubmitOutcomeMessage('You still have some cards to complete!!')
      return
    }

    if (isMain && userDetails?.accountType === 'student') {
      await _submitForReview()
    } else if (!isMain || isMain && userDetails?.accountType === 'teacher') {
      await _updateActivity()
    }
  }

  async function _submitForReview(): Promise<void> {
    try {
      const requestReview = {
        id: userActivity.activityId,
        teacherId: userDetails.linkedAccountsData.teacher,
        student: {
          id: userDetails.userId,
          fullName: `${userDetails.firstName} ${userDetails.lastName}`,
          email: userDetails.email
        }
      }

      await requestCardReview(requestReview);

      const updatedActivity: IActivity = {
        ...userActivity,
        lastUpdatedOn: new Date(Date.now()).toLocaleDateString('en-US', {timeZone: 'EST'}) as ISODateString,
        completionStatus: CompletionStatus.REVIEW
      }

      const response = await editActivity({userId: userDetails.userId, updatedActivity}) as unknown as IResponse;
      const {data} = response;
      const {message, details}: {message: string, details: IActivity} = data;
      dispatch(editUserActivity({username: userDetails.username, updatedActivity: details}))

      setIsLoading(false)

      setFormSubmitOutcomeMessage('Request for review successfully sent.')
      window.location.reload()
    } catch (error) {
      setIsLoading(false)
      console.log(error)

      if (!error.response) {
        setFormSubmitOutcomeMessage('Server is down. Try again later.')
        return
      }

      const {status, data} = error.response;

      if (status === 500) {
        setFormSubmitOutcomeMessage('Failed to request review due to an internal error. Please try again later.')
      } else {
        setFormSubmitOutcomeMessage(data.message)
      }
    }
  }

  async function _updateActivity(): Promise<void> {
    try {
      const updatedActivity: IActivity = {
        ...userActivity,
        lastUpdatedOn: new Date(Date.now()).toLocaleDateString('en-US', {timeZone: 'EST'}) as ISODateString,
        completionStatus: CompletionStatus.COMPLETED
      }

      const response = await editActivity({userId: userDetails.userId, updatedActivity}) as unknown as IResponse;
      const {data} = response;
      const {message, details}: {message: string, details: IActivity} = data;
      dispatch(editUserActivity({username: userDetails.username, updatedActivity: details}))
      setFormSubmitOutcomeMessage(message)
      window.location.reload()
    } catch (error) {
      setIsLoading(false)
      console.log(error)

      if (!error.response) {
        setFormSubmitOutcomeMessage('Server is down. Try again later.')
        return
      }

      const {status, data} = error.response;

      if (status === 500) {
        setFormSubmitOutcomeMessage('Failed to edit activity due to an internal error. Please try again later.')
      } else {
        setFormSubmitOutcomeMessage(data.message)
      }
    }
  }
  
  return (
    <>
      <h3 className="text-3xl py-3 font-bold" data-testid="activity-name">{fromDbFormat(userActivity?.name)} - {userDetails?.firstName} {userDetails?.lastName}</h3>
      <div data-testid="activity-details">
        <p>Description: {userActivity?.description}</p>
        <p>Points: {userActivity?.points} points</p>
        <p>Status: {userActivity?.completionStatus}</p>
        <p>Last Updated: {userActivity?.lastUpdatedOn?.split('T')[0] || 'Never'}</p>
      </div>
      
      <button
        data-testid="activity-update-btn"
        disabled={userActivity?.completionStatus === CompletionStatus.COMPLETED}
        type="button"
        className={userActivity?.completionStatus !== CompletionStatus.COMPLETED ?
          "text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
          :
          "text-white bg-gray-600 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:focus:ring-gray-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
        }

        onClick={submit}>
        {(!isMain || isMain && userDetails?.accountType === 'teacher') && userActivity?.completionStatus === CompletionStatus.COMPLETED && 'Already completed'}
        {(!isMain || isMain && userDetails?.accountType === 'teacher') && userActivity?.completionStatus !== CompletionStatus.COMPLETED && 'Mark completed'}
        {(isMain && userDetails?.accountType === 'student') && userActivity?.completionStatus === CompletionStatus.COMPLETED && 'Already completed'}
        {(isMain && userDetails?.accountType === 'student') && userActivity?.completionStatus !== CompletionStatus.COMPLETED && 'Request review'}

      </button>
      <p data-testid="update-activity-outcome">{formSubmitOutcomeMessage}</p>
      <hr className="my-5" />
      {userActivity?.hasCards && 
        <div>
          <ListUi {...{ listType: 'cards', isMain, userDetails, activity: userActivity }} />
        </div>
      }
    </> 
  )
}

