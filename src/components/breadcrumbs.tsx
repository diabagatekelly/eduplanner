"use client"

import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/solid'
import { useParams, usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

export default function Breadcrumbs() {
  const pathUsername = (useParams().username as string)?.split('-')[0]
  const pathCurrentActivity = (useParams().activity as string)?.split('-')[0]
  const pathStudent = (useParams().student as string)?.split('-')[0]
  const pathName = usePathname()
  const pathSegments = useMemo(() => pathName?.split('/'), [pathName])

  const [breadcrumbs, updateBreadcrumbs] = useState<any[]>([])

  useEffect(() => {
    const breadcrumbsDict = {};
    pathSegments.forEach((_seg, idx) => {
      switch(idx) {
        case 1:
          breadcrumbsDict['Home'] = '/'
          break;
        case 2:
          breadcrumbsDict['Dashboard'] = `/${pathUsername}`
          break;
        case 3:
          if (pathSegments[2] === 'activities') {
            breadcrumbsDict[`${pathCurrentActivity}`] = null
          } else if (pathSegments[2] === 'students') {
            if (pathSegments.length === 4) {
              breadcrumbsDict[`${pathStudent}`] = null
            } else if (pathSegments.length > 4) {
              breadcrumbsDict[`All ${pathStudent} activities`] = `/${pathUsername}/students/${pathStudent}`
              breadcrumbsDict[`${pathCurrentActivity}`] = null
            }
          }
          break;
        default:
          break;
      }
    });

    updateBreadcrumbs(Object.entries(breadcrumbsDict));
  }, [pathSegments, pathUsername, pathCurrentActivity, pathStudent])


  return (
    <>
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
          {breadcrumbs.map((crumb, i) => (
            <li className="inline-flex items-center" key={`${crumb}-${i}`}>
              {crumb[0] === 'Home' && 
                <a data-testid={`breadcrumbs-${crumb[0]}`} href={`${crumb[1]}`} className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white">
                  <HomeIcon 
                    className="w-4 h-4 me-2.5"
                    aria-hidden="true"
                    fill="currentColor"
                  />
                  {crumb[0]}
                </a>
              }
              {crumb[0] !== 'Home' && 
                <>
                  <ChevronRightIcon 
                    className="rtl:rotate-180 w-4 h-4 text-gray-400 mx-1" 
                    strokeWidth={2}
                    aria-hidden="true"
                    fill="none" 
                    stroke="currentColor"
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  {crumb[1] === null && 
                    <span data-testid={`breadcrumbs-${crumb[0]}`} className="ms-1 text-sm font-medium text-gray-500 md:ms-2 dark:text-gray-400">{crumb[0]}</span>}
                
                  {crumb[1] !== null && 
                    <a data-testid={`breadcrumbs-${crumb[0]}`} href={`${crumb[1]}`} className="ms-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ms-2 dark:text-gray-400 dark:hover:text-white">{crumb[0]}</a>}
                </>
              }
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}