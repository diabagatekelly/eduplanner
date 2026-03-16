'use client'

import { useEditActivity } from '@/hooks/use-activity-mutations'
import { useRequestCardReview } from '@/hooks/use-card-mutations'
import ListUi from '@/components/lists/lists-ui'
import { CompletionStatus } from '../../types/CompletionStatusEnum'
import { IActivity } from '@/types/IActivity'
import { IUser } from '@/types/IUser'
import { ISODateString } from '@/types/isoDateType'
import { ICard } from '@/types/ICard'
import { fromDbFormat } from '@/lib/helpers/formatActivityName'
import { toast } from 'sonner'
import { handleMutationError } from '@/lib/helpers/mutation-error-handler'

interface IViewActivity {
  submit: () => Promise<void>
}

export default function ViewActivity<IViewActivity>({
  userDetails,
  userActivity,
  isMain,
}: {
  userDetails: IUser
  userActivity: IActivity
  isMain: boolean
}) {
  const editActivityMutation = useEditActivity(userDetails.userId)
  const requestReviewMutation = useRequestCardReview()

  async function submit(): Promise<void> {
    if (
      userActivity.cards?.some(
        (card: ICard) =>
          ![CompletionStatus.COMPLETED, CompletionStatus.INACTIVE].includes(card.completionStatus)
      )
    ) {
      toast.warning('You still have some cards to complete!!')
      return
    }

    if (isMain && userDetails?.accountType === 'student') {
      await _submitForReview()
    } else if (!isMain || (isMain && userDetails?.accountType === 'teacher')) {
      await _updateActivity()
    }
  }

  async function _submitForReview(): Promise<void> {
    try {
      const requestReview = {
        id: userActivity.activityId,
        teacherId: userDetails.linkedAccountsData.teacher!,
        student: {
          id: userDetails.userId,
          fullName: `${userDetails.firstName} ${userDetails.lastName}`,
          email: userDetails.email,
        },
      }

      await requestReviewMutation.mutateAsync(requestReview)

      const updatedActivity: IActivity = {
        ...userActivity,
        lastUpdatedOn: new Date(Date.now()).toLocaleDateString('en-US', {
          timeZone: 'EST',
        }) as ISODateString,
        completionStatus: CompletionStatus.REVIEW,
      }

      await editActivityMutation.mutateAsync(updatedActivity)

      toast.success('Request for review successfully sent.')
    } catch (error: unknown) {
      handleMutationError(error, 'request review')
    }
  }

  async function _updateActivity(): Promise<void> {
    try {
      const updatedActivity: IActivity = {
        ...userActivity,
        lastUpdatedOn: new Date(Date.now()).toLocaleDateString('en-US', {
          timeZone: 'EST',
        }) as ISODateString,
        completionStatus: CompletionStatus.COMPLETED,
      }

      const response = await editActivityMutation.mutateAsync(updatedActivity)
      toast.success(response.data.message)
    } catch (error: unknown) {
      handleMutationError(error, 'edit activity')
    }
  }

  return (
    <>
      <div data-testid="activity-name">
        <h3 className="component-title">{fromDbFormat(userActivity?.name)}</h3>
      </div>
      <div data-testid="activity-details">
        {userActivity?.description !== '' && <p>Description: {userActivity?.description}</p>}
        {userActivity?.points !== 0 && <p>Points: {userActivity?.points} points</p>}
        <p>Status: {userActivity?.completionStatus}</p>
        <p>Last Updated: {userActivity?.lastUpdatedOn?.split('T')[0] || 'Never'}</p>
      </div>

      <button
        data-testid="activity-update-btn"
        disabled={userActivity?.completionStatus === CompletionStatus.COMPLETED}
        type="button"
        className={
          userActivity?.completionStatus !== CompletionStatus.COMPLETED
            ? 'green-btn mr-2'
            : 'disabled-btn mr-2'
        }
        onClick={submit}
      >
        {(!isMain || (isMain && userDetails?.accountType === 'teacher')) &&
          userActivity?.completionStatus === CompletionStatus.COMPLETED &&
          'Already completed'}
        {(!isMain || (isMain && userDetails?.accountType === 'teacher')) &&
          userActivity?.completionStatus !== CompletionStatus.COMPLETED &&
          'Mark completed'}
        {isMain &&
          userDetails?.accountType === 'student' &&
          userActivity?.completionStatus === CompletionStatus.COMPLETED &&
          'Already completed'}
        {isMain &&
          userDetails?.accountType === 'student' &&
          userActivity?.completionStatus !== CompletionStatus.COMPLETED &&
          'Request review'}
      </button>
      <hr className="my-5" />
      {userActivity?.hasCards && (
        <div>
          <ListUi {...{ listType: 'cards', isMain, userDetails, activity: userActivity }} />
        </div>
      )}
    </>
  )
}
