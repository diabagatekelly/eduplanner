import { useState, FormEvent, useEffect } from "react";
import { findUser } from "../api/controller";
import SearchUserForm from "./search-user-form";
import store from "../store";
import Popup from "./popups/popup";

const AddStudent = () => {
  let args;
  const [formData, setFormData] = useState({
    email: ""
  });

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [user, getUserData] = useState({ ...args });
  const [newStudent, getData] = useState({ ...args });
  const [showModal, setShowModal] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false)
  const [formSuccessMessage, setFormSuccessMessage] = useState("")

  const modalType = 'addStudent';
  const isMain = false;

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
        email: ""
      });
      setFormSuccessMessage("")
    }, 3000)
  }

  async function submitForm(e: FormEvent<HTMLFormElement>) {
    // We don't want the page to refresh
    e.preventDefault()
    setIsLoading(true) // Set loading to true when the request starts

    try {
      const rawFormData = new FormData(e.currentTarget)
      const jsonData = { email: '' }

      for (const pair of rawFormData.entries()) {
        jsonData[pair[0]] = `${pair[1]}`;
      }

      if (jsonData.email === user.email) {
        setFormSuccess(false)
        setFormSuccessMessage("You can't add yourself as a student.");
        reset()
        return;
      }

      const options = {
        params: {
          email: jsonData.email
        }
      }

      const response = await findUser(options)
        .then(async (response) => {
          setIsLoading(false)
          if (response.status !== 200) {
            setFormSuccess(false)
            setFormSuccessMessage(response.data.message)
            reset()
          } else {
            setFormSuccess(true);
            if (user.studentIds && user.studentIds.includes(response.data.email)) {
              setFormSuccessMessage('This is already one of your students.')
              reset()
            } else {
              getData(response.data)
              setShowModal(true)
              reset()
            }
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
      <h3 className="text-3xl py-3 font-bold">Add a new student:</h3>
      <p>Enter your student&#39;s email:</p>
      <SearchUserForm {...{ handleInput, formData, isLoading, submitForm }} />
      <Popup {...{ showModal, modalType, isMain, newStudent}} onClose={() => setShowModal(false)} />
      <div>{formSuccessMessage}</div>
    </div>
  )
}

export default AddStudent;