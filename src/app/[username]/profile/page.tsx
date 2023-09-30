"use client"

import { resetUser } from "@/app/actions/userActions";
import { deleteUser } from "@/app/api/controller";
import NestedLayout from "@/app/nested-layout";
import store from "@/app/store";
import Popup from "@/app/ui/modal";
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux";
import { useRouter } from 'next/navigation'
import { removeAuthToken } from "@/app/actions/authActions";

const ProfileContent = ({ user }) => {
  const router = useRouter()
  const dispatch = useDispatch()

  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const getStudentListOrTeacher = () => {
    let linkedAccounts = 'None'
    if (user.accountType?.includes('student') && user.teacherId) {
      linkedAccounts = `${user.teacherId} (teacher)`
    } else if (user.accountType?.includes('teacher') && user.studentIds) {
      linkedAccounts = `${user.studentIds?.join(', ')} (students)`
    }
    return linkedAccounts
  }

  const account = user;
  const messageHeader = 'Are you sure you want to delete your account forever?'

  const modalNext = async () => {
    try {
      const userDetails = { email: user.email }
      const response = await deleteUser(userDetails)
        .then(async (response) => {
          if (response.status !== 200) {
            setErrorMessage(response.data.message)
          } else {
            dispatch(resetUser());
            dispatch(removeAuthToken());
            setShowModal(false);
            router.push('/register');
          }
        })
    } catch (error) {
      console.error(error)
      if (error.response) {
        setErrorMessage(error.response.data.message)
      }
    }
  }

  return (
    <div className="flex flex-col px-3">
      <div className="justify-items-start">
        <h2 className="text-4xl py-3 font-bold">Personal Info</h2>
        <div className="personal-info">
          <p className="py-1"><span className="font-bold">First Name:</span> {user.firstName}</p>
          <p className="py-1"><span className="font-bold">Last Name:</span> {user.lastName}</p>
          <p className="py-1"><span className="font-bold">Email:</span> {user.email}</p>
          <p className="py-1"><span className="font-bold">Account Type(s):</span> {user.accountType?.join(', ')}</p>
          <p className="py-1"><span className="font-bold">Linked Accounts:</span> {getStudentListOrTeacher()}</p>
          <p className="py-1"><span className="font-bold">Last logged in:</span> {new Date(user.lastWorkedOn).toDateString()}</p>
        </div>
      </div>
      <div className="flex flex-row py-3">
        <button onClick={() => setShowModal(true)} className="flex w-auto justify-center rounded-md bg-red-600 px-3 mx-1 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Delete Account</button>
      </div>
      <Popup {...{ showModal, account, messageHeader, errorMessage }} executeNext={() => modalNext()} onClose={() => setShowModal(false)} />
    </div>
  )
}

export default function Profile() {
  let args;
  const [user, getUserData] = useState({ ...args })

  useEffect(() => {
    const { userReducer } = store.getState()
    getUserData(userReducer);
  }, [])

  const username = user.username
  const isTeacher = user.accountType?.includes('teacher')
  const student = null;

  return (
    <NestedLayout {...{ username, student, isTeacher }}>
      <ProfileContent {...{ user }} />
    </NestedLayout>
  )
}
