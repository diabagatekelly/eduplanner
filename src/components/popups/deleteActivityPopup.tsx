import { useDeleteActivity } from '@/hooks/use-activity-mutations'
import { IUser } from '@/types/IUser'
import { BoltSlashIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { handleMutationError } from '@/lib/helpers/mutation-error-handler'
import { toast } from 'sonner'

export default function DeleteActivityPopup({
  onClose,
  showModal,
  user,
  item,
}: {
  onClose: () => void
  showModal: boolean
  user?: IUser | Partial<IUser>
  item?: { activityName: string }
}) {
  const userId = user?.userId ?? ''
  const deleteActivityMutation = useDeleteActivity(userId)

  async function deleteUserActivity() {
    try {
      if (!userId) throw new Error('Missing userId for deleteActivity')
      await deleteActivityMutation.mutateAsync(item!.activityName)
      toast.success('Successfully deleted activity')
      onClose()
    } catch (error: unknown) {
      handleMutationError(error, 'delete activity')
    }
  }

  return (
    <>
      <div
        data-testid="delete-activity-popup"
        hidden={!showModal}
        id="popup-modal"
        className="popup-styling"
      >
        <div className="relative w-full max-w-md max-h-full">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <button
              data-testid="delete-activity-popup-close-btn"
              onClick={onClose}
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
              <BoltSlashIcon
                fill="none"
                strokeWidth={1}
                stroke="currentColor"
                className="mx-auto mb-4 text-red-400 w-12 h-12 dark:text-red-200"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <div className="modal-message">
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete this activity?
                </h3>
                <h5 className="mb-5">
                  <span>{item?.activityName}</span>
                </h5>
              </div>

              <button
                data-testid="delete-activity-btn"
                onClick={deleteUserActivity}
                data-modal-hide="popup-modal"
                type="button"
                className="green-btn mr-2"
              >
                Yes, I&#39;m sure
              </button>
              <button
                onClick={onClose}
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
