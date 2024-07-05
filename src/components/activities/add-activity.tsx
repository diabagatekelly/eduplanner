"use client"

import { useState, FormEvent } from "react";
import { createActivity } from "../../api/controller";
import AddActivityForm from "../forms/add-activity-form";
import { useDispatch } from "react-redux";
import { createUserActivity } from "../../store/actions/userActions";
import { IActivity, IActivityFormData } from "../../interfaces/IActivity";
import { CompletionStatus } from "@/interfaces/CompletionStatusEnum";
import { ISODateString } from "@/interfaces/isoDateType";
import { IUser } from "@/interfaces/IUser";
import { toDbFormat } from "@/utils/formatActivityName";
import { IResponse } from "@/interfaces/IApiResponse";

interface IAddActivity {
  handleInput: (e: React.FormEvent<HTMLInputElement>) => void,
  submitForm: (e: FormEvent<HTMLFormElement>) => Promise<void>
}

export default function AddActivity<IAddActivity>({ userDetails }: {userDetails: IUser}) {
  const dispatch = useDispatch()

  const [formData, setFormData] = useState<IActivityFormData>({
    name: "",
    description: "",
    points: 0,
    hasCards: ""
  });

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [formSubmitOutcomeMessage, setFormSubmitOutcomeMessage] = useState("")

  function handleInput(e: React.FormEvent<HTMLInputElement>) {
    if (formSubmitOutcomeMessage.length) {
      setFormSubmitOutcomeMessage('')
    }

    const target = e.target as HTMLInputElement
    const fieldName: string = target.name;
    const fieldValue: any = target.value;

    setFormData((prevState) => ({
      ...prevState,
      [fieldName]: fieldValue
    }));
  }

  function _resetForm() {
    setFormData({
      name: "",
      description: "",
      points: 0,
      hasCards: ""
    });
    setIsLoading(false)
  }

  async function submitForm(e: FormEvent<HTMLFormElement>): Promise<void> {
    try {
      // We don't want the page to refresh
      e.preventDefault()
      setIsLoading(true) // Set loading to true when the request starts

      const formData = new FormData(e.currentTarget)
      const activityFormInfo: IActivityFormData = { name: '', description: '', points: 0, hasCards: '' }

      for (const pair of formData.entries()) {
        activityFormInfo[pair[0]] = `${pair[1]}`;
      }

      if (userDetails.activities.find(activity => activity.name === activityFormInfo.name)) {
        setFormSubmitOutcomeMessage("This is already one of your activities.");
        _resetForm()
        return;
      }

      const dbActivityName = toDbFormat(activityFormInfo.name)

      const userActivity: IActivity = {
        ...activityFormInfo,
        activityId: btoa(`${userDetails.email}-${dbActivityName}`),
        name: dbActivityName,
        points: Number(activityFormInfo.points),
        completionStatus: CompletionStatus.PENDING,
        hasCards: activityFormInfo.hasCards === 'true' ? true : false,
        createdOn: new Date(Date.now()).toLocaleDateString('en-US', {timeZone: 'EST'}) as ISODateString, 
        lastUpdatedOn: null
      } 

      const response = await createActivity({userActivity, userId: userDetails.userId}) as unknown as IResponse;
      const {data} = response;
      const {message, details}: {message: string, details: {userId: string, userActivity: IActivity}} = data;

      let augmentedDetails = {...details, username: userDetails.username}
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

      const {status, data} = error.response;

      if (status === 500) {
        setFormSubmitOutcomeMessage('Failed to create activity due to an internal error. Please try again later.')
      } else {
        setFormSubmitOutcomeMessage(data.message)
      }
    }
  }
  

  return (
    <div className="justify-items-start">
      <h3 className="text-3xl py-3 font-bold">Add a new activity:</h3>
      <AddActivityForm {...{ handleInput, formData, isLoading, submitForm }} />
      <div data-testid="add-activity-submit-message">{formSubmitOutcomeMessage}</div>
      <hr className="my-5" />
    </div>
  )
}
