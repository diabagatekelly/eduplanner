'use client'

import NestedLayout from '@/app/nested-layout'
import Popup from '@/components/popups/popup'
import { useState } from 'react'
import UserProfile from '@/app/[username]/profile/components/user-profile'
import { IUser } from '@/types/IUser'
import { useSession } from 'next-auth/react'
import { useUser } from '@/hooks/use-user'
import { queryGuard } from '@/lib/helpers/query-guard'
import { isTeacher as checkIsTeacher } from '@/lib/helpers/isTeacher'

export default function Profile() {
  const [showModal, setShowModal] = useState(false)

  const { data: session } = useSession()
  const userId = session?.user?.userId ?? ''
  const { data: user = {} as IUser, isLoading, isError, error, refetch } = useUser(userId)

  const guard = queryGuard({ isLoading, isError, error, refetch })
  if (guard) return guard
  if (!user.userId) return null

  const isTeacher = checkIsTeacher(user)

  return (
    <NestedLayout {...{ isTeacher }}>
      <UserProfile {...{ user }} />
      <button onClick={() => setShowModal(true)} id="delete-button" className="red-btn">
        Delete Account
      </button>
      {showModal && (
        <Popup
          showModal={showModal}
          config={{ type: 'deleteAccount', user }}
          onClose={() => setShowModal(false)}
        />
      )}
    </NestedLayout>
  )
}
