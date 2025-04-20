"use client"

import DeleteAccountPopup from "./deleteAccountPopup";
import LinkAccountPopup from "./linkAccountPopup";
import UnlinkAccountPopup from "./unlinkAccountPopup";
import DeleteActivityPopup from "./deleteActivityPopup";
import ManageCardPopup from "./manageCardPopup";
import ValidatePopup from "./validatePopup";
import { IUser } from "@/types/IUser";
import { IActivity } from "@/types/IActivity";

export default function Popup({ onClose, showModal, modalType, isMain, ...childArgs }: {onClose: any, showModal: boolean, modalType: string, isMain?: boolean, newStudent?: IUser | Partial<IUser>, user?: IUser | Partial<IUser>, item?: any, activity?: IActivity}) {
  if (modalType === 'deleteAccount') {
    return (
      <DeleteAccountPopup {...{onClose, showModal, ...childArgs}}/>
    )
  } else if (modalType === 'addStudent') {
    return (
      <LinkAccountPopup {...{onClose, showModal, ...childArgs}}/>
    )
  } else if (modalType === 'removeStudent') {
    return (
      <UnlinkAccountPopup {...{onClose, showModal, ...childArgs}}/>
    )
  } else if (modalType === 'removeActivity') {
    return (
      <DeleteActivityPopup {...{onClose, showModal, ...childArgs}}/>
    )
  } else if (modalType === 'manageCard') {
    return (
      <ManageCardPopup {...{onClose, showModal, isMain, ...childArgs}} />
    )
  } else if (modalType === 'validate') {
    return (
      <ValidatePopup {...{onClose, showModal, ...childArgs}} />
    )
  }
}
