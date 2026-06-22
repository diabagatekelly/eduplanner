'use client'

import DeleteAccountPopup from './deleteAccountPopup'
import LinkAccountPopup from './linkAccountPopup'
import UnlinkAccountPopup from './unlinkAccountPopup'
import DeleteActivityPopup from './deleteActivityPopup'
import ManageCardPopup from './manageCardPopup'
import ValidatePopup from './validatePopup'
import { IUser } from '@/types/IUser'
import { IActivity } from '@/types/IActivity'
import { ICard } from '@/types/ICard'

export type CardAction = 'show' | 'edit' | 'delete' | 'activate' | 'override'

export type PopupConfig =
  | { type: 'deleteAccount'; user: IUser | Partial<IUser> }
  | { type: 'addStudent'; user: IUser | Partial<IUser>; newStudent: IUser | Partial<IUser> }
  | { type: 'removeStudent'; user: IUser | Partial<IUser>; teacherId: string }
  | { type: 'removeActivity'; user: IUser | Partial<IUser>; item: { activityName: string } }
  | {
      type: 'manageCard'
      isMain: boolean
      user: IUser | Partial<IUser>
      activity: IActivity
      item: { card: ICard; action: CardAction }
    }
  | { type: 'validate'; item: { list: string }; submitList: (list: string) => void }

export default function Popup({
  onClose,
  showModal,
  config,
}: {
  onClose: () => void
  showModal: boolean
  config: PopupConfig
}) {
  switch (config.type) {
    case 'deleteAccount':
      return <DeleteAccountPopup onClose={onClose} showModal={showModal} user={config.user} />
    case 'addStudent':
      return (
        <LinkAccountPopup
          onClose={onClose}
          showModal={showModal}
          newStudent={config.newStudent}
          user={config.user}
        />
      )
    case 'removeStudent':
      return (
        <UnlinkAccountPopup
          onClose={onClose}
          showModal={showModal}
          user={config.user}
          teacherId={config.teacherId}
        />
      )
    case 'removeActivity':
      return (
        <DeleteActivityPopup
          onClose={onClose}
          showModal={showModal}
          user={config.user}
          item={config.item}
        />
      )
    case 'manageCard':
      return (
        <ManageCardPopup
          onClose={onClose}
          showModal={showModal}
          isMain={config.isMain}
          user={config.user}
          item={config.item}
          activity={config.activity}
        />
      )
    case 'validate':
      return (
        <ValidatePopup
          onClose={onClose}
          showModal={showModal}
          item={config.item}
          submitList={config.submitList}
        />
      )
    // istanbul ignore next -- exhaustive guard: unreachable if all PopupConfig types are handled
    default: {
      const _exhaustive: never = config
      throw new Error(`Unhandled popup config: ${JSON.stringify(_exhaustive)}`)
    }
  }
}
