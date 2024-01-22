"use client"

import NestedLayout from "@/app/nested-layout";
import store from "@/store/store";
import { useEffect, useState } from "react"
import { Dashboard } from "@/components/dashboard";

export default function Main({ params }: { params: { username: string, student: string } }) {

  let args;
  const [user, getUserData] = useState({ ...args })

  useEffect(() => {
    const { userReducer } = store.getState()
    getUserData(userReducer);
  }, [])

  const isTeacher = user.accountType?.includes('teacher')
  const student = params.student

  const allStudents = user.students
  const userDetails = allStudents?.[student]
  const isMain = false

  return (
    <NestedLayout {...{ isTeacher }}>
      <Dashboard {...{ params, userDetails, isMain }} />
    </NestedLayout>
  )
}