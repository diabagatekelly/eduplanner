"use client"

import { useEffect, useState } from "react"
import { editActivity } from "../../api/controller"
import { useDispatch } from "react-redux"
import { editUserActivity } from "../../store/actions/userActions"
import ListUi from "@/components/lists/lists-ui";
import { CompletionStatus } from "../../interfaces/CompletionStatusEnum"
import { IActivity } from "@/interfaces/IActivity"
import { IUser } from "@/interfaces/IUser"
import { ISODateString } from "@/interfaces/isoDateType"
import store from "@/store/store"
import { formatISODate } from "@/utils/formatDate"
import { IResponse } from "@/interfaces/IApiResponse"

interface IViewActivity {
  updateActivity: () => Promise<void>
}

export default function ViewActivity<IViewActivity>({ userDetails, userActivity, isMain }: {userDetails: IUser, userActivity: IActivity, isMain: boolean}) {
  const dispatch = useDispatch()

  const [isLoading, setIsLoading] = useState(false)
  const [formSubmitOutcomeMessage, setFormSubmitOutcomeMessage] = useState("")  

  async function updateActivity(): Promise<void> {
    try {
      const updatedActivity: IActivity = {
        ...userActivity,
        lastUpdatedOn: formatISODate(new Date().toISOString() as ISODateString)
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
      <h3 className="text-3xl py-3 font-bold" data-testid="activity-name">{userActivity?.name}</h3>
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

        onClick={updateActivity}>
        {userActivity?.completionStatus === CompletionStatus.COMPLETED ? 'Already completed' : 'Mark completed'}
      </button>
      <p data-testid="update-activity-outcome">{formSubmitOutcomeMessage}</p>
      <div>
        <hr className="my-5" />
        <ListUi {...{ listType: 'cards', isMain, userDetails, activity: userActivity }} />
      </div>
    </>
  )
}

