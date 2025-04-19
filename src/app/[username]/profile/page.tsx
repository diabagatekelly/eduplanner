"use client"

import NestedLayout from "@/app/nested-layout";
import store from "@/store/store";
import Popup from "@/components/popups/popup";
import { useEffect, useState } from "react"
import UserProfile from "@/app/[username]/profile/components/user-profile";
import { IUser } from "@/interfaces/IUser";

export default function Profile() {
  let args;

  const [showModal, setShowModal] = useState(false);
  const [user, getUserData] = useState<IUser>({ ...args })

  useEffect(() => {
    const { userReducer } = store.getState()
    getUserData(userReducer);
  }, [])

  const isTeacher = user?.accountType === 'teacher';
  const isMain = true;
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
