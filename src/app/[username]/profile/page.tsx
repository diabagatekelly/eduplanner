"use client"

import NestedLayout from "@/app/nested-layout";
import store from "@/app/store";
import Popup from "@/app/ui/popup";
import { useEffect, useState } from "react"
import { UserProfile } from "@/app/ui/user-profile";
import { OpenModalButton } from "@/app/ui/open-modal-button";

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
  const buttonTxt = 'Delete Account';
  const modalType = 'deleteAccount';

  return (
    <NestedLayout {...{ isTeacher }}>
      <UserProfile />
      <OpenModalButton {...{ buttonTxt, setShowModal }} />
      <Popup {...{ showModal, modalType, isMain }} onClose={() => setShowModal(false)} />
    </NestedLayout>
  )
}
