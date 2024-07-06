"use client"

import Link from "next/link";
import { Fragment, useEffect, useState } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, UserCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useDispatch } from "react-redux";
import { removeAuthToken } from "../store/actions/authActions";
import { resetUser } from "../store/actions/userActions";
import { usePathname, useRouter } from 'next/navigation'
import { editUser } from "../api/controller";
import store from "../store/store";
import { IUser } from "@/interfaces/IUser";
import { ISODateString } from "@/interfaces/isoDateType";

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar({ isAuthenticated, username }: {isAuthenticated: boolean, username: string}) {
  let args;
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const [user, getUserData] = useState<IUser>({ ...args })

  useEffect(() => {
    const { userReducer } = store.getState()
    getUserData(userReducer);
  }, [user])

  const navigation = [
    { name: 'Home', href: '/', current: pathname === '/', dataTestId: 'home-btn' },
  ]

  async function logout() {
    try {
      await editUser({ userId: user.userId, editData: {lastLogin: new Date(Date.now()).toLocaleDateString('en-US', {timeZone: 'EST'}) as ISODateString}})
      dispatch(removeAuthToken())
      dispatch(resetUser())
      router.push('/login');
            
    } catch (error) {
      console.log(error)

      if (!error.response) {
        console.log('Server is down. Try again later.')
        return
      }

      const {status, data} = error.response;

      if (status === 500) {
        console.log('Oops, something went wrong in updating and logging out. Please try again later.')
      } else {
        console.log(data.message)
      }
    }

  }

  return (
    <Disclosure data-testid="nav" as="nav" className="fixed top w-full bg-gray-800">
      {({ open }) => (
        <>
          <div className="mx-auto px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon data-testid="x-icon-btn" className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon data-testid="bars-icon-btn" className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      <Link
                        data-testid={item.dataTestId}
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                          'rounded-md px-3 py-2 text-sm font-medium'
                        )}
                        aria-current={item.current ? 'page' : undefined}
                      >
                        {item.name}
                      </Link>
                    ))}
                    {isAuthenticated && !pathname.includes(`${username}`) ?
                      <Link
                        key="Dashboard"
                        href={`/${username}`}
                        className='text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium'
                      >
                        Dashboard
                      </Link>
                      : ''}
                  </div>

                </div>
              </div>
              <div className={classNames(isAuthenticated ? "absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0" : "hidden")}>
                <button
                  type="button"
                  className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>

                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button data-testid="user-icon" className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Open user menu</span>
                      <UserCircleIcon className="h-6 w-6" aria-hidden="true" />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) =>(
                          <Link
                            data-testid="profile-link"
                            href={`/${username}/profile`}
                            className={
                              classNames(
                                /* istanbul ignore next */
                                active ? 'bg-gray-200' : '', 
                                pathname.includes(`/${username}/profile`) ? 'italic rounded-md border-2 border-gray-700' : '', 
                                'block px-4 py-2 text-sm text-gray-700'
                              )}
                          >
                            Your Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (

                          <Link
                            data-testid="logout-link"
                            onClick={logout}
                            href="#"
                            className={classNames(
                              /* istanbul ignore next */
                              active ? 'bg-gray-100' : '', 
                              'block px-4 py-2 text-sm text-gray-700'
                            )}
                          >
                            Sign out
                          </Link>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
              <div className={classNames(!isAuthenticated ? "hidden inset-y-0 right-0 flex items-center sm:ml-6 sm:block" : "hidden")}>
                <div className="flex space-x-4">
                  <Link
                    data-testid="login-btn"
                    key="Login"
                    href="/login"
                    className={classNames(
                      pathname === '/login' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'rounded-md px-3 py-2 text-sm font-medium'
                    )}
                    aria-current={pathname === '/login' ? 'page' : undefined}
                  >
                    Login
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'block rounded-md px-3 py-2 text-base font-medium'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
              {
                isAuthenticated && !pathname.includes(`${username}`) ?
                  <Disclosure.Button
                    key="Dashboard"
                    as="a"
                    href={`/${username}`}
                    className='text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium'
                  >
                    Dashboard
                  </Disclosure.Button> : ""
              }
              {
                !isAuthenticated ?
                  <Disclosure.Button
                    key="Login"
                    as="a"
                    href="/login"
                    className={classNames(
                      pathname === '/login' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'block rounded-md px-3 py-2 text-base font-medium'
                    )}
                    aria-current={pathname === '/login' ? 'page' : undefined}
                  >
                    Login
                  </Disclosure.Button> : ""
              }

            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
