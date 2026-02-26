'use client'

import NestedLayout from '@/app/nested-layout'
import store from '@/store/store'
import { useEffect, useState, use } from 'react'
import Dashboard from '@/components/dashboard'
import { IUser } from '@/types/IUser'
import Breadcrumbs from '@/components/breadcrumbs'
import { StudentParams } from '@/types/IParams'

export default function Main(props: { params: StudentParams }) {
  const params = use(props.params)
  const studentFromParams = params.student
  const [user, getUserData] = useState<IUser>({} as IUser)

  useEffect(() => {
    const { userReducer } = store.getState()
    getUserData(userReducer)
  }, [])

  const isTeacher = true
  const student = studentFromParams

  const allStudents = user.students
  const userDetails = allStudents?.[student]
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
