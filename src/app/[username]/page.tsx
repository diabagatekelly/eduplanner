"use client"

import NestedLayout from "@/app/nested-layout";
import store from "@/store/store";
import { useEffect, useState } from "react";
import Dashboard from "@/components/dashboard";
import { IUser } from "@/interfaces/IUser";
import Breadcrumbs from "@/components/breadcrumbs";

export default function Main({ params }: { params: { username: string } }) {
  let args;
  const [user, getUserData] = useState<IUser>({ ...args })
  
  useEffect(() => {
    const { userReducer } = store.getState()
    getUserData(userReducer);
  }, [])

  const isTeacher = user.accountType === 'teacher';
  const userDetails: IUser = user;
  const isMain = user.username === params.username

  return (
    <NestedLayout {...{ isTeacher }}>
      <Breadcrumbs />
      <Dashboard {...{ userDetails, isMain, isTeacher }} />
    </NestedLayout>
  )
}