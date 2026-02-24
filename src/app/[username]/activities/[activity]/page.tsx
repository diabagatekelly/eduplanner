'use client'

import NestedLayout from '@/app/nested-layout'
import ViewActivity from '@/components/activities/view-activity'
import { IUser } from '@/types/IUser'
import store from '@/store/store'
import { useEffect, useState, use } from 'react'
import Breadcrumbs from '@/components/breadcrumbs'
import { ActivityParams } from '@/types/IParams'

export default function Main(props: { params: ActivityParams }) {
  const params = use(props.params)
  const activityFromParams = params.activity

  const isMain = true

  let args
  const [user, getUserData] = useState<IUser>({ ...args })

  useEffect(() => {
    const { userReducer } = store.getState()
    getUserData(userReducer)
  }, [])

  const isTeacher: boolean = user.accountType === 'teacher'
  const userActivity = user.activities?.find((activity) => activity?.name === activityFromParams)

  return (
    <NestedLayout {...{ isTeacher }}>
      <Breadcrumbs />
      <ViewActivity {...{ userDetails: user, userActivity, isMain }} />
      <button className="default-btn" onClick={() => window.history.back()}>
        Back
      </button>
    </NestedLayout>
  )
}
