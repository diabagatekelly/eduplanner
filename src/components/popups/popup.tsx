"use client"

import DeleteAccountPopup from "./deleteAccoutPopup";
import LinkAccountPopup from "./linkAccountPopup";
import UnlinkAccountPopup from "./unlinkAccountPopup";
import DeleteActivityPopup from "./deleteActivityPopup";
import ManageCardPopup from "./manageCardPopup";
import { IUser } from "@/interfaces/IUser";

const Popup = ({ onClose, showModal, modalType, isMain=true, ...childArgs }: {onClose: any, showModal: boolean, modalType: string, isMain?: boolean, newStudent?: IUser | Partial<IUser>, user?: IUser | Partial<IUser>}) => {
  if (modalType === 'deleteAccount') {
    return (
      <DeleteAccountPopup {...{onClose, showModal, isMain, ...childArgs}}/>
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
      <ManageCardPopup {...{onClose, showModal, ...childArgs}} />
    )
  }
}

export default Popup;