"use client"

import NestedLayout from "@/app/nested-layout";
import store from "@/app/store";
import { useEffect, useState } from "react"
import { DashboardContent } from "@/app/ui/dashboard-content";

export default function Dashboard({ params }: { params: { username: string, student: string } }) {

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

  return (
    <NestedLayout {...{ isTeacher }}>
      <DashboardContent {...{ params, userDetails }} />
    </NestedLayout>
  )
}