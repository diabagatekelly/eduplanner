'use client'

import NestedLayout from '@/app/nested-layout'
import ViewActivity from '@/components/activities/view-activity'
import { IUser } from '@/types/IUser'
import { use } from 'react'
import Breadcrumbs from '@/components/breadcrumbs'
import { ActivityParams } from '@/types/IParams'
import { useSession } from 'next-auth/react'
import { useUser } from '@/hooks/use-user'
import { queryGuard } from '@/lib/helpers/query-guard'

export default function Main(props: { params: ActivityParams }) {
  const params = use(props.params)
  const activityFromParams = params.activity

  const isMain = true

  const { data: session } = useSession()
  const userId = session?.user?.userId ?? ''
  const { data: user = {} as IUser, isLoading, isError, error, refetch } = useUser(userId)

  const guard = queryGuard({ isLoading, isError, error, refetch })
  if (guard) return guard
  if (!user.userId) return null

  const isTeacher: boolean = user.accountType === 'teacher'
  const userActivity = user.activities?.find((activity) => activity?.name === activityFromParams)

  return (
    <NestedLayout {...{ isTeacher }}>
      <Breadcrumbs />
      <ViewActivity {...{ userDetails: user, userActivity: userActivity!, isMain }} />
      <button className="default-btn" onClick={() => window.history.back()}>
        Back
      </button>
    </NestedLayout>
  )
}
