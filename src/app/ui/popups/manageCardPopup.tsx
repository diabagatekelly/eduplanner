import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { removeUserCard } from "@/app/actions/userActions";
import { editCardStage } from "../../api/controller";
import store from "@/app/store";

const ManageCardPopup = ({onClose, showModal, ...childArgs}) => {
  const dispatch = useDispatch()
  let args;

  const [userInfo, getUserInfo] = useState({ ...args });
  const [card, getCardDetails] = useState({...childArgs});
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [formSuccess, setFormSuccess] = useState(false)

  useEffect(() => {
    const cardDetails = childArgs.item
    getCardDetails(cardDetails)

    const { userReducer } = store.getState()
    getUserInfo(userReducer);
  }, [showModal, childArgs, card])

  function resetStage(event: any): void {
    throw new Error("Function not implemented.");
  }

  function promoteToNextStage(): void {
    submitEditStage(true)
  }

  function demoteToFirstStage(): void {
    submitEditStage(false)
  }

  function submitForReview(event: any): void {
    throw new Error("Function not implemented.");
  }

  async function submitEditStage(newStageStatus) {
    const jsonData = { 
      username: card.username, 
      email: card.email, 
      activityName: card.activityName, 
      completionStatus: card.completionStatus,
      stage: card.stage,
      promote: newStageStatus,
      id: card.id 
    }

    const response = await editCardStage(jsonData)
      .then(async (response) => {
        setIsLoading(false)
        if (response.status !== 200) {
          setFormSuccess(false)
          setStatusMessage(response.data.message)
        } else {
          setFormSuccess(true);
          dispatch(removeUserCard(response.data))
          reset();
        }
      })
  }

  function reset() {
    window.location.reload()
  }
  
  return (
    <>
      <dialog open={showModal} id="popup-modal" className="fixed top-0 left-0 right-0 z-50 overflow-x-hidden overflow-y-auto md:inset-0 max-h-full border-4 border-gray-800 rounded-lg">
        <div className="relative w-full max-w-md max-h-full">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <button onClick={onClose} type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="popup-modal">
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
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Manage Card</h3>
                <div className="text-left">
                  <h6>Front: {card.front}</h6>
                  <h6>Back: {card.back}</h6>
                  <hr />
                  <h6>Owner: {card.username}</h6>
                  <h6>Activity: {card.activityName || card.activity}</h6>
                  <h6>Created On: {new Date(card.createdOn).toDateString()}</h6>
                  <hr />
                  <h6>Current Stage: {card.stage}</h6>
                  <h6>Current Status: {card.completionStatus}</h6>
                </div>
                {!userInfo?.teacherId && 
                  <div className="teacher-actions">
                    <button 
                      disabled={card.completionStatus === 'completed'}
                      onClick={resetStage} 
                      data-modal-hide="popup-modal" 
                      type="button" 
                      className="text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2">
                        Reset Stage
                    </button>

                    <button 
                      disabled={card.completionStatus === 'completed'}
                      onClick={promoteToNextStage} 
                      data-modal-hide="popup-modal" 
                      type="button" 
                      className="text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2">
                        Promote
                    </button>

                    <button 
                      disabled={card.completionStatus === 'completed'}
                      onClick={demoteToFirstStage} 
                      data-modal-hide="popup-modal" 
                      type="button" 
                      className="text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2">
                        Demote
                    </button>
                  </div>
                }

                {userInfo?.teacherId && 
                  <div className="student-actions">
                    <button 
                      disabled={card.completionStatus === 'completed'}
                      onClick={submitForReview} 
                      data-modal-hide="popup-modal" 
                      type="button" 
                      className="text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2">
                        Submit for Review
                    </button>
                  </div>
                }
                
              </div>
              <button onClick={onClose} data-modal-hide="popup-modal" type="button" className="text-white-500 bg-red hover:bg-red-100 focus:ring-4 focus:outline-none focus:ring-red-200 rounded-lg border border-red-200 text-sm font-medium px-5 py-2.5 hover:text-red-900 focus:z-10 dark:bg-red-700 dark:text-white-300 dark:border-red-500 dark:hover:text-black dark:hover:bg-gray-600 dark:focus:ring-red-600">Cancel</button>
              <p>{statusMessage}</p>
            </div>
          </div>
        </div>
      </dialog>
    </>
  )
}

export default ManageCardPopup;