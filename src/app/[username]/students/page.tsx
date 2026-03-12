'use client'

import NestedLayout from '@/app/nested-layout'
import AddStudent from '@/components/students/add-student'
import ListUi from '@/components/lists/lists-ui'
import { useRouter } from 'next/navigation'
import Breadcrumbs from '@/components/breadcrumbs'
import { IUser } from '@/types/IUser'
import { useSession } from 'next-auth/react'
import { useUser } from '@/hooks/use-user'

export default function Students() {
  const router = useRouter()

  const { data: session } = useSession()
  const userId = session?.user?.userId ?? ''
  const { data: user = {} as IUser } = useUser(userId)

  if (!user.userId) return null

  const isTeacher = user.accountType?.includes('teacher')
  const isMain = true
  const userDetails = user

  return (
    <NestedLayout {...{ isTeacher }}>
      <div className="flex flex-col px-3">
        <Breadcrumbs />
        <AddStudent {...{ user }} />
        <hr className="mt-4"></hr>
        <div className="my-5">
          <h3 className="component-sub-title">Current students:</h3>
          <ListUi {...{ listType: 'students', isMain, userDetails }} />
        </div>
      </div>
      <button className="default-btn" onClick={() => router.push(`/${user.username}`)}>
        Back
      </button>
    </NestedLayout>
  )
}
