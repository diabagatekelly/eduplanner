"use client"

import { useEffect, useState } from "react"
import { editActivity } from "../api/controller"
import { useDispatch } from "react-redux"
import { editUserActivity } from "../actions/userActions"
import AddCard from "./add-card"
import ListUi from "@/app/ui/lists/lists-ui";

export const ActivityContent = ({ activityDetails, isMain }) => {
  const dispatch = useDispatch()
  let args;

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [formSuccessMessage, setFormSuccessMessage] = useState("")
  const [activity, setActivityDetails] = useState({ name: '', userEmail: '', hasCards: false, description: '', points: 0, completionStatus: 'pending', username: '', cards: [] })
  const [userDetails, getUserDetails] = useState({ ...args })
  const [cardsOfTheDay, getCardsOfTheDay] = useState([])
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setActivityDetails(activityDetails)
    getUserDetails({ username: activityDetails.username, email: activityDetails.userEmail })

    const todayCards = activityDetails?.cards?.filter((card) => {
      const nextShowDate = new Date(card.nextShowDate).getDate()
      const createdOn = new Date(card.createdOn).getDate()
      return Date.now() === createdOn || nextShowDate
    })

    getCardsOfTheDay(todayCards)

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
          <AddCard {...{ activity }} />
          <hr className="my-5" />
          <h3><u><b>Cards of the day</b></u></h3>
          <ListUi {...{ listType: 'cards', isMain, userDetails, activity: activity }} />
          {/* {activity?.cards?.map((card) => (
            
            // <div className="mb-2" key={Math.random() * 1000}>
            //   <OpenModalButton  {...{ buttonTxt: `${card?.front} - ${card?.back}`, setShowModal }} />
            //   <Popup2 {...{ isMain, showModal, type: 'card' }} onClose={() => setShowModal(false)} />

            // </div>
          ))} */}
          {/* {activity.cards?.length ? activity?.cards?.map((card) => (
            <div className="mb-2" key={Math.random() * 1000}>
              <OpenModalButton  {...{ buttonTxt: `${card?.front} - ${card?.back}`, setShowModal }} />
              <Popup2>
                <CardPopup />
              </Popup2>
              
            </div>
          ))
            : <p>There are no cads to review today.</p>} */}
        </>
        : ''
      }

    </>
  )
}

