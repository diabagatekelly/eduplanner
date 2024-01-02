"use client"

import { useEffect, useState } from "react"
import { editActivity } from "../api/controller"
import { useDispatch } from "react-redux"
import { editUserActivity } from "../actions/userActions"
import ListUi from "@/app/ui/lists/lists-ui";

export const ActivityContent = ({ activityDetails, isMain }) => {
  const dispatch = useDispatch()
  let args;

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [formSuccessMessage, setFormSuccessMessage] = useState("")
  const [activity, setActivityDetails] = useState({ name: '', userEmail: '', hasCards: false, description: '', points: 0, completionStatus: 'pending', username: '', cards: [] })
  const [userDetails, getUserDetails] = useState({ ...args })

  useEffect(() => {
    setActivityDetails(activityDetails)
    getUserDetails({ username: activityDetails.username, email: activityDetails.userEmail })

  }, [activityDetails])

  const updateActivity = async () => {
    try {
      const options = {
        params: {
          ...activityDetails,
          completionStatus: 'completed',
          dateLastCompleted: Date.now()
        }
      }

      const response = await editActivity(options)
        .then(async (response) => {
          setIsLoading(false)
          if (response.status !== 200) {
            setFormSuccessMessage(response.data.message)
          } else {
            dispatch(editUserActivity(options.params))
            setFormSuccessMessage('Activity status changed to completed.')
          }
        })

    } catch (error) {
      console.error(error)
      setIsLoading(false)
      if (error.response) {
        setFormSuccessMessage(error.response.data.message)
      }
    }
  }
  
  return (
    <>
      <h3>{activity?.name}</h3>
      <p>Directions: {activity?.description}</p>
      <p>Points: {activity?.points} points</p>
      <p>Status: {activity?.completionStatus}</p>
      <button
        disabled={activity?.completionStatus === 'completed'}
        type="button"
        className={activity?.completionStatus !== "completed" ?
          "text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
          :
          "text-white bg-gray-600 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:focus:ring-gray-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
        }

        onClick={updateActivity}>
        {activity?.completionStatus === 'completed' ? 'Already completed' : 'Mark completed'}
      </button>


      <p>{formSuccessMessage}</p>
      {activity?.hasCards ?
        <>
          <hr className="my-5" />
          <ListUi {...{ listType: 'cards', isMain, userDetails, activity: activity }} />
        </>
        : ''
      }

    </>
  )
}

