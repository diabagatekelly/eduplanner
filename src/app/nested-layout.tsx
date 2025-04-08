'use client'

import { useParams, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react';
import store from '@/store/store';
import { IUser } from '@/interfaces/IUser';
import { fromDbFormat } from '@/utils/formatActivityName';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function NestedLayout({ children, isTeacher }: {children: any, isTeacher: boolean}) {
  const pathname = usePathname();
  const activityPath = useParams().activity;
  const student = useParams().student as string;
  let args;

  const [user, getUserData] = useState<IUser>({ ...args })
  const [cardSubMenu, showCardSubMenu] = useState(false)
  const [openDrawer, setOpenDrawer] = useState(true)
  
  useEffect(() => {
    const { userReducer }: {userReducer: IUser} = store.getState()
    getUserData(userReducer);

    const isMain = !student;
    let cardSubMenu;

    if (isMain) {
      cardSubMenu = userReducer?.activities?.find(activity => activity.name === activityPath)?.hasCards
    } else {
      cardSubMenu = userReducer?.students?.[student]?.activities?.find(activity => activity.name === activityPath)?.hasCards      
    }

    showCardSubMenu(cardSubMenu)
  }, [activityPath, student])

  function toggleDrawer(open) {
    open === true ? setOpenDrawer(true) : setOpenDrawer(false)
    return
  }

  return (
    <>
      <button data-testid="drawer-button" onClick={() => toggleDrawer(!openDrawer)} data-drawer-target="default-sidebar" data-drawer-toggle="default-sidebar" aria-controls="default-sidebar" type="button" 
        className="inline-flex items-center p-2 mt-1 ml-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
        <span className="sr-only">Open sidebar</span>
        <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
        </svg>
      </button>

      <aside data-testid="default-sidebar" id="default-sidebar" className={openDrawer ? "fixed top-16 left-0 z-0 w-64 h-screen transition-transform sm:translate-x-0 -translate-x-full" : "fixed top-25 left-0 z-0 w-64 h-screen transition-transform sm:translate-x-0"} aria-label="Sidebar">
        <div className="h-full px-3 py-4 overflow-y-auto bg-gray-100 dark:bg-gray-800">
          <ul className="space-y-2 font-medium">
            <li className='menu-item'>
              <a href={`/${user.username}`} className={"flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group" + classNames(pathname === `/${user.username}` ? " bg-gray-800 text-white hover:bg-gray-700" : "")}>
                <svg className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21">
                  <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                  <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                </svg>
                <span className="ml-3">Dashboard</span>
              </a>
            </li>
            {isTeacher ? <li className='menu-item'>
              <a href={`/${user.username}/students`} className={"flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group" + classNames(pathname === `/${user.username}/students` ? " bg-gray-800 text-white hover:bg-gray-700" : "")}>
                <svg className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18">
                  <path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z" />
                </svg>
                <span className="flex-1 ml-3 whitespace-nowrap">Manage Students</span>
              </a>
            </li> : ""}
            {cardSubMenu ? 
              <>
                <li className='menu-item'>
                  <a href={pathname} className={"flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group" + classNames(pathname === `/${user.username}/students` ? " bg-gray-800 text-white hover:bg-gray-700" : "")}>
                    <svg className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18">
                      <path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z" />
                    </svg>
                    <span className="flex-1 ml-3 whitespace-nowrap">Activity: {fromDbFormat(activityPath)}</span>
                  </a>
                </li>
                <li className='menu-item-cards'>
                  <a href={`${pathname}/#active`} className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                    <span className="flex-1 ml-7 whitespace-nowrap italic">View All Active Cards</span>
                  </a>
                </li>
                <li className='menu-item-cards'>
                  <a href={`${pathname}/#inactive`} className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                    <span className="flex-1 ml-7 whitespace-nowrap italic">View All Inactive Cards</span>
                  </a>
                </li>
                <li className='menu-item-cards'>
                  <a href={`${pathname}/#add`} className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                    <span className="flex-1 ml-7 whitespace-nowrap italic">Add new card</span>
                  </a>
                </li>
              </>
              
             : ""}
          </ul>
        </div>
      </aside>

      <div className="sm:ml-64 py-5 px-3">
        {children}
      </div>
    </>
  )
}