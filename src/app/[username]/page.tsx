"use client"

import NestedLayout from "@/app/nested-layout";
import store from "@/store/store";
import { useEffect, useState, use } from "react";
import Dashboard from "@/components/dashboard";
import { IUser } from "@/types/IUser";
import Breadcrumbs from "@/components/breadcrumbs";
import { UsernameParams } from "@/types/IParams";

export default function Main(props: { params: UsernameParams }) {
  const params = use(props.params);
  const usernameFromParams = params.username

  let args;
  const [user, getUserData] = useState<IUser>({ ...args })

  useEffect(() => {
    const { userReducer } = store.getState()
    getUserData(userReducer);
  }, [])

  const isTeacher = user.accountType === 'teacher';
  const userDetails: IUser = user;
  const isMain = user.username === usernameFromParams

  return (
    <NestedLayout {...{ isTeacher }}>
      <Breadcrumbs />
      <Dashboard {...{ userDetails, isMain, isTeacher }} />
    </NestedLayout>
  )
}