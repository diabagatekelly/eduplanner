"use client"

import NestedLayout from "@/app/nested-layout";
import store from "@/store/store";
import Popup from "@/components/popups/popup";
import { useEffect, useState } from "react"
import UserProfile from "@/components/user-profile";
import { IUser } from "@/interfaces/IUser";
import { useParams } from "next/navigation";

export default function Profile() {
  let args;
  const student = useParams().student as string;

  const [showModal, setShowModal] = useState(false);
  const [user, getUserData] = useState<IUser>({ ...args })

  useEffect(() => {
    const { userReducer } = store.getState()
    const user = userReducer.students[student]
    getUserData(user);
  }, [])

  const isTeacher = user?.accountType === 'teacher';
  const isMain = false;
  const modalType = 'deleteAccount';

  return (
    <NestedLayout {...{ isTeacher }}>
      <UserProfile {...{user}} />
      <button
        onClick={() => setShowModal(true)}
        id="delete-button"
        className="flex w-auto justify-center rounded-md bg-red-600 px-3 mx-1 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
        Delete Account
      </button>
      <Popup {...{ showModal, modalType, isMain, user }} onClose={() => setShowModal(false)} />
    </NestedLayout>
  )
}
