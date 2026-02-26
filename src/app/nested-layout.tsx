'use client'

import { useParams, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import store from '@/store/store'
import { IUser } from '@/types/IUser'
import { fromDbFormat } from '@/lib/helpers/formatActivityName'
import {
  Bars3BottomLeftIcon,
  ChartPieIcon,
  LightBulbIcon,
  UserGroupIcon,
} from '@heroicons/react/24/solid'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function NestedLayout({
  children,
  isTeacher,
}: {
  children: any
  isTeacher: boolean
}) {
  const pathname = usePathname()
  const activityPath = useParams().activity
  const student = useParams().student as string
  const [user, getUserData] = useState<IUser>({} as IUser)
  const [cardSubMenu, showCardSubMenu] = useState(false)
  const [openDrawer, setOpenDrawer] = useState(true)

  useEffect(() => {
    const { userReducer }: { userReducer: IUser } = store.getState()
    getUserData(userReducer)

    const isMain = !student
    let cardSubMenu

    if (isMain) {
      cardSubMenu = userReducer?.activities?.find(
        (activity) => activity.name === activityPath
      )?.hasCards
    } else {
      cardSubMenu = userReducer?.students?.[student]?.activities?.find(
        (activity) => activity.name === activityPath
      )?.hasCards
    }

    showCardSubMenu(!!cardSubMenu)
  }, [activityPath, student])

  function toggleDrawer(open: boolean) {
    open === true ? setOpenDrawer(true) : setOpenDrawer(false)
    return
  }

  return (
    <>
      <button
        data-testid="drawer-button"
        onClick={() => toggleDrawer(!openDrawer)}
        data-drawer-target="default-sidebar"
        data-drawer-toggle="default-sidebar"
        aria-controls="default-sidebar"
        type="button"
        className="inline-flex items-center p-2 mt-1 ml-0 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3BottomLeftIcon
          title={`${openDrawer ? 'Open' : 'Close'} sidebar`}
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
              <a
                href={`/${user.username}`}
                className={
                  'flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group' +
                  classNames(
                    pathname === `/${user.username}`
                      ? ' bg-gray-800 text-white hover:bg-gray-700'
                      : ''
                  )
                }
              >
                <ChartPieIcon
                  className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  aria-hidden="true"
                  fill="currentColor"
                />
                <span className="ml-3">Dashboard</span>
              </a>
            </li>
            {isTeacher ? (
              <li className="menu-item">
                <a
                  href={`/${user.username}/students`}
                  className={
                    'flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group' +
                    classNames(
                      pathname === `/${user.username}/students`
                        ? ' bg-gray-800 text-white hover:bg-gray-700'
                        : ''
                    )
                  }
                >
                  <UserGroupIcon
                    className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    aria-hidden="true"
                    fill="currentColor"
                  />
                  <span className="flex-1 ml-3 whitespace-nowrap">Manage Students</span>
                </a>
              </li>
            ) : (
              ''
            )}
            {cardSubMenu ? (
              <>
                <li className="menu-item">
                  <a
                    href={pathname}
                    className={
                      'flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group' +
                      classNames(
                        pathname === `/${user.username}/students`
                          ? ' bg-gray-800 text-white hover:bg-gray-700'
                          : ''
                      )
                    }
                  >
                    <LightBulbIcon
                      className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                      aria-hidden="true"
                      fill="currentColor"
                    />
                    <span className="flex-1 ml-3 whitespace-nowrap">
                      Activity: {fromDbFormat(activityPath as string)}
                    </span>
                  </a>
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
            ) : (
              ''
            )}
          </ul>
        </div>
      </aside>

      <div className="sm:ml-64 py-5 px-3">{children}</div>
    </>
  )
}
