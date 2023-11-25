import { useState, FormEvent, useEffect } from "react";
import { createActivity } from "../api/controller";
import AddActivityForm from "./add-activity-form";
import { useDispatch } from "react-redux";
import { createUserActivity } from "../actions/userActions";
import { IActivity } from "../interfaces/IActivity";

const AddActivity = ({ userDetails }) => {
  const dispatch = useDispatch()

  const [formData, setFormData] = useState<IActivity>({
    name: "",
    description: "",
    points: 0,
    hasCards: ""
  });

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [formSuccess, setFormSuccess] = useState(false)
  const [formSuccessMessage, setFormSuccessMessage] = useState("")

  const handleInput = (e: any) => {
    const fieldName: string = e.target.name;
    const fieldValue: any = e.target.value;

    setFormData((prevState) => ({
      ...prevState,
      [fieldName]: fieldValue
    }));

  }

  const reset = () => {
    setTimeout(() => {
      setFormData({
        name: "",
        description: "",
        points: 0,
        hasCards: ""
      });
      setFormSuccessMessage("")
    }, 3000)
  }


  async function submitForm(e: FormEvent<HTMLFormElement>): Promise<any> {
    // We don't want the page to refresh
    e.preventDefault()
    setIsLoading(true) // Set loading to true when the request starts

    try {
      const rawFormData = new FormData(e.currentTarget)
      const jsonData = { name: '', description: '', points: 0, hasCards: '' }

      for (const pair of rawFormData.entries()) {
        jsonData[pair[0]] = `${pair[1]}`;
      }

      if (userDetails.activities?.find(activity => activity.name === jsonData.name)) {
        setFormSuccess(false)
        setFormSuccessMessage("This is already one of your activities.");
        reset()
        return;
      }

      const activityName = jsonData.name.trim().split(' ').join('-')

      const options = {
        params: {
          name: activityName,
          description: jsonData.description,
          points: jsonData.points,
          hasCards: jsonData.hasCards,
          userEmail: userDetails.email,
          username: userDetails.username,
          completionStatus: 'pending'
        }
      }

      const response = await createActivity(options)
        .then(async (response) => {
          setIsLoading(false)
          if (response.status !== 200) {
            setFormSuccess(false)
            setFormSuccessMessage(response.data.message)
            reset()
          } else {
            setFormSuccess(true);
            dispatch(createUserActivity(response.data))
          }
        })

    } catch (error) {
      console.error(error)
      setIsLoading(false)
      setFormSuccess(false)
      if (error.response) {
        setFormSuccessMessage(error.response.data.message)
      }
      reset()
    }
  }

  return (
    <div className="justify-items-start">
      <h3 className="text-3xl py-3 font-bold">Add a new activty:</h3>
      <AddActivityForm {...{ handleInput, formData, isLoading, submitForm }} />
      <div>{formSuccessMessage}</div>
    </div>
  )
}

export default AddActivity;