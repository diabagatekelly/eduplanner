"use client"

import NestedLayout from "@/app/nested-layout";
import store from "@/app/store";
import { useEffect, useState } from "react"
import { ActivityContent } from "@/app/ui/activity-content";
import { usePathname } from 'next/navigation'

export default function Dashboard({ params }: { params: { username: string, student: string } }) {
  const pathname = usePathname();
  const activityName = pathname.split('/')[3]
  const isMain = true;

  let args;
  const [user, getUserData] = useState({ ...args })
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const { userReducer } = store.getState()
    getUserData(userReducer);
  }, [])

  const isTeacher = user.accountType?.includes('teacher')

  const activityDetails = { ...user.activities?.find((activity) => activity?.name === activityName), username: user?.username, email: user?.email }

  return (
    <NestedLayout {...{ isTeacher }}>
      <ActivityContent {...{ activityDetails, isMain }} />
    </NestedLayout>
  )
}