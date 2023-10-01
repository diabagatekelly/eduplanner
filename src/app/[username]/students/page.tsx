"use client"

import NestedLayout from "@/app/nested-layout";
import store from "@/app/store";
import { useEffect, useState, FormEvent } from "react"
import { useDispatch } from "react-redux";
import { addNewStudent, removeStudent } from "@/app/actions/userActions";
import { useRouter } from "next/navigation";
import Popup from "@/app/ui/modal";
import Link from "next/link";
import { findUser, linkAccount, unlinkAccount } from "@/app/api/controller";

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

const StudentsContent = ({ user, setShowModal, getData, openDeleteStudentModal }) => {

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
        {user.studentIds?.length ?
          <ul>
            {user.studentIds.map((student) => (
              <li className="flex justify-between" key={student}>
                <Link href={`/${user.username}/students/${student}`} key={student}>{student}</Link>
                <span onClick={() => openDeleteStudentModal(student)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </span>
              </li>

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
  const [modalType, setModalType] = useState('add')
  const [newStudent, getData] = useState({});
  const [errorMessage, setErrorMessage] = useState('')

  const openDeleteStudentModal = (student) => {
    setModalType('delete')
    const accountInfo = {firstName: '', lastName: '', email: student}
    getData(accountInfo)
    setShowModal(true)
  }

  const modalNext = async (newStudentData) => {
    if (modalType === 'add') {
      try {
        const teacherRawData = { teacher: { email: user.email, addStudent: newStudentData.email } }
        const teacherResponse = await linkAccount(teacherRawData)
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
      } catch (error) {
        console.error(error)
        if (error.response) {
          setErrorMessage(error.response.data.message)
        }
      }
    } else if (modalType === 'delete') {
      try {
        const teacherRawData = { teacher: { email: user.email, addStudent: newStudentData.email } }
        const teacherResponse = await unlinkAccount(teacherRawData)
          .then(async (response) => {
            if (response.status !== 200) {
              console.log(response)
              setErrorMessage(response.data.message)
            } else {
              dispatch(removeStudent(newStudentData.email));
              setErrorMessage('Successfully removed student')
              setShowModal(false)
              const { userReducer } = store.getState()
              getUserData(userReducer);
            }
          })
      } catch (error) {
        console.error(error)
        if (error.response) {
          setErrorMessage(error.response.data.message)
        }
      }
    }
    
  }

  useEffect(() => {
    const { userReducer } = store.getState()
    getUserData(userReducer);
  }, [])

  const username = user.username
  const isTeacher = user.accountType?.includes('teacher')
  const messageHeader = `Are you sure you want to ${modalType} this student?`
  const student = null;
  const account = newStudent;

  return (
    <NestedLayout {...{ username, student, isTeacher }}>
      <StudentsContent {...{ user, setShowModal, getData, openDeleteStudentModal }} />
      <Popup {...{ showModal, account, messageHeader, errorMessage }} executeNext={() => modalNext(newStudent)} onClose={() => setShowModal(false)} />
    </NestedLayout>
  )
}



