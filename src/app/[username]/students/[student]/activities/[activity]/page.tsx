"use client"

import NestedLayout from "@/app/nested-layout";
import store from "@/app/store";
import { useEffect, useState } from "react"
import { ActivityContent } from "@/app/ui/activity-content";
import { usePathname } from 'next/navigation'

export default function Dashboard({ params }: { params: { username: string, student: string } }) {
  const pathname = usePathname();
  const activityName = pathname.split('/')[5]


  let args;
  const [user, getUserData] = useState({ ...args })

  useEffect(() => {
    const { userReducer } = store.getState()
    getUserData(userReducer);
  }, [])

  const allStudents = user.students
  const userDetails = allStudents?.[params.student]
  const isMain = false;

  const isTeacher = user.accountType?.includes('teacher')

  const activityDetails = {...userDetails?.activities?.find((activity) => activity?.name === activityName), username: userDetails?.username, email: userDetails?.email}

  return (
    <NestedLayout {...{ isTeacher }}>
      <ActivityContent {...{ activityDetails, isMain }} />
    </NestedLayout>
  )
}