import { useEffect, useState } from "react";

export default function ValidatePopup({onClose, showModal, ...childArgs}: 
  {
    onClose: any,
    showModal: boolean,
    item?: any,
    determineShouldProceed?: any,
    setFormSubmitOutcomeMessage?: any,
    setFinalCardList?: any
  }) {

  const [itemsToValidate, getItemsToValidate] = useState('')
 
  useEffect(() => {
    const items: string = childArgs?.item.list;
    getItemsToValidate(items)
  }, [showModal, childArgs])

  function validate() {
    childArgs?.determineShouldProceed('yes')
    childArgs?.setFormSubmitOutcomeMessage('Successful validation, now you can create your cards.')
    childArgs?.setFinalCardList(itemsToValidate)
    onClose()
  }

  function cancel() {
    childArgs?.setFormSubmitOutcomeMessage('Validation canceled.')
    onClose()
  }

  return (
    <>
      <div data-testid="validate-popup" hidden={!showModal} id="popup-modal" className="popup-styling">
        <div className="relative w-full max-w-md max-h-full">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <button data-testid="validate-popup-x-icon" onClick={cancel} type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="popup-modal">
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
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Is this the correct list of cards you want to create?</h3>
                <h5 className="mb-5"><span>{itemsToValidate} </span></h5>
              </div>

              <button data-testid="validate-btn" onClick={validate} data-modal-hide="popup-modal" type="button" className="green-btn mr-2">
                Yes, I&#39;m sure
              </button>
              <button data-testid="validate-popup-close-btn" onClick={cancel} data-modal-hide="popup-modal" type="button" className="neutral-btn">No, cancel</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}