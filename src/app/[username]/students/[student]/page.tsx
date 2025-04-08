"use client"

import NestedLayout from "@/app/nested-layout";
import store from "@/store/store";
import { useEffect, useState } from "react"
import Dashboard from "@/components/dashboard";
import {IUser} from "@/interfaces/IUser";
import Breadcrumbs from "@/components/breadcrumbs";

export default function Main({ params }: { params: { student: string } }) {
  let args;
  const [user, getUserData] = useState<IUser>({ ...args })

  useEffect(() => {
    const { userReducer } = store.getState()
    getUserData(userReducer);
  }, [])

  const isTeacher = true;
  const student = params.student

  const allStudents = user.students
  const userDetails = allStudents?.[student]
  const isMain = false

  return (
    <NestedLayout {...{ isTeacher }}>
      <Breadcrumbs />
      <Dashboard {...{ userDetails, isMain, isTeacher }} />
      <button className="default-btn" onClick={() => window.history.back()}>
        Back
      </button>
    </NestedLayout>
  )
}