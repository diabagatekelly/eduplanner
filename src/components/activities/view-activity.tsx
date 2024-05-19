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

interface IViewActivity {
  updateActivity: () => Promise<void>
}

export default function ViewActivity<IViewActivity>({ userDetails, userActivity, isMain }: {userDetails: IUser, userActivity: IActivity, isMain: boolean}) {
  const dispatch = useDispatch()

  const [isLoading, setIsLoading] = useState(false)
  const [formSubmitOutcomeMessage, setFormSubmitOutcomeMessage] = useState("")  
  const [activity, setUserActivity] = useState<IActivity>({
    activityId: '',
    name: '', 
    points: 0, 
    description: '', 
    completionStatus: CompletionStatus.PENDING, 
    hasCards: false,
    createdOn: '' as ISODateString,
    lastUpdatedOn: '' as ISODateString, 
    cards: []
  })

  async function updateActivity(): Promise<void> {
    try {
      const options = {
        params: {
          ...userActivity,
          lastUpdatedOn: formatISODate(new Date().toISOString() as ISODateString)
        }
      }

      const response = await editActivity(options)
        .then(async (response) => {
          setIsLoading(false)
          if (response.status !== 200) {
            setFormSubmitOutcomeMessage(response.data.message)
          } else {
            dispatch(editUserActivity(response.data.params))
            setFormSubmitOutcomeMessage('Activity status changed to completed.')
          }
        })

    } catch (error) {
      console.error(error)
      setIsLoading(false)
      if (error.response) {
        setFormSubmitOutcomeMessage(error.response.data.message)
      }
    }
  }
  
  return (
    <>
      <h3>{userActivity?.name}</h3>
      <p>Directions: {userActivity?.description}</p>
      <p>Points: {userActivity?.points} points</p>
      <p>Status: {userActivity?.completionStatus}</p>
      <p>Last Updated: {userActivity?.lastUpdatedOn?.split('T')[0] || 'Never'}</p>
      <button
        disabled={userActivity?.completionStatus === CompletionStatus.COMPLETED}
        type="button"
        className={userActivity?.completionStatus !== CompletionStatus.COMPLETED ?
          "text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
          :
          "text-white bg-gray-600 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:focus:ring-gray-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
        }

        onClick={updateActivity}>
        {activity?.completionStatus === CompletionStatus.COMPLETED ? 'Already completed' : 'Mark completed'}
      </button>


      <p>{formSubmitOutcomeMessage}</p>
      {userActivity?.hasCards ?
        <>
          <hr className="my-5" />
          <ListUi {...{ listType: 'cards', isMain, userDetails, activity: activity }} />
        </>
        : ''
      }

    </>
  )
}

