import { CheckBadgeIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { toast } from 'sonner'

export default function ValidatePopup({
  onClose,
  showModal,
  item,
  submitList,
}: {
  onClose: () => void
  showModal: boolean
  item: { list: string }
  submitList: (list: string) => void
}) {
  function validate() {
    submitList(item.list)
    onClose()
  }

  function cancel() {
    toast.info('Validation canceled.')
    onClose()
  }

  return (
    <>
      <div
        data-testid="validate-popup"
        hidden={!showModal}
        id="popup-modal"
        className="popup-styling"
      >
        <div className="relative w-full max-w-md max-h-full">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <button
              data-testid="validate-popup-x-icon"
              onClick={cancel}
              type="button"
              className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              data-modal-hide="popup-modal"
            >
              <XMarkIcon
                title="Close modal"
                className="w-6 h-6"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <span className="sr-only">Close modal</span>
            </button>
            <div className="p-6 text-center">
              <CheckBadgeIcon
                fill="none"
                strokeWidth={1}
                stroke="currentColor"
                className="mx-auto mb-4 text-green-400 w-12 h-12 dark:text-green-200"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <div className="modal-message">
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                  Is this the correct list of cards you want to create?
                </h3>
                <h5 className="mb-5">
                  <span>{item.list} </span>
                </h5>
              </div>

              <button
                data-testid="validate-btn"
                onClick={validate}
                data-modal-hide="popup-modal"
                type="button"
                className="green-btn mr-2"
              >
                Yes, I&#39;m sure. Create Cards.
              </button>
              <button
                data-testid="validate-popup-close-btn"
                onClick={cancel}
                data-modal-hide="popup-modal"
                type="button"
                className="neutral-btn"
              >
                No, cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
