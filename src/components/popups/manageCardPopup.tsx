import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { editUserCard, removeUserCard } from "@/store/actions/userActions";
import { activateCard, deleteCard, editCardStage, editAnyCardAttr, requestCardReview, resetCardStage } from "../../api/controller";
import { IResponse } from "@/interfaces/IApiResponse";
import { ICard } from "@/interfaces/ICard";
import { IUser } from "@/interfaces/IUser";
import { CompletionStatus } from "@/interfaces/CompletionStatusEnum";
import { IActivity } from "@/interfaces/IActivity";
import formatCardName from "@/utils/formatCardName";

export default function ManageCardPopup({onClose, showModal, isMain, ...childArgs}: {onClose: any, showModal: boolean, isMain: boolean, user?: IUser | Partial<IUser>, activity?: IActivity, item?: {card: ICard, action: string}}) {
  const dispatch = useDispatch()

  const [userInfo, getUserInfo] = useState<IUser | Partial<IUser>>({ ...childArgs.user });
  const [card, getCardDetails] = useState<ICard>({...childArgs.item.card});
  const [activity, getActivityDetails] = useState<IActivity>({ ...childArgs.activity });
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false)
  const [newStage, setNewStage] = useState('')

  useEffect(() => {
    const cardDetails = childArgs.item.card
    const user = childArgs.user
    const activityDetails = childArgs.activity
    
    getCardDetails(cardDetails)
    getUserInfo(user);
    getActivityDetails(activityDetails)

  }, [showModal, childArgs, statusMessage, newStage])

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

      const editPayload = { 
        userId: userInfo.userId, 
        activity: activity.name, 
        cardId: card.cardId,
        editData: {
          completionStatus: CompletionStatus.REVIEW
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

  async function overrideStage(e: React.FormEvent<any>) {
    try {
      e.preventDefault();
      const editPayload = { 
        userId: userInfo.userId, 
        activity: activity.name, 
        cardId: card.cardId,
        editData: {
          stage: newStage
        }
      }

      const response = await editAnyCardAttr(editPayload)
      const {data} = response;
      const {details}: {message: string, details: ICard} = data;
      dispatch(editUserCard({
        username: userInfo.username,
        activityName: activity.name, 
        updatedCard: details
      }))
      setStatusMessage('Successfully overrode status.')
      getCardDetails(details)
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
        setStatusMessage('Failed to override card stage due to an internal error. Please try again later.')
      } else {
        setStatusMessage(data.message)
      }
    }
  }

  async function submitEditStage(newStageStatus: boolean) {
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
      const deletePayload = [{ 
        userId: userInfo.userId, 
        activity: activity.name, 
        cardId: card.cardId
      }]
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

  function formatCardInstructions(cardName) {
    if (cardName.includes('Vocab')) {
      return (
      <>
        <ul>
          <li>1. Recall to / from</li>
          <li>2. Use in spoken sentences</li>
          <li>OPTIONAL: Practice spelling</li>
          <li>OPTIONAL: Use in written sentences</li>
        </ul>
      </>)
    } else {
      return 'None'
    } 
  }

  function handleOverrideFormChange(e) {
    const selectedStage = e.target.value
    setNewStage(selectedStage)
  }
  
  return (
    <>
      <div data-testid={`manage-card-popup-${childArgs?.item.action}`} aria-hidden="true" hidden={!showModal} id="popup-modal" className="popup-styling">
        <div className="relative w-full max-w-md max-h-full">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <button data-testid="manage-card-popup-close-btn" onClick={onClose} type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="popup-modal">
              <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
            <div className="p-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto mb-4 text-green-400 w-12 h-12 dark:text-green-200">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
              <div className="modal-message">
                <h3 data-testid="card-title" className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Manage Card</h3>
                <div className="text-left">
                  <h6 data-testid="card-name">{formatCardName(card.cardId, activity?.name)}</h6>
                  {activity?.name !== 'Quran' &&
                    <h6 data-testid="card-instructions">Instructions: {formatCardInstructions(formatCardName(card.cardId, activity?.name))}</h6>
                  }
                  <hr />
                  <div data-testid="card-owner-info" className="my-5">
                    <h6>Owner: {userInfo.firstName} {userInfo.lastName}</h6>
                    <h6>Activity: {activity.name}</h6>
                    <h6>Created On: {card.addedOn}</h6>
                    <h6>Last updated: {card.lastUpdatedOn || 'Never'}</h6>
                    <h6>Next show date: {card.nextShowDate || 'Never'}</h6>
                  </div>
                  <hr />
                  <div data-testid="card-stage-management" className="my-5">
                    <h6 className="mb-2">Current status: {card.completionStatus}</h6>
                    {childArgs?.item.action === 'override' ? 
                      <form className="max-w-md mx-auto" onChange={handleOverrideFormChange}>
                        <label htmlFor="countries" className="block mb-2 text-md font-small text-gray-900 dark:text-white">Override current stage: <b>{card.stage}</b></label>
                        <select data-testid="override-stge-form" id="newStage" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                          <option>0</option>
                          <option>1</option>
                          <option>3</option>
                          <option>7</option>
                          <option>15</option>
                          <option>30</option>
                        </select>
                      </form>
                      : 
                      <h6>Current Stage: {card.stage}</h6>
                    }
                  </div>
                </div>
                {(isMain && userInfo?.accountType === 'teacher' || (!isMain && userInfo?.accountType === 'student')) && childArgs?.item.action === 'override' &&
                  <div className="delete-actions mt-5">
                    <button 
                      data-testid="override-stage-btn"
                      onClick={overrideStage} 
                      data-modal-hide="popup-modal" 
                      type="submit" 
                      className="green-btn mr-2">
                        Override Stage
                    </button>
                  </div>
                }
                {(isMain && userInfo?.accountType === 'teacher' || (!isMain && userInfo?.accountType === 'student')) && childArgs?.item.action === 'delete' &&
                  <div className="delete-actions mt-5">
                    <button 
                      data-testid='delete-card-btn'
                      onClick={removeCard} 
                      data-modal-hide="popup-modal" 
                      type="button" 
                      className="green-btn mr-2">
                        Delete card
                    </button>
                  </div>
                }
                {(isMain && userInfo?.accountType === 'teacher' || (!isMain && userInfo?.accountType === 'student')) && childArgs?.item.action === 'activate' &&
                  <div className="activate-actions mt-5">
                    <button 
                      data-testid='activate-card-btn'
                      onClick={activate} 
                      data-modal-hide="popup-modal" 
                      type="button" 
                      className="green-btn mr-2">
                        Activate card
                    </button>
                  </div>
                }
                {(isMain && userInfo?.accountType === 'teacher' || (!isMain && userInfo?.accountType === 'student')) && childArgs?.item.action === 'edit' &&
                  
                  <div className="teacher-actions">
                    <button 
                      data-testid="reset-stage-btn"
                      onClick={resetStage} 
                      data-modal-hide="popup-modal" 
                      type="button" 
                      className="green-btn mr-2">
                        Reset Stage
                    </button>
                    <button 
                      data-testid="promote-stage-btn"
                      disabled={false}  //TODO - revert to card.completionStatus === completed once pending reset automatically
                      onClick={async () => await submitEditStage(true)} 
                      data-modal-hide="popup-modal" 
                      type="button" 
                      className="green-btn mr-2">
                        Promote
                    </button>

                    <button 
                      data-testid="demote-stage-btn"
                      disabled={false} //TODO - revert to card.completionStatus === completed once pending reset automatically
                      onClick={async () => await submitEditStage(false)} 
                      data-modal-hide="popup-modal" 
                      type="button" 
                      className="green-btn mr-2">
                        Demote
                    </button>
                  </div>
                }

                {isMain && userInfo?.accountType === 'student' && childArgs.item.action !== 'show' &&
                  <div className="student-actions">
                    <button 
                      disabled={[CompletionStatus.COMPLETED, CompletionStatus.REVIEW].includes(card.completionStatus)}
                      onClick={submitForReview} 
                      data-testid="submit-review-btn"
                      data-modal-hide="popup-modal" 
                      type="button" 
                      className={[CompletionStatus.COMPLETED, CompletionStatus.REVIEW].includes(card.completionStatus) ? 'disabled-btn mr-2' : 
                      'green-btn'}>
                        {[CompletionStatus.COMPLETED, CompletionStatus.REVIEW].includes(card.completionStatus) ? 'Already submitted for review' : 'Submit for review'}
                    </button>
                  </div>
                }
                
              </div>
              <div className="mt-5">
                <button onClick={onClose} data-modal-hide="popup-modal" type="button" className="neutral-btn">Cancel</button>
              </div>
              <p data-testid="status-message">{statusMessage}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
