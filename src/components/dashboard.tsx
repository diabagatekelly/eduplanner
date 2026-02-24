'use client'

import AddActivity from './activities/add-activity'
import { IUser } from '@/types/IUser'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ListUi from '@/components/lists/lists-ui'

export default function Dashboard({
  userDetails,
  isMain,
  isTeacher,
}: {
  userDetails: IUser
  isMain: boolean
  isTeacher: boolean
}) {
  const fullName = `${userDetails?.firstName} ${userDetails?.lastName}`
  const currentPath = usePathname()

  return (
    <>
      {isMain ? (
        <div>
          <h3 data-testid="dashboard-header" className="component-title">
            Welcome {fullName}!
          </h3>
          {isTeacher ? (
            <div className="teacher-dashboard-view my-5">
              <AddActivity {...{ userDetails }} />
              <ListUi {...{ listType: 'activities', isMain, userDetails }} />
            </div>
          ) : (
            <div className="student-dashboard-view my-5">
              <div>
                {userDetails.linkedAccountsData?.teacher ? (
                  <h5
                    className="text-lg md:text-xl"
                    data-testid="student-instructions"
                  >{`Your teacher's email is ${atob(userDetails?.linkedAccountsData?.teacher)}`}</h5>
                ) : (
                  <h5 className="text-lg md:text-xl" data-testid="student-instructions">
                    Ask your teacher or parent to add you and create some activities for you!
                  </h5>
                )}
              </div>
              <hr />
              <ListUi {...{ listType: 'activities', isMain, userDetails }} />
              <button className="default-btn" onClick={() => window.history.back()}>
                Back
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2
            data-testid="dashboard-header"
            className="component-title"
          >{`Manage ${fullName}.`}</h2>
          <p className="text-lg md:text-xl">
            <Link
              className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
              href={`${currentPath}/profile`}
            >
              View student profile
            </Link>
          </p>
          <div className="my-5">
            <AddActivity {...{ userDetails }} />
            <ListUi {...{ listType: 'activities', isMain, userDetails }} />
          </div>
        </div>
      )}
    </>
  )
}
