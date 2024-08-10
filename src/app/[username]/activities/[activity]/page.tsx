"use client"

import NestedLayout from "@/app/nested-layout";
import ViewActivity from "@/components/activities/view-activity";
import { IUser } from "@/interfaces/IUser";
import store from "@/store/store";
import { useEffect, useState } from "react"

export default function Main({ params }: { params: { activity: string } }) {
  const isMain = true;

  let args;
  const [user, getUserData] = useState<IUser>({ ...args })

  useEffect(() => {
    const { userReducer } = store.getState()
    getUserData(userReducer);
  }, [])

  const isTeacher: boolean = user.accountType === 'teacher';
  const userActivity = user.activities?.find((activity) => activity?.name === params.activity)

  return (
    <NestedLayout {...{ isTeacher }}>
      <ViewActivity {...{ userDetails: user, userActivity, isMain }} />
      <button className="default-btn" onClick={() => window.history.back()}>
        Back
      </button>
    </NestedLayout>
  )
}