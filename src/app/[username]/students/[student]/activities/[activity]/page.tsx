'use client'

import NestedLayout from '@/app/nested-layout'
import { use } from 'react'
import ViewActivity from '@/components/activities/view-activity'
import Breadcrumbs from '@/components/breadcrumbs'
import { ActivityStudentParams } from '@/types/IParams'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useUser } from '@/hooks/use-user'
import { useStudent } from '@/hooks/use-student'
import { getStudentId } from '@/lib/helpers/getStudentId'

export default function Main(props: { params: ActivityStudentParams }) {
  const params = use(props.params)
  const activityFromParams = params.activity
  const studentFromParams = params.student

  const router = useRouter()

  const { data: session } = useSession()
  const teacherId = session?.user?.userId ?? ''
  const { data: teacher } = useUser(teacherId)

  const studentId = getStudentId(teacher, studentFromParams)
  const { data: studentUser } = useStudent(studentId)

  const userDetails = studentUser
  const isMain = false

  const isTeacher = teacher?.accountType === 'teacher'
  const userActivity = userDetails?.activities?.find(
    (activity) => activity?.name === activityFromParams
  )

  if (!userDetails || !userActivity) return null

  return (
    <NestedLayout {...{ isTeacher }}>
      <Breadcrumbs />
      <ViewActivity {...{ userDetails, userActivity, isMain }} />
      <button className="default-btn" onClick={() => router.back()}>
        Back
      </button>
    </NestedLayout>
  )
}
