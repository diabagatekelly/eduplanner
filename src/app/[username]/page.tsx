"use client"

import NestedLayout from "@/app/nested-layout";
import store from "@/app/store";
import { useEffect, useState } from "react"

const DashboardContent = ({ params }: { params: { username: string } }) => {
  return (
    <div>Welcome to your dashboard {params.username}. This will display all the relevant activity cards.</div>
  )
}

export default function Dashboard({ params }: { params: { username: string } }) {

  let args;
  const [user, getUserData] = useState({ ...args })

  useEffect(() => {
    const { userReducer } = store.getState()
    getUserData(userReducer);
  }, [])

  const isTeacher = user.accountType?.includes('teacher')
  const username = params.username
  const student = null

  return (
    <NestedLayout {...{ username, student, isTeacher }}>
      <DashboardContent {...{ params }} />
    </NestedLayout>
  )
}