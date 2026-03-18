'use client'

import NestedLayout from '@/app/nested-layout'
import Popup from '@/components/popups/popup'
import { useState } from 'react'
import UserProfile from '@/app/[username]/profile/components/user-profile'
import { IUser } from '@/types/IUser'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useUser } from '@/hooks/use-user'
import { useStudent } from '@/hooks/use-student'
import { getStudentId } from '@/lib/helpers/getStudentId'
import { isTeacher as checkIsTeacher } from '@/lib/helpers/isTeacher'

export default function Profile() {
  const studentParam = useParams().student as string
  const [showModal, setShowModal] = useState(false)

  const { data: session } = useSession()
  const teacherId = session?.user?.userId ?? ''
  const { data: teacher } = useUser(teacherId)

  const studentId = getStudentId(teacher, studentParam)
  const { data: user = {} as IUser } = useStudent(studentId)

  if (!user.userId) return null

  const isTeacher = checkIsTeacher(teacher)

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
