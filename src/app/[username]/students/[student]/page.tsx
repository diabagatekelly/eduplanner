'use client'

import NestedLayout from '@/app/nested-layout'
import { use } from 'react'
import Dashboard from '@/components/dashboard'
import { IUser } from '@/types/IUser'
import Breadcrumbs from '@/components/breadcrumbs'
import { StudentParams } from '@/types/IParams'
import { useSession } from 'next-auth/react'
import { useUser } from '@/hooks/use-user'
import { useStudent } from '@/hooks/use-student'
import { getStudentId } from '@/lib/helpers/getStudentId'

export default function Main(props: { params: StudentParams }) {
  const params = use(props.params)
  const studentFromParams = params.student

  const { data: session } = useSession()
  const teacherId = session?.user?.userId ?? ''
  const { data: teacher } = useUser(teacherId)

  const studentId = getStudentId(teacher, studentFromParams)
  const { data: studentUser } = useStudent(studentId)

  const isTeacher = true
  const userDetails = studentUser
  const isMain = false

  return (
    <NestedLayout {...{ isTeacher }}>
      <Breadcrumbs />
      <Dashboard {...{ userDetails: userDetails!, isMain, isTeacher }} />
      <button className="default-btn" onClick={() => window.history.back()}>
        Back
      </button>
    </NestedLayout>
  )
}
