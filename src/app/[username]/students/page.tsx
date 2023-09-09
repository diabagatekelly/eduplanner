"use client"

import NestedLayout from "@/app/nested-layout";
import store from "@/app/store";
import { useEffect, useState } from "react"

const StudentsContent = ({user}) => {

  return (
    <div className="flex flex-col px-3">
      Manage my students here.
    </div>
  )
}

export default function Students() {
  let args;
  const [user, getUserData] = useState({ ...args })

  useEffect(() => {
    const { userReducer } = store.getState()
    console.log(userReducer)
    getUserData(userReducer);
  }, [])

  const username = user.username
  const isTeacher = user.accountType?.includes('teacher')
  
  return (
    <NestedLayout {...{username, isTeacher}}>
      <StudentsContent {...{user}} />
    </NestedLayout>
  )
}
