"use client"

import NestedLayout from "@/app/nested-layout";
import store from "@/app/store";
import { useEffect, useState, FormEvent } from "react"
import axios from "axios";
import { useDispatch } from "react-redux";
import { addNewStudent } from "@/app/actions/userActions";
import {useRouter } from "next/navigation";

const addStudent = (user, sendStudentData) => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: ""
  });

  const url = 'http://localhost:8080/user'
  // const url = `${process.env.NEXT_BASE_URL}/user`

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

  async function submitForm(e: FormEvent<HTMLFormElement>) {
    // We don't want the page to refresh
    e.preventDefault()
    setIsLoading(true) // Set loading to true when the request starts

    try {
      const rawFormData = new FormData(e.currentTarget)
      const jsonData = {username: ''}

      for (const pair of rawFormData.entries()) {
        jsonData[pair[0]] = `${pair[1]}`;
      }

      const response = await axios.get(
        url, 
        {
          params: {
            username: jsonData.username
          }
        }
        
      ).then(async (response) => {
        setIsLoading(false)
        if (response.status !== 200) {
          setFormSuccess(false)
          setFormSuccessMessage(response.data.message)
        } else {
          
          setFormData({
            username: ""
          });
          setFormSuccess(true);
          
          if (user.studentIds && user.studentIds.includes(response.data.username)) {
            setFormSuccessMessage('This is already one of your students.')
          } else {
            sendStudentData(response.data)
            setFormSuccessMessage('Successfully added a new student')
            router.refresh()
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

    }
  }

  return (
    <div className="sm:max-w-sm">
      <form className="space-y-6" onSubmit={submitForm} method="POST">
        <input onChange={handleInput} value={formData.username} id="username" name="username" type="text" autoComplete="username" required className="inline-block  rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
        <span>
          <button type="submit" disabled={isLoading} className="ml-2 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">{isLoading ? 'Loading...' : 'Sign In'}</button>
        </span>
      </form>

      <div>{formSuccessMessage}</div>
    </div>
  )
}

const StudentsContent = ({user, sendStudentData}) => {

  return (
    <div className="flex flex-col px-3">
      <div className="justify-items-start">
        <h3 className="text-3xl py-3 font-bold">Add a new student:</h3>
        <p>Enter your studen't username.</p>
        {addStudent(user, sendStudentData)}
      </div>
      <hr className="mt-4"></hr>
      <div className="justify-items-start">
        <h3 className="text-3xl py-3 font-bold">Current Students</h3>
        {user.studentIds ?
          <ul>
            {user.studentIds.map((student) => (
              <li key={student}>{student}</li>
            ))}
          </ul> : <p>You have no active students.</p>}
      </div>
    </div>
  )
}

export default function Students() {
  let args;
  const dispatch = useDispatch()
  const [user, getUserData] = useState({ ...args })

  const sendStudentData = (data) => {
    dispatch(addNewStudent(data));
  } 

  useEffect(() => {
    const { userReducer } = store.getState()
    getUserData(userReducer);
  })

  const username = user.username
  const isTeacher = user.accountType?.includes('teacher')

  return (
    <NestedLayout {...{ username, isTeacher }}>
      <StudentsContent {...{user, sendStudentData}} />
    </NestedLayout>
  )
}



