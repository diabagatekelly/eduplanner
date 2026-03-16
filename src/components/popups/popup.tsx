'use client'

import DeleteAccountPopup from './deleteAccountPopup'
import LinkAccountPopup from './linkAccountPopup'
import UnlinkAccountPopup from './unlinkAccountPopup'
import DeleteActivityPopup from './deleteActivityPopup'
import ManageCardPopup from './manageCardPopup'
import ValidatePopup from './validatePopup'
import { IUser } from '@/types/IUser'
import { IActivity } from '@/types/IActivity'

export default function Popup({
  onClose,
  showModal,
  modalType,
  isMain,
  newStudent,
  user,
  item,
  activity,
  submitList,
  teacherId,
}: {
  onClose: () => void
  showModal: boolean
  modalType: string
  isMain?: boolean
  newStudent?: IUser | Partial<IUser>
  user?: IUser | Partial<IUser>
  item?: any
  activity?: IActivity
  submitList?: (list: string) => void
  teacherId?: string
}) {
  if (modalType === 'deleteAccount') {
    return <DeleteAccountPopup onClose={onClose} showModal={showModal} user={user} />
  } else if (modalType === 'addStudent') {
    return (
      <LinkAccountPopup
        onClose={onClose}
        showModal={showModal}
        newStudent={newStudent}
        user={user}
      />
    )
  } else if (modalType === 'removeStudent') {
    return (
      <UnlinkAccountPopup
        onClose={onClose}
        showModal={showModal}
        user={user}
        teacherId={teacherId}
      />
    )
  } else if (modalType === 'removeActivity') {
    return <DeleteActivityPopup onClose={onClose} showModal={showModal} user={user} item={item} />
  } else if (modalType === 'manageCard') {
    return (
      <ManageCardPopup
        onClose={onClose}
        showModal={showModal}
        isMain={!!isMain}
        user={user}
        item={item}
        activity={activity}
      />
    )
  } else if (modalType === 'validate') {
    return (
      <ValidatePopup onClose={onClose} showModal={showModal} item={item} submitList={submitList} />
    )
  }
}
