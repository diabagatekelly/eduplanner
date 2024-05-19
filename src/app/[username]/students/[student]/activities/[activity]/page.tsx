"use client"

import NestedLayout from "@/app/nested-layout";
import store from "@/store/store";
import { useEffect, useState } from "react"
import ViewActivity from "@/components/activities/view-activity";
import { IUser } from "@/interfaces/IUser";

export default function Main({ params }: { params: { activity: string, student: string } }) {
  let args;
  const [user, getUserData] = useState<IUser>({ ...args })

  useEffect(() => {
    const { userReducer } = store.getState()
    getUserData(userReducer);
  }, [])

  const allStudents = user.students
  const userDetails = allStudents?.[params.student]
  const isMain = false;

  const isTeacher = user.accountType === 'teacher';
  const userActivity = userDetails?.activities?.find((activity) => activity?.name === params.activity)

  return (
    <NestedLayout {...{ isTeacher }}>
      <ViewActivity {...{ userDetails, userActivity, isMain }} />
    </NestedLayout>
  )
}