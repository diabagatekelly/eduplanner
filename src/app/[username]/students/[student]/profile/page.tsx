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

export default function Profile() {
  const studentParam = useParams().student as string
  const [showModal, setShowModal] = useState(false)

  const { data: session } = useSession()
  const teacherId = session?.user?.userId ?? ''
  const { data: teacher } = useUser(teacherId)

  const studentId = getStudentId(teacher, studentParam)
  const { data: user = {} as IUser } = useStudent(studentId)

  const isTeacher = user?.accountType === 'teacher'
  const isMain = false
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
