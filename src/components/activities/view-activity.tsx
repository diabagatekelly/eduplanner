'use client'

import { useState } from 'react'
import { editActivity, requestCardReview } from '../../api/controller'
import { useAppDispatch } from '@/store/hooks'
import { editUserActivity } from '../../store/actions/userActions'
import ListUi from '@/components/lists/lists-ui'
import { CompletionStatus } from '../../types/CompletionStatusEnum'
import { IActivity } from '@/types/IActivity'
import { IUser } from '@/types/IUser'
import { ISODateString } from '@/types/isoDateType'
import { IResponse } from '@/types/IApiResponse'
import { ICard } from '@/types/ICard'
import { fromDbFormat } from '@/lib/helpers/formatActivityName'

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
  const dispatch = useAppDispatch()
  let args

  const [isLoading, setIsLoading] = useState(false)
  const [formSubmitOutcomeMessage, setFormSubmitOutcomeMessage] = useState('')

  async function submit(): Promise<void> {
    if (
      userActivity.cards?.some(
        (card: ICard) =>
          ![CompletionStatus.COMPLETED, CompletionStatus.INACTIVE].includes(card.completionStatus)
      )
    ) {
      setFormSubmitOutcomeMessage('You still have some cards to complete!!')
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

      await requestCardReview(requestReview)

      const updatedActivity: IActivity = {
        ...userActivity,
        lastUpdatedOn: new Date(Date.now()).toLocaleDateString('en-US', {
          timeZone: 'EST',
        }) as ISODateString,
        completionStatus: CompletionStatus.REVIEW,
      }

      const response = (await editActivity({
        userId: userDetails.userId,
        updatedActivity,
      })) as unknown as IResponse<IActivity>
      const { data } = response
      const { message, details }: { message: string; details: IActivity } = data
      dispatch(editUserActivity({ username: userDetails.username, updatedActivity: details }))

      setIsLoading(false)

      setFormSubmitOutcomeMessage('Request for review successfully sent.')
      window.location.reload()
    } catch (error: any) {
      setIsLoading(false)
      console.log(error)

      if (!error.response) {
        setFormSubmitOutcomeMessage('Server is down. Try again later.')
        return
      }

      const { status, data } = error.response

      if (status === 500) {
        setFormSubmitOutcomeMessage(
          'Failed to request review due to an internal error. Please try again later.'
        )
      } else {
        setFormSubmitOutcomeMessage(data.message)
      }
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

      const response = (await editActivity({
        userId: userDetails.userId,
        updatedActivity,
      })) as unknown as IResponse<IActivity>
      const { data } = response
      const { message, details }: { message: string; details: IActivity } = data
      dispatch(editUserActivity({ username: userDetails.username, updatedActivity: details }))
      setFormSubmitOutcomeMessage(message)
      window.location.reload()
    } catch (error: any) {
      setIsLoading(false)
      console.log(error)

      if (!error.response) {
        setFormSubmitOutcomeMessage('Server is down. Try again later.')
        return
      }

      const { status, data } = error.response

      if (status === 500) {
        setFormSubmitOutcomeMessage(
          'Failed to edit activity due to an internal error. Please try again later.'
        )
      } else {
        setFormSubmitOutcomeMessage(data.message)
      }
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
      <p data-testid="update-activity-outcome">{formSubmitOutcomeMessage}</p>
      <hr className="my-5" />
      {userActivity?.hasCards && (
        <div>
          <ListUi {...{ listType: 'cards', isMain, userDetails, activity: userActivity }} />
        </div>
      )}
    </>
  )
}
