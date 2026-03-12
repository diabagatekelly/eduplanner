'use client'

import NestedLayout from '@/app/nested-layout'
import { use } from 'react'
import Dashboard from '@/components/dashboard'
import { IUser } from '@/types/IUser'
import Breadcrumbs from '@/components/breadcrumbs'
import { UsernameParams } from '@/types/IParams'
import { useSession } from 'next-auth/react'
import { useUser } from '@/hooks/use-user'

export default function Main(props: { params: UsernameParams }) {
  const params = use(props.params)
  const usernameFromParams = params.username

  const { data: session } = useSession()
  const userId = session?.user?.userId ?? ''
  const { data: user = {} as IUser } = useUser(userId)

  if (!user.userId) return null

  const isTeacher = user.accountType === 'teacher'
  const userDetails: IUser = user
  const isMain = user.username === usernameFromParams

  return (
    <NestedLayout {...{ isTeacher }}>
      <Breadcrumbs />
      <Dashboard {...{ userDetails, isMain, isTeacher }} />
    </NestedLayout>
  )
}
