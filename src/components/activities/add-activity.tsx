'use client'

import { useState, FormEvent } from 'react'
import { createActivity } from '../../api/controller'
import AddActivityForm from '../forms/add-activity-form'
import { useDispatch } from 'react-redux'
import { createUserActivity } from '../../store/actions/userActions'
import { IActivity, IActivityFormData } from '../../types/IActivity'
import { CompletionStatus } from '@/types/CompletionStatusEnum'
import { ISODateString } from '@/types/isoDateType'
import { IUser } from '@/types/IUser'
import { toDbFormat } from '@/lib/helpers/formatActivityName'
import { IResponse } from '@/types/IApiResponse'

interface IAddActivity {
  handleInput: (e: React.FormEvent<HTMLInputElement>) => void
  submitForm: (e: FormEvent<HTMLFormElement>) => Promise<void>
}

export default function AddActivity<IAddActivity>({ userDetails }: { userDetails: IUser }) {
  const dispatch = useDispatch()

  const [formData, setFormData] = useState<IActivityFormData>({
    name: '',
    description: '',
    points: 0,
    hasCards: '',
  })

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [formSubmitOutcomeMessage, setFormSubmitOutcomeMessage] = useState('')

  function handleInput(e: React.FormEvent<HTMLInputElement>) {
    if (formSubmitOutcomeMessage.length) {
      setFormSubmitOutcomeMessage('')
    }

    const target = e.target as HTMLInputElement
    const fieldName: string = target.name
    const fieldValue: any = target.value

    setFormData((prevState) => ({
      ...prevState,
      [fieldName]: fieldValue,
    }))
  }

  function _resetForm() {
    setFormData({
      name: '',
      description: '',
      points: 0,
      hasCards: '',
    })
    setIsLoading(false)
  }

  async function submitForm(e: FormEvent<HTMLFormElement>): Promise<void> {
    try {
      // We don't want the page to refresh
      e.preventDefault()
      setIsLoading(true) // Set loading to true when the request starts

      const formData = new FormData(e.currentTarget)
      const activityFormInfo: IActivityFormData = {
        name: '',
        description: '',
        points: 0,
        hasCards: '',
      }

      for (const pair of formData.entries()) {
        activityFormInfo[pair[0]] = `${pair[1]}`
      }

      if (userDetails.activities.find((activity) => activity.name === activityFormInfo.name)) {
        setFormSubmitOutcomeMessage('This is already one of your activities.')
        _resetForm()
        return
      }

      const dbActivityName = toDbFormat(activityFormInfo.name)

      const userActivity: IActivity = {
        ...activityFormInfo,
        activityId: btoa(`${userDetails.email}-${dbActivityName}`),
        name: dbActivityName,
        points: Number(activityFormInfo.points),
        completionStatus: CompletionStatus.PENDING,
        hasCards: activityFormInfo.hasCards === 'true' ? true : false,
        createdOn: new Date(Date.now()).toLocaleDateString('en-US', {
          timeZone: 'EST',
        }) as ISODateString,
        lastUpdatedOn: null,
      }

      const response = (await createActivity({
        userActivity,
        userId: userDetails.userId,
      })) as unknown as IResponse
      const { data } = response
      const {
        message,
        details,
      }: { message: string; details: { userId: string; userActivity: IActivity } } = data

      let augmentedDetails = { userActivity: details.userActivity, username: userDetails.username }
      dispatch(createUserActivity(augmentedDetails))
      setFormSubmitOutcomeMessage(message)
      _resetForm()
      window.location.reload()
    } catch (error) {
      setIsLoading(false)
      console.log(error)

      if (!error.response) {
        setFormSubmitOutcomeMessage('Server is down. Try again later.')
        return
      }

      const { status, data } = error.response

      if (status === 500) {
        setFormSubmitOutcomeMessage(
          'Failed to create activity due to an internal error. Please try again later.'
        )
      } else {
        setFormSubmitOutcomeMessage(data.message)
      }
    }
  }

  return (
    <div className="justify-items-start">
      <h3 className="component-sub-title">Add a new activity:</h3>
      <div>
        <h6 className="text-1xl py-3 font-bold">Instructions on naming activity:</h6>
        <p>
          <span className="font-bold">For Quran: </span>Quran
        </p>
        <p>
          <span className="font-bold">For language: </span>(Target language) Language, ie. Arabic
          Language
        </p>
        <p>
          <span className="font-bold">Any other subject: </span>A name that isn&#39;t
          &#39;Quran&#39; and doesn&#39;t contain &#39;Language&#39;
        </p>
      </div>
      <AddActivityForm {...{ handleInput, formData, isLoading, submitForm }} />
      <div data-testid="add-activity-submit-message">{formSubmitOutcomeMessage}</div>
      <hr className="my-5" />
    </div>
  )
}
