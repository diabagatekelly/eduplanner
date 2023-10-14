"use client"

import NestedLayout from "@/app/nested-layout";
import store from "@/app/store";
import { useEffect, useState } from "react";
import { DashboardContent } from "../ui/dashboard-content";


export default function Dashboard({ params }: { params: { username: string } }) {

  let args;
  const [user, getUserData] = useState({ ...args })

  useEffect(() => {
    const { userReducer } = store.getState()
    getUserData(userReducer);
  }, [])

  const isTeacher = user.accountType?.includes('teacher')
  const userDetails = user;
  const isMain = user.username === params.username

  return (
    <NestedLayout {...{ isTeacher }}>
      <DashboardContent {...{ params, userDetails, isMain }} />
    </NestedLayout>
  )
}