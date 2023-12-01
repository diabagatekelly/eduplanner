"use client"

import NestedLayout from "@/app/nested-layout";
import store from "@/app/store";
import { useEffect, useState } from "react"
import AddStudent from "@/app/ui/add-student";
import ListUi from "@/app/ui/lists/lists-ui";

export default function Students() {
  let args;
  const [user, getUserData] = useState({ ...args })
  useEffect(() => {
    const { userReducer } = store.getState()
    getUserData(userReducer);
  }, [])

  const isTeacher = user.accountType?.includes('teacher')
  const isMain = true;
  const userDetails = user;

  return (
    <NestedLayout {...{ isTeacher }}>
      <div className="flex flex-col px-3">
        <AddStudent />
        <hr className="mt-4"></hr>
        <div className="justify-items-start">
          <h3 className="text-3xl py-3 font-bold">Current Students</h3>
          <ListUi {...{ listType: 'students', isMain, userDetails }} />
        </div>
      </div>
    </NestedLayout>
  )
}



