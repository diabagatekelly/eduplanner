import { useState, FormEvent, useEffect } from "react";
import { createActivity } from "../api/controller";
import SearchUserForm from "./search-user-form";
import store from "../store";
import Popup from "./popup";
import { usePathname, useSearchParams } from 'next/navigation'
import AddActivityForm from "./add-activity-form";
import { useDispatch } from "react-redux";
import { createUserActivity } from "../actions/userActions";
import { IActivity } from "../interfaces/IActivity";

const AddActivity = () => {
  const dispatch = useDispatch()
  const pathName = usePathname()
  
  let args;
  const [formData, setFormData] = useState<IActivity>({
    name: "",
    description: "",
    points: 0,
    hasDecks: ""
  });

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [user, getUserData] = useState({ ...args });
  const [formSuccess, setFormSuccess] = useState(false)
  const [formSuccessMessage, setFormSuccessMessage] = useState("")


  useEffect(() => {
    const { userReducer } = store.getState()
    getUserData(userReducer);
  }, [])

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
        hasDecks: ""
      });
      setFormSuccessMessage("")
    }, 3000)
  }

  const getUserEmail = () => {
    const isMain = pathName.includes(user.username)
    if (isMain) {
      return user.email
    } else {
      ''
    }
  }

  async function submitForm(e: FormEvent<HTMLFormElement>): Promise<any> {
    // We don't want the page to refresh
    e.preventDefault()
    setIsLoading(true) // Set loading to true when the request starts

    try {
      const rawFormData = new FormData(e.currentTarget)
      const jsonData = { name: '', description: '', points: 0, hasDecks: '' }

      for (const pair of rawFormData.entries()) {
        jsonData[pair[0]] = `${pair[1]}`;
      }

      if (user.activities?.find(activity => activity.name === jsonData.name)) {
        setFormSuccess(false)
        setFormSuccessMessage("This is already one of your activities.");
        reset()
        return;
      }

      const userEmail = getUserEmail()
      const activityName = jsonData.name.trim().split(' ').join('-')

      const options = {
        params: {
          name: activityName,
          description: jsonData.description,
          points: jsonData.points,
          hasDecks: jsonData.hasDecks,
          userEmail: userEmail,
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