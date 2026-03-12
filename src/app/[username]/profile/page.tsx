'use client'

import NestedLayout from '@/app/nested-layout'
import Popup from '@/components/popups/popup'
import { useState } from 'react'
import UserProfile from '@/app/[username]/profile/components/user-profile'
import { IUser } from '@/types/IUser'
import { useSession } from 'next-auth/react'
import { useUser } from '@/hooks/use-user'

export default function Profile() {
  const [showModal, setShowModal] = useState(false)

  const { data: session } = useSession()
  const userId = session?.user?.userId ?? ''
  const { data: user = {} as IUser } = useUser(userId)

  if (!user.userId) return null

  const isTeacher = user?.accountType === 'teacher'
  const isMain = true
  const modalType = 'deleteAccount'

  return (
    <NestedLayout {...{ isTeacher }}>
      <UserProfile {...{ user }} />
      <button onClick={() => setShowModal(true)} id="delete-button" className="red-btn">
        Delete Account
      </button>
      <Popup {...{ showModal, modalType, isMain, user }} onClose={() => setShowModal(false)} />
    </NestedLayout>
  )
}
