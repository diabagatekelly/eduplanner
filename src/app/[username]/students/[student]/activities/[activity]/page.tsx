'use client'

import NestedLayout from '@/app/nested-layout'
import store from '@/store/store'
import { useEffect, useState, use } from 'react'
import ViewActivity from '@/components/activities/view-activity'
import { IUser } from '@/types/IUser'
import Breadcrumbs from '@/components/breadcrumbs'
import { ActivityStudentParams } from '@/types/IParams'

export default function Main(props: { params: ActivityStudentParams }) {
  const params = use(props.params)
  const activityFromParams = params.activity
  const studentFromParams = params.student
  const [user, getUserData] = useState<IUser>({} as IUser)

  useEffect(() => {
    const { userReducer } = store.getState()
    getUserData(userReducer)
  }, [])

  const allStudents = user.students
  const userDetails = allStudents?.[studentFromParams]
  const isMain = false

  const isTeacher = user.accountType === 'teacher'
  const userActivity = userDetails?.activities?.find(
    (activity) => activity?.name === activityFromParams
  )

  return (
    <NestedLayout {...{ isTeacher }}>
      <Breadcrumbs />
      <ViewActivity {...{ userDetails: userDetails!, userActivity: userActivity!, isMain }} />
      <button className="default-btn" onClick={() => window.history.back()}>
        Back
      </button>
    </NestedLayout>
  )
}
