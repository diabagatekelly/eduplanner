"use client"

import NestedLayout from "@/app/nested-layout";
import store from "@/app/store";
import { useEffect, useState, FormEvent } from "react"
import { useDispatch } from "react-redux";
import { addNewStudent } from "@/app/actions/userActions";
import { useRouter } from "next/navigation";
import Popup from "@/app/ui/modal";
import Link from "next/link";
import { editUser, findUser } from "@/app/api/controller";

const AddStudent = (user, setShowModal, getData) => {
  const [formData, setFormData] = useState({
    email: ""
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
              setShowModal(true)
              getData(response.data)
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
    <div className="sm:max-w-sm">
      <form className="space-y-6" onSubmit={submitForm} method="POST">
        <input onChange={handleInput} value={formData.email} id="email" name="email" type="text" autoComplete="email" required className="inline-block  rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
        <span>
          <button type="submit" disabled={isLoading} className="ml-2 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Find Student</button>
        </span>
      </form>

      <div>{formSuccessMessage}</div>
    </div>
  )
}

const StudentsContent = ({ user, setShowModal, getData }) => {

  return (
    <div className="flex flex-col px-3">
      <div className="justify-items-start">
        <h3 className="text-3xl py-3 font-bold">Add a new student:</h3>
        <p>Enter your student&#39;s email.</p>
        {AddStudent(user, setShowModal, getData)}
      </div>
      <hr className="mt-4"></hr>
      <div className="justify-items-start">
        <h3 className="text-3xl py-3 font-bold">Current Students</h3>
        {user.studentIds ?
          <ul>
            {user.studentIds.map((student) => (
              <Link href={`/${user.username}/students/${student}`} key={student}>{student}</Link>
            ))}
          </ul> : <p>You have no active students.</p>}
      </div>
    </div>
  )
}

export default function Students() {
  let args;
  const dispatch = useDispatch()
  const router = useRouter()
  const [user, getUserData] = useState({ ...args })
  const [showModal, setShowModal] = useState(false);
  const [newStudent, getData] = useState();
  const [errorMessage, setErrorMessage] = useState('')

  const modalNext = async (newStudentData) => {
    try {
      const teacherRawData = { username: user.username, edit: { studentIds: newStudentData.username } }
      const teacherResponse = await editUser(teacherRawData)
        .then(async (response) => {
          if (response.status !== 200) {
            console.log(response)
            setErrorMessage(response.data.message)
          } else {
            const studentRawData = { username: newStudentData.username, edit: { teacherId: user.username } }
            const studentResponse = await editUser(studentRawData)
              .then(async (response) => {
                if (response.status !== 200) {
                  console.log(response)
                  setErrorMessage(response.data.message)
                } else {
                  dispatch(addNewStudent(newStudentData));
                  setErrorMessage('Successfully added a new student')
                  setShowModal(false)
                  const { userReducer } = store.getState()
                  getUserData(userReducer);
                }
              })
          }
        })
    } catch (error) {
      console.error(error)
      if (error.response) {
        setErrorMessage(error.response.data.message)
      }
    }
  }

  useEffect(() => {
    const { userReducer } = store.getState()
    getUserData(userReducer);
  }, [])

  const username = user.username
  const isTeacher = user.accountType?.includes('teacher')
  const messageHeader = 'Are you sure you want to add this student?'
  const student = null;
  const account = newStudent;

  return (
    <NestedLayout {...{ username, student, isTeacher }}>
      <StudentsContent {...{ user, setShowModal, getData }} />
      <Popup {...{ showModal, account, messageHeader, errorMessage }} executeNext={() => modalNext(newStudent)} onClose={() => setShowModal(false)} />
    </NestedLayout>
  )
}



