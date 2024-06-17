import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { editUserCard, removeUserCard } from "@/store/actions/userActions";
import { activateCard, deleteCard, editCardStage, requestCardReview, resetCardStage } from "../../api/controller";
import { IResponse } from "@/interfaces/IApiResponse";
import { ICard } from "@/interfaces/ICard";
import store from "@/store/store";
import { IUser } from "@/interfaces/IUser";

const ManageCardPopup = ({onClose, showModal, isMain, ...childArgs}) => {
  const dispatch = useDispatch()
  let args;

  const [userInfo, getUserInfo] = useState<IUser>({ ...childArgs.user });
  const [card, getCardDetails] = useState({...childArgs.item.card});
  const [activity, getActivityDetails] = useState({ ...childArgs.activity });
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    const cardDetails = childArgs.item.card
    const user = childArgs.user
    const activityDetails = childArgs.activity
    
    getCardDetails(cardDetails)
    getUserInfo(user);
    getActivityDetails(activityDetails)

  }, [showModal, childArgs, statusMessage])

  async function resetStage() {
    try {
      const resetPayload = { 
        userId: userInfo.userId, 
        activity: activity.name, 
        cardId: card.cardId
      }
      const response = await resetCardStage(resetPayload)
      const {data} = response;
      const {details}: {message: string, details: ICard} = data;
      dispatch(editUserCard({
        username: userInfo.username,
        activityName: activity.name, 
        updatedCard: details
      }))
      setStatusMessage('Successfully reset card')
      window.location.reload()
    
    } catch (error) {
      setIsLoading(false)
      console.log(error)

      if (!error.response) {
        setStatusMessage('Server is down. Try again later.')
        return
      }

      const {status, data} = error.response;

      if (status === 500) {
        setStatusMessage('Failed to reset card due to an internal error. Please try again later.')
      } else {
        setStatusMessage(data.message)
      }
    }
  }

  async function submitForReview() {
    try {
      const requestReview = {
        id: card.cardId,
        teacherId: userInfo.linkedAccountsData.teacher,
        student: {
          id: userInfo.userId,
          fullName: `${userInfo.firstName} ${userInfo.lastName}`,
          email: userInfo.email
        }
      }

      await requestCardReview(requestReview);

      dispatch(removeUserCard({
        username: userInfo.username,
        activityName: activity.name, 
        cardId: card.cardId
      }))

      setIsLoading(false)

      setStatusMessage('Request for review successfully sent.')
      window.location.reload()
    } catch (error) {
      setIsLoading(false)
      console.log(error)

      if (!error.response) {
        setStatusMessage('Server is down. Try again later.')
        return
      }

      const {status, data} = error.response;

      if (status === 500) {
        setStatusMessage('Failed to request review due to an internal error. Please try again later.')
      } else {
        setStatusMessage(data.message)
      }
    }
  }

  async function submitEditStage(newStageStatus) {
    try {
      const editPayload = { 
        userId: userInfo.userId, 
        activity: activity.name, 
        cardId: card.cardId,
        editData: {
          stage: card.stage,
          promote: newStageStatus
        }
      }

      const response = await editCardStage(editPayload)
      const {data} = response;
      const {details}: {message: string, details: ICard} = data;
      dispatch(editUserCard({
        username: userInfo.username,
        activityName: activity.name, 
        updatedCard: details
      }))
      setStatusMessage('Successfully edited status.')
      window.location.reload()

    } catch (error) {
      setIsLoading(false)
      console.log(error)

      if (!error.response) {
        setStatusMessage('Server is down. Try again later.')
        return
      }

      const {status, data} = error.response;

      if (status === 500) {
        setStatusMessage('Failed to update card status due to an internal error. Please try again later.')
      } else {
        setStatusMessage(data.message)
      }
    }
  }

  async function removeCard() {
    try {
      const deletePayload = { 
        userId: userInfo.userId, 
        activity: activity.name, 
        cardId: card.cardId
      }
      await deleteCard(deletePayload) as unknown as IResponse;
      dispatch(removeUserCard({
        username: userInfo.username,
        activityName: activity.name, 
        cardId: card.cardId
      }))
      setStatusMessage('Successfully removed card')
      window.location.reload()

    } catch (error) {
      setIsLoading(false)
      console.log(error)

      if (!error.response) {
        setStatusMessage('Server is down. Try again later.')
        return
      }

      const {status, data} = error.response;

      if (status === 500) {
        setStatusMessage('Failed to remove card due to an internal error. Please try again later.')
      } else {
        setStatusMessage(data.message)
      }
    }
  }

  async function activate() {
    try {
      const activatePayload = { 
        userId: userInfo.userId, 
        activity: activity.name, 
        cardId: card.cardId
      }
      const response = await activateCard(activatePayload) as unknown as IResponse;
      const {data} = response;
      const {details}: {message: string, details: ICard} = data;
      dispatch(editUserCard({
        username: userInfo.username,
        activityName: activity.name, 
        updatedCard: details
      }))
      setStatusMessage('Successfully activated card')
      window.location.reload()

    } catch (error) {
      setIsLoading(false)
      console.log(error)

      if (!error.response) {
        setStatusMessage('Server is down. Try again later.')
        return
      }

      const {status, data} = error.response;

      if (status === 500) {
        setStatusMessage('Failed to activate card due to an internal error. Please try again later.')
      } else {
        setStatusMessage(data.message)
      }
    }
  }

  function formatCardName(cardId) {
    const cardName = atob(cardId)
    const cardNameNoHyphens = cardName.split('-')
    if (cardNameNoHyphens[0] === 'juz') {
      return `${_capitalizeFirstLetter(cardNameNoHyphens[0])} ${cardNameNoHyphens[1]}`
    } else if (cardNameNoHyphens[0] === 'custom') {
      return `${_capitalizeFirstLetter(cardNameNoHyphens[0])}: ${cardNameNoHyphens[1]}`
    } else {
      return `${_capitalizeFirstLetter(cardNameNoHyphens[0])} ${cardNameNoHyphens[1]}: ${cardNameNoHyphens[3]}`
    }
  }

  function _capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  return (
    <>
      <dialog aria-hidden="true" open={showModal} id="popup-modal" className="fixed top-0 left-0 right-0 z-50 overflow-x-hidden overflow-y-auto md:inset-0 max-h-full border-4 border-gray-800 rounded-lg">
        <div className="relative w-full max-w-md max-h-full">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <button onClick={onClose} type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="popup-modal">
              <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" stroke-linecap="round" strokeLinejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
            <div className="p-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width={1.5} stroke="currentColor" className="mx-auto mb-4 text-green-400 w-12 h-12 dark:text-green-200">
                <path stroke-linecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
              <div className="modal-message">
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Manage Card</h3>
                <div className="text-left">
                  <h6>{formatCardName(card.cardId)}</h6>
                  <hr />
                  <div className="my-5">
                    <h6>Owner: {userInfo.firstName} {userInfo.lastName}</h6>
                    <h6>Activity: {activity.name}</h6>
                    <h6>Created On: {card.addedOn}</h6>
                    <h6>Last updated: {card.lastUpdatedOn || 'Never'}</h6>
                    <h6>Next show date: {card.nextShowDate || 'Never'}</h6>
                  </div>
                  <hr />
                  <div className="my-5">
                    <h6>Current Stage: {card.stage}</h6>
                    <h6>Current Status: {card.completionStatus}</h6>
                  </div>
                </div>
                {(isMain && userInfo?.accountType === 'teacher' || (!isMain && userInfo?.accountType === 'student')) && childArgs?.item.action === 'delete' &&
                  <div className="delete-actions mt-5">
                    <button 
                      onClick={removeCard} 
                      data-modal-hide="popup-modal" 
                      type="button" 
                      className="text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2">
                        Delete card
                    </button>
                  </div>
                }
                {(isMain && userInfo?.accountType === 'teacher' || (!isMain && userInfo?.accountType === 'student')) && childArgs?.item.action === 'activate' &&
                  <div className="activate-actions mt-5">
                    <button 
                      onClick={activate} 
                      data-modal-hide="popup-modal" 
                      type="button" 
                      className="text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2">
                        Activate card
                    </button>
                  </div>
                }
                {(isMain && userInfo?.accountType === 'teacher' || (!isMain && userInfo?.accountType === 'student')) && !['delete', 'activate', 'show'].includes(childArgs?.item.action) &&
                  
                  <div className="teacher-actions">
                    <button 
                      onClick={resetStage} 
                      data-modal-hide="popup-modal" 
                      type="button" 
                      className="text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2">
                        Reset Stage
                    </button>
                    <button 
                      disabled={false}  //TODO - revert to card.completionStatus === completed once pending reset automatically
                      onClick={async () => await submitEditStage(true)} 
                      data-modal-hide="popup-modal" 
                      type="button" 
                      className="text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2">
                        Promote
                    </button>

                    <button 
                      disabled={false} //TODO - revert to card.completionStatus === completed once pending reset automatically
                      onClick={async () => await submitEditStage(false)} 
                      data-modal-hide="popup-modal" 
                      type="button" 
                      className="text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2">
                        Demote
                    </button>
                  </div>
                }

                {isMain && userInfo?.accountType === 'student' && childArgs.item.action !== 'show' &&
                  <div className="student-actions">
                    <button 
                      onClick={submitForReview} 
                      data-modal-hide="popup-modal" 
                      type="button" 
                      className="text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2">
                        Submit for Review
                    </button>
                  </div>
                }
                
              </div>
              <div className="mt-5">
                <button onClick={onClose} data-modal-hide="popup-modal" type="button" className="text-white-500 bg-red hover:bg-red-100 focus:ring-4 focus:outline-none focus:ring-red-200 rounded-lg border border-red-200 text-sm font-medium px-5 py-2.5 hover:text-red-900 focus:z-10 dark:bg-red-700 dark:text-white-300 dark:border-red-500 dark:hover:text-black dark:hover:bg-gray-600 dark:focus:ring-red-600">Cancel</button>
              </div>
              <p>{statusMessage}</p>
            </div>
          </div>
        </div>
      </dialog>
      

<div id="authentication-modal" aria-hidden={!showModal} className={showModal ? '' : "hidden " + "overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"}>
    <div className="relative p-4 w-full max-w-md max-h-full">
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Sign in to our platform
                </h3>
                <button onClick={onClose} type="button" className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="authentication-modal">
                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                    </svg>
                    <span className="sr-only">Close modal</span>
                </button>
            </div>
            <div className="p-4 md:p-5">
                <form className="space-y-4" action="#">
                    <div>
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                        <input type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="name@company.com" required />
                    </div>
                    <div>
                        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your password</label>
                        <input type="password" name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required />
                    </div>
                    <div className="flex justify-between">
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input id="remember" type="checkbox" value="" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-600 dark:border-gray-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800" required />
                            </div>
                            <label htmlFor="remember" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Remember me</label>
                        </div>
                        <a href="#" className="text-sm text-blue-700 hover:underline dark:text-blue-500">Lost Password?</a>
                    </div>
                    <button type="submit" className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Login to your account</button>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-300">
                        Not registered? <a href="#" className="text-blue-700 hover:underline dark:text-blue-500">Create account</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div> 

    </>
  )
}

export default ManageCardPopup;