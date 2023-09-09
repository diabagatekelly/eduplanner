"use client"

import NestedLayout from "@/app/nested-layout";
import store from "@/app/store";
import { useEffect, useState } from "react"

const ProfileContent = ({user}) => {
  const getStudentListOrTeacher = () => {
    let linkedAccounts = 'None'
    if (user.accountType?.includes('student') && user.teacherId) {
      linkedAccounts = user.teacherId
    } else if (user.accountType?.includes('teacher') && user.studentIds) {
      linkedAccounts = user.studentIds?.join(', ')
    }
    return linkedAccounts
  }

  return (
    <div className="flex flex-col px-3">
      <div className="justify-items-start">
        <h2 className="text-4xl py-3 font-bold">Personal Info</h2>
        <div className="personal-info">
          <p className="py-1"><span className="font-bold">Username:</span> {user.username}</p>
          <p className="py-1"><span className="font-bold">First Name:</span> {user.firstName}</p>
          <p className="py-1"><span className="font-bold">Last Name:</span> {user.lastName}</p>
          <p className="py-1"><span className="font-bold">Email:</span> {user.email}</p>
          <p className="py-1"><span className="font-bold">Account Type(s):</span> {user.accountType?.join(', ')}</p>
          <p className="py-1"><span className="font-bold">{user.accountType?.includes('student') ? 'Teacher' : 'Students'}:</span> {getStudentListOrTeacher()}</p>
        </div>
      </div>
      <div className="flex flex-row py-3">
        <button type="submit" className="flex w-auto justify-center rounded-md bg-green-600 px-3 mx-1 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Edit Account</button>
        <button type="submit" className="flex w-auto justify-center rounded-md bg-red-600 px-3 mx-1 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Delete Account</button>
      </div>
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
  
  return (
    <NestedLayout {...{username, isTeacher}}>
      <ProfileContent {...{user}} />
    </NestedLayout>
  )
}
