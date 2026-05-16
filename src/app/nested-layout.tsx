'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { ReactNode, useState } from 'react'
import { IUser } from '@/types/IUser'
import { fromDbFormat } from '@/lib/helpers/formatActivityName'
import {
  Bars3BottomLeftIcon,
  ChartPieIcon,
  LightBulbIcon,
  UserGroupIcon,
} from '@heroicons/react/24/solid'
import { useSession } from 'next-auth/react'
import { useUser } from '@/hooks/use-user'
import { useStudent } from '@/hooks/use-student'
import { getStudentId } from '@/lib/helpers/getStudentId'

export default function NestedLayout({
  children,
  isTeacher,
}: {
  children: ReactNode
  isTeacher: boolean
}) {
  const pathname = usePathname()
  const activityPath = useParams().activity
  const studentParam = useParams().student as string
  const [openDrawer, setOpenDrawer] = useState(true)

  const { data: session } = useSession()
  const userId = session?.user?.userId ?? ''
  const { data: user = {} as IUser } = useUser(userId)

  const studentId = studentParam ? getStudentId(user, studentParam) : ''
  const { data: studentUser } = useStudent(studentId)

  if (!user.userId) return <div className="sm:ml-64 py-5 px-3">{children}</div>

  const isMain = !studentParam
  const activitySource = isMain ? user : studentUser
  const cardSubMenu = !!activitySource?.activities?.find(
    (activity) => activity.name === activityPath
  )?.hasCards

  const dashboardHref = `/${user.username}`
  const studentsHref = `/${user.username}/students`

  return (
    <>
      <button
        data-testid="drawer-button"
        onClick={() => setOpenDrawer((prev) => !prev)}
        data-drawer-target="default-sidebar"
        data-drawer-toggle="default-sidebar"
        aria-controls="default-sidebar"
        type="button"
        className="inline-flex items-center p-2 mt-1 ml-0 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3BottomLeftIcon
          title={`${openDrawer ? 'Close' : 'Open'} sidebar`}
          className="w-6 h-6"
          aria-hidden="true"
          fill="currentColor"
        />
      </button>

      <aside
        data-testid="default-sidebar"
        id="default-sidebar"
        className={
          openDrawer
            ? 'fixed top-16 left-0 z-0 w-64 h-screen transition-transform sm:translate-x-0 -translate-x-full'
            : 'fixed top-25 left-0 z-0 w-64 h-screen transition-transform sm:translate-x-0'
        }
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-gray-100 dark:bg-gray-800">
          <ul className="space-y-2 font-medium">
            <li className="menu-item">
              <Link
                href={dashboardHref}
                className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group${
                  pathname === dashboardHref ? ' bg-gray-800 text-white hover:bg-gray-700' : ''
                }`}
              >
                <ChartPieIcon
                  className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  aria-hidden="true"
                  fill="currentColor"
                />
                <span className="ml-3">Dashboard</span>
              </Link>
            </li>
            {isTeacher && (
              <li className="menu-item">
                <Link
                  href={studentsHref}
                  className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group${
                    pathname === studentsHref ? ' bg-gray-800 text-white hover:bg-gray-700' : ''
                  }`}
                >
                  <UserGroupIcon
                    className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    aria-hidden="true"
                    fill="currentColor"
                  />
                  <span className="flex-1 ml-3 whitespace-nowrap">Manage Students</span>
                </Link>
              </li>
            )}
            {cardSubMenu && (
              <>
                <li className="menu-item">
                  <Link
                    href={pathname}
                    className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                  >
                    <LightBulbIcon
                      className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                      aria-hidden="true"
                      fill="currentColor"
                    />
                    <span className="flex-1 ml-3 whitespace-nowrap">
                      Activity: {fromDbFormat(activityPath as string)}
                    </span>
                  </Link>
                </li>
                <li className="menu-item-cards">
                  <a
                    href={`${pathname}/#active`}
                    className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                  >
                    <span className="flex-1 ml-7 whitespace-nowrap italic">
                      View All Active Cards
                    </span>
                  </a>
                </li>
                <li className="menu-item-cards">
                  <a
                    href={`${pathname}/#inactive`}
                    className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                  >
                    <span className="flex-1 ml-7 whitespace-nowrap italic">
                      View All Inactive Cards
                    </span>
                  </a>
                </li>
                <li className="menu-item-cards">
                  <a
                    href={`${pathname}/#add`}
                    className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                  >
                    <span className="flex-1 ml-7 whitespace-nowrap italic">Add new card</span>
                  </a>
                </li>
              </>
            )}
          </ul>
        </div>
      </aside>

      <div className="sm:ml-64 py-5 px-3">{children}</div>
    </>
  )
}
