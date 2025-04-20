"use client"

import NestedLayout from "@/app/nested-layout";
import store from "@/store/store";
import Popup from "@/components/popups/popup";
import { useEffect, useState } from "react"
import UserProfile from "@/app/[username]/profile/components/user-profile";
import { IUser } from "@/types/IUser";
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
  }, [student])

  const isTeacher = user?.accountType === 'teacher';
  const isMain = false;
  const modalType = 'deleteAccount';

  return (
    <NestedLayout {...{ isTeacher }}>
      <UserProfile {...{user}} />
      <button
        onClick={() => setShowModal(true)}
        id="delete-button"
        className="red-btn">
          Delete Account
      </button>
      <Popup {...{ showModal, modalType, isMain, user }} onClose={() => setShowModal(false)} />
    </NestedLayout>
  )
}
