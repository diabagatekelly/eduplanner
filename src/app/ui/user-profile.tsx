"use-client"

import { useState, useEffect } from "react";
import store from "../store";

export const UserProfile = () => {
  let args;

  const [user, getUserData] = useState({ ...args })
  useEffect(() => {
    const { userReducer } = store.getState()
    getUserData(userReducer);
  }, [])

  const getStudentListOrTeacher = () => {
    let linkedAccounts = 'None'
    if (user.accountType?.includes('student') && user.teacherId) {
      linkedAccounts = `${user.teacherId} (teacher)`
    } else if (user.accountType?.includes('teacher') && user.studentIds?.length) {
      linkedAccounts = `${user.studentIds?.join(', ')} (students)`
    }
    return linkedAccounts
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
    </div>
  )
}