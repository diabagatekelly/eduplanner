import { useEffect, useState } from 'react'
import {
  useEditCard,
  useEditCardStage,
  useResetCardStage,
  useActivateCard,
  useDeleteCard,
  useRequestCardReview,
} from '@/hooks/use-card-mutations'
import { ICard } from '@/types/ICard'
import { IUser } from '@/types/IUser'
import { CompletionStatus } from '@/types/CompletionStatusEnum'
import { ACTIVITY_TYPES } from '@/lib/constants/activityTypes'
import { CARD_ACTIVITY_TYPES } from '@/lib/constants/cardTypes'
import { IActivity } from '@/types/IActivity'
import formatCardName from '@/lib/helpers/formatCardName'
import { ClipboardDocumentCheckIcon, XMarkIcon } from '@heroicons/react/24/solid'

export default function ManageCardPopup({
  onClose,
  showModal,
  isMain,
  user,
  item,
  activity: activityProp,
}: {
  onClose: () => void
  showModal: boolean
  isMain: boolean
  user?: IUser | Partial<IUser>
  activity?: IActivity
  item?: { card: ICard; action: string }
}) {
  const userId = user?.userId ?? ''
  const editCardMutation = useEditCard(userId)
  const editCardStageMutation = useEditCardStage(userId)
  const resetCardStageMutation = useResetCardStage(userId)
  const activateCardMutation = useActivateCard(userId)
  const deleteCardMutation = useDeleteCard(userId)
  const requestReviewMutation = useRequestCardReview()

  const [userInfo, getUserInfo] = useState<IUser | Partial<IUser>>({ ...user })
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const [card, getCardDetails] = useState<ICard>({ ...item!.card })
  const [activity, getActivityDetails] = useState<IActivity>({ ...activityProp } as IActivity)
  const [statusMessage, setStatusMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [newStage, setNewStage] = useState('')

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    getCardDetails(item!.card)
    getUserInfo({ ...user })
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    getActivityDetails(activityProp!)
  }, [showModal, user, item, activityProp, statusMessage, newStage])

  async function resetStage() {
    try {
      await resetCardStageMutation.mutateAsync({
        activity: activity.name,
        cardId: card.cardId,
      })
      setStatusMessage('Successfully reset card')
    } catch (error: any) {
      setIsLoading(false)
      console.log(error)

      if (!error.response) {
        setStatusMessage('Server is down. Try again later.')
        return
      }

      const { status, data } = error.response

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
        teacherId: userInfo.linkedAccountsData!.teacher!,
        student: {
          id: userInfo.userId!,
          fullName: `${userInfo.firstName} ${userInfo.lastName}`,
          email: userInfo.email!,
        },
      }

      await requestReviewMutation.mutateAsync(requestReview)

      await editCardStageMutation.mutateAsync({
        activity: activity.name,
        cardId: card.cardId,
        editData: {
          completionStatus: CompletionStatus.REVIEW,
        },
      })

      setIsLoading(false)
      setStatusMessage('Request for review successfully sent.')
    } catch (error: any) {
      setIsLoading(false)
      console.log(error)

      if (!error.response) {
        setStatusMessage('Server is down. Try again later.')
        return
      }

      const { status, data } = error.response

      if (status === 500) {
        setStatusMessage(
          'Failed to request review due to an internal error. Please try again later.'
        )
      } else {
        setStatusMessage(data.message)
      }
    }
  }

  async function overrideStage(e: React.MouseEvent<HTMLButtonElement>) {
    try {
      e.preventDefault()
      const response = await editCardMutation.mutateAsync({
        activity: activity.name,
        cardId: card.cardId,
        editData: {
          stage: newStage,
        },
      })
      const { data } = response as { data: { message: string; details: ICard } }
      setStatusMessage('Successfully overrode status.')
      getCardDetails(data.details)
    } catch (error: any) {
      setIsLoading(false)
      console.log(error)

      if (!error.response) {
        setStatusMessage('Server is down. Try again later.')
        return
      }

      const { status, data } = error.response

      if (status === 500) {
        setStatusMessage(
          'Failed to override card stage due to an internal error. Please try again later.'
        )
      } else {
        setStatusMessage(data.message)
      }
    }
  }

  async function submitEditStage(newStageStatus: boolean) {
    try {
      await editCardStageMutation.mutateAsync({
        activity: activity.name,
        cardId: card.cardId,
        editData: {
          stage: card.stage,
          promote: newStageStatus,
        },
      })
      setStatusMessage('Successfully edited status.')
    } catch (error: any) {
      setIsLoading(false)
      console.log(error)

      if (!error.response) {
        setStatusMessage('Server is down. Try again later.')
        return
      }

      const { status, data } = error.response

      if (status === 500) {
        setStatusMessage(
          'Failed to update card status due to an internal error. Please try again later.'
        )
      } else {
        setStatusMessage(data.message)
      }
    }
  }

  async function removeCard() {
    try {
      await deleteCardMutation.mutateAsync([
        {
          activity: activity.name,
          cardId: card.cardId,
        },
      ])
      setStatusMessage('Successfully removed card')
    } catch (error: any) {
      setIsLoading(false)
      console.log(error)

      if (!error.response) {
        setStatusMessage('Server is down. Try again later.')
        return
      }

      const { status, data } = error.response

      if (status === 500) {
        setStatusMessage('Failed to remove card due to an internal error. Please try again later.')
      } else {
        setStatusMessage(data.message)
      }
    }
  }

  async function activate() {
    try {
      await activateCardMutation.mutateAsync({
        activity: activity.name,
        cardId: card.cardId,
      })
      setStatusMessage('Successfully activated card')
    } catch (error: any) {
      setIsLoading(false)
      console.log(error)

      if (!error.response) {
        setStatusMessage('Server is down. Try again later.')
        return
      }

      const { status, data } = error.response

      if (status === 500) {
        setStatusMessage(
          'Failed to activate card due to an internal error. Please try again later.'
        )
      } else {
        setStatusMessage(data.message)
      }
    }
  }

  function formatCardInstructions(cardName: string) {
    if (cardName.includes(CARD_ACTIVITY_TYPES.VOCAB)) {
      return (
        <>
          <ul>
            <li>1. Recall to / from</li>
            <li>2. Use in spoken sentences</li>
            <li>OPTIONAL: Practice spelling</li>
            <li>OPTIONAL: Use in written sentences</li>
          </ul>
        </>
      )
    } else {
      return 'None'
    }
  }

  function handleOverrideFormChange(e: React.ChangeEvent<HTMLFormElement>) {
    const selectedStage = (e.target as unknown as HTMLSelectElement).value
    setNewStage(selectedStage)
  }

  return (
    <>
      <div
        data-testid={`manage-card-popup-${item?.action}`}
        aria-hidden="true"
        hidden={!showModal}
        id="popup-modal"
        className="popup-styling"
      >
        <div className="relative w-full max-w-md max-h-full">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <button
              data-testid="manage-card-popup-close-btn"
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
              <ClipboardDocumentCheckIcon
                fill="none"
                strokeWidth={1}
                stroke="currentColor"
                className="mx-auto mb-4 text-green-400 w-12 h-12 dark:text-green-200"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <div className="modal-message">
                <h3
                  data-testid="card-title"
                  className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400"
                >
                  Manage Card
                </h3>
                <div className="text-left">
                  <h6 data-testid="card-name">{formatCardName(card.cardId, activity?.name)}</h6>
                  {activity?.name !== ACTIVITY_TYPES.QURAN && (
                    <h6 data-testid="card-instructions">
                      Instructions:{' '}
                      {formatCardInstructions(formatCardName(card.cardId, activity?.name))}
                    </h6>
                  )}
                  <hr />
                  <div data-testid="card-owner-info" className="my-5">
                    <h6>
                      Owner: {userInfo.firstName} {userInfo.lastName}
                    </h6>
                    <h6>Activity: {activity.name}</h6>
                    <h6>Created On: {card.addedOn}</h6>
                    <h6>Last updated: {card.lastUpdatedOn || 'Never'}</h6>
                    <h6>Next show date: {card.nextShowDate || 'Never'}</h6>
                  </div>
                  <hr />
                  <div data-testid="card-stage-management" className="my-5">
                    <h6 className="mb-2">Current status: {card.completionStatus}</h6>
                    {item?.action === 'override' ? (
                      <form className="max-w-md mx-auto" onChange={handleOverrideFormChange}>
                        <label
                          htmlFor="countries"
                          className="block mb-2 text-md font-small text-gray-900 dark:text-white"
                        >
                          Override current stage: <b>{card.stage}</b>
                        </label>
                        <select
                          data-testid="override-stge-form"
                          id="newStage"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        >
                          <option>0</option>
                          <option>1</option>
                          <option>3</option>
                          <option>7</option>
                          <option>15</option>
                          <option>30</option>
                        </select>
                      </form>
                    ) : (
                      <h6>Current Stage: {card.stage}</h6>
                    )}
                  </div>
                </div>
                {((isMain && userInfo?.accountType === 'teacher') ||
                  (!isMain && userInfo?.accountType === 'student')) &&
                  item?.action === 'override' && (
                    <div className="delete-actions mt-5">
                      <button
                        data-testid="override-stage-btn"
                        onClick={overrideStage}
                        data-modal-hide="popup-modal"
                        type="submit"
                        className="green-btn mr-2"
                      >
                        Override Stage
                      </button>
                    </div>
                  )}
                {((isMain && userInfo?.accountType === 'teacher') ||
                  (!isMain && userInfo?.accountType === 'student')) &&
                  item?.action === 'delete' && (
                    <div className="delete-actions mt-5">
                      <button
                        data-testid="delete-card-btn"
                        onClick={removeCard}
                        data-modal-hide="popup-modal"
                        type="button"
                        className="green-btn mr-2"
                      >
                        Delete card
                      </button>
                    </div>
                  )}
                {((isMain && userInfo?.accountType === 'teacher') ||
                  (!isMain && userInfo?.accountType === 'student')) &&
                  item?.action === 'activate' && (
                    <div className="activate-actions mt-5">
                      <button
                        data-testid="activate-card-btn"
                        onClick={activate}
                        data-modal-hide="popup-modal"
                        type="button"
                        className="green-btn mr-2"
                      >
                        Activate card
                      </button>
                    </div>
                  )}
                {((isMain && userInfo?.accountType === 'teacher') ||
                  (!isMain && userInfo?.accountType === 'student')) &&
                  item?.action === 'edit' && (
                    <div className="teacher-actions">
                      <button
                        data-testid="reset-stage-btn"
                        onClick={resetStage}
                        data-modal-hide="popup-modal"
                        type="button"
                        className="green-btn mr-2"
                      >
                        Reset Stage
                      </button>
                      <button
                        data-testid="promote-stage-btn"
                        disabled={false} //TODO - revert to card.completionStatus === completed once pending reset automatically
                        onClick={async () => await submitEditStage(true)}
                        data-modal-hide="popup-modal"
                        type="button"
                        className="green-btn mr-2"
                      >
                        Promote
                      </button>

                      <button
                        data-testid="demote-stage-btn"
                        disabled={false} //TODO - revert to card.completionStatus === completed once pending reset automatically
                        onClick={async () => await submitEditStage(false)}
                        data-modal-hide="popup-modal"
                        type="button"
                        className="green-btn mr-2"
                      >
                        Demote
                      </button>
                    </div>
                  )}

                {isMain && userInfo?.accountType === 'student' && item?.action !== 'show' && (
                  <div className="student-actions">
                    <button
                      disabled={[CompletionStatus.COMPLETED, CompletionStatus.REVIEW].includes(
                        card.completionStatus
                      )}
                      onClick={submitForReview}
                      data-testid="submit-review-btn"
                      data-modal-hide="popup-modal"
                      type="button"
                      className={
                        [CompletionStatus.COMPLETED, CompletionStatus.REVIEW].includes(
                          card.completionStatus
                        )
                          ? 'disabled-btn mr-2'
                          : 'green-btn'
                      }
                    >
                      {[CompletionStatus.COMPLETED, CompletionStatus.REVIEW].includes(
                        card.completionStatus
                      )
                        ? 'Already submitted for review'
                        : 'Submit for review'}
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-5">
                <button
                  onClick={onClose}
                  data-modal-hide="popup-modal"
                  type="button"
                  className="neutral-btn"
                >
                  Cancel
                </button>
              </div>
              <p data-testid="status-message">{statusMessage}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
