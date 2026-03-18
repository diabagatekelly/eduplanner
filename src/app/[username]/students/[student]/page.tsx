'use client'

import NestedLayout from '@/app/nested-layout'
import { use } from 'react'
import Dashboard from '@/components/dashboard'
import { IUser } from '@/types/IUser'
import Breadcrumbs from '@/components/breadcrumbs'
import { StudentParams } from '@/types/IParams'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useUser } from '@/hooks/use-user'
import { useStudent } from '@/hooks/use-student'
import { getStudentId } from '@/lib/helpers/getStudentId'
import { queryGuard } from '@/lib/helpers/query-guard'

export default function Main(props: { params: StudentParams }) {
  const params = use(props.params)
  const studentFromParams = params.student

  const router = useRouter()

  const { data: session } = useSession()
  const teacherId = session?.user?.userId ?? ''
  const { data: teacher } = useUser(teacherId)

  const studentId = getStudentId(teacher, studentFromParams)
  const { data: studentUser, isLoading, isError, error, refetch } = useStudent(studentId)

  const isTeacher = true
  const userDetails = studentUser
  const isMain = false

  const guard = queryGuard({ isLoading, isError, error, refetch })
  if (guard) return guard
  if (!userDetails) return null

  return (
    <NestedLayout {...{ isTeacher }}>
      <Breadcrumbs />
      <Dashboard {...{ userDetails, isMain, isTeacher }} />
      <button className="default-btn" onClick={() => router.back()}>
        Back
      </button>
    </NestedLayout>
  )
}
