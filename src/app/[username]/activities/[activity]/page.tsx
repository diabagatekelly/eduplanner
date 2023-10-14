"use client"

import NestedLayout from "@/app/nested-layout";
import store from "@/app/store";
import { useEffect, useState } from "react"
import { ActivityContent } from "@/app/ui/activity-content";
import { usePathname, useSearchParams } from 'next/navigation'

export default function Dashboard({ params }: { params: { username: string, student: string } }) {
  const pathname = usePathname();
  const activityName = pathname.split('/')[3]

  let args;
  const [user, getUserData] = useState({ ...args })

  useEffect(() => {
    const { userReducer } = store.getState()
    getUserData(userReducer);
  }, [])

  const isTeacher = user.accountType?.includes('teacher')

  const activityDetails = user.activities?.find((activity) => activity?.name === activityName)

  return (
    <NestedLayout {...{ isTeacher }}>
      <ActivityContent {...{ activityDetails }} />
    </NestedLayout>
  )
}