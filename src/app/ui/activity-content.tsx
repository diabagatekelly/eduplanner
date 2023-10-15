"use client"

import { useState } from "react"
import { editActivity } from "../api/controller"
import { useDispatch } from "react-redux"
import { editUserActivity } from "../actions/userActions"

export const ActivityContent = ({activityDetails}) => {
  const dispatch = useDispatch()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [formSuccessMessage, setFormSuccessMessage] = useState("")

  const updateActivity = async () => {
    try {
      const options = {
        params: {
          name: activityDetails.name,
          userEmail: activityDetails.userEmail,
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
      <h3>{activityDetails?.name}</h3>
      <p>{activityDetails?.hasDecks ? 'Get queue' : 'No decks'}</p>
      <p>Directions: {activityDetails?.description}</p>
      <p>Points: {activityDetails?.points} points</p>
      <p>Status: {activityDetails?.completionStatus}</p>
      <button 
        disabled={activityDetails?.completionStatus === 'completed'}
        type="button" 
        className={activityDetails?.completionStatus !== "completed" ? 
          "text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
          :
          "text-white bg-gray-600 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:focus:ring-gray-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
        } 

          onClick={updateActivity}>
          {activityDetails?.completionStatus === 'completed' ?  'Already completed' : 'Mark completed'}
      </button>
      <p>{formSuccessMessage}</p>
    </>
  )
}

