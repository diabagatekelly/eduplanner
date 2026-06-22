'use client'

import Link from 'next/link'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/solid'
import { useParams, usePathname } from 'next/navigation'
import { useMemo } from 'react'

type Crumb = { label: string; href: string | null }

export default function Breadcrumbs() {
  const params = useParams()
  const pathUsername = params.username as string
  const pathCurrentActivity = params.activity as string
  const pathStudent = params.student as string
  const pathName = usePathname()

  const breadcrumbs = useMemo<Crumb[]>(() => {
    const segments = pathName.split('/')
    const crumbs: Crumb[] = []

    segments.forEach((_seg, idx) => {
      switch (idx) {
        case 1:
          crumbs.push({ label: 'Home', href: '/home' })
          break
        case 2:
          crumbs.push({ label: 'Dashboard', href: `/${pathUsername}` })
          break
        case 3:
          if (segments[2] === 'activities') {
            crumbs.push({ label: pathCurrentActivity, href: null })
          } else if (segments[2] === 'students') {
            if (segments.length === 4) {
              crumbs.push({ label: pathStudent, href: null })
            } else if (segments.length > 4) {
              crumbs.push({
                label: `All ${pathStudent}'s Activities`,
                href: `/${pathUsername}/students/${pathStudent}`,
              })
              crumbs.push({ label: pathCurrentActivity, href: null })
            }
          }
          break
        default:
          break
      }
    })

    return crumbs
  }, [pathName, pathUsername, pathCurrentActivity, pathStudent])

  function formatBreadcrumbText(text: string) {
    return text.split('-').join(' ')
  }

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
        {breadcrumbs.map((crumb, i) => (
          <li className="inline-flex items-center" key={`${crumb.label}-${i}`}>
            {i > 0 && (
              <ChevronRightIcon
                className="rtl:rotate-180 w-4 h-4 text-gray-400 mx-1"
                strokeWidth={2}
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {crumb.href === null ? (
              <span
                data-testid={`breadcrumbs-${crumb.label}`}
                aria-current="page"
                className="ms-1 text-sm font-medium text-gray-500 md:ms-2 dark:text-gray-400"
              >
                {formatBreadcrumbText(crumb.label)}
              </span>
            ) : (
              <Link
                data-testid={`breadcrumbs-${crumb.label}`}
                href={crumb.href}
                className={
                  crumb.label === 'Home'
                    ? 'inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white'
                    : 'ms-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ms-2 dark:text-gray-400 dark:hover:text-white'
                }
              >
                {crumb.label === 'Home' && (
                  <HomeIcon className="w-4 h-4 me-2.5" aria-hidden="true" fill="currentColor" />
                )}
                {formatBreadcrumbText(crumb.label)}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
