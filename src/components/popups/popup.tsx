"use client"

import DeleteAccountPopup from "./deleteAccoutPopup";
import LinkAccountPopup from "./linkAccountPopup";
import UnlinkAccountPopup from "./unlinkAccountPopup";
import DeleteActivityPopup from "./deleteActivityPopup";
import ManageCardPopup from "./manageCardPopup";

const Popup = ({ onClose, showModal, modalType, isMain, ...childArgs }) => {
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