"use client"

import NestedLayout from "@/app/nested-layout";
import store from "@/store/store";
import { useEffect, useState } from "react"
import AddStudent from "@/components/students/add-student";
import ListUi from "@/components/lists/lists-ui";
import { useRouter } from "next/navigation";

export default function Students() {
  const router = useRouter();
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
        <AddStudent {...{user}} />
        <hr className="mt-4"></hr>
        <div className="justify-items-start">
          <h3 className="component-sub-title">Current students:</h3>
          <ListUi {...{ listType: 'students', isMain, userDetails }} />
        </div>
      </div>
      <button onClick={() => router.push(`/${user.username}`)}>
        Back
      </button>
    </NestedLayout>
  )
}



