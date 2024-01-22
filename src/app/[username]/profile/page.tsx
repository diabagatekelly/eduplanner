"use client"

import NestedLayout from "@/app/nested-layout";
import store from "@/store/store";
import Popup from "@/components/popups/popup";
import { useEffect, useState } from "react"
import { UserProfile } from "@/components/user-profile";

export default function Profile() {
  let args;

  const [showModal, setShowModal] = useState(false);
  const [user, getUserData] = useState({ ...args })

  useEffect(() => {
    const { userReducer } = store.getState()
    getUserData(userReducer);
  }, [])

  const isTeacher = user.accountType?.includes('teacher')
  const isMain = true;
  const modalType = 'deleteAccount';

  return (
    <NestedLayout {...{ isTeacher }}>
      <UserProfile />
      <button
        onClick={() => setShowModal(true)}
        className="flex w-auto justify-center rounded-md bg-red-600 px-3 mx-1 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
        Delete Account
      </button>
      <Popup {...{ showModal, modalType, isMain, user }} onClose={() => setShowModal(false)} />
    </NestedLayout>
  )
}
