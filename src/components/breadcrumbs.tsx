"use client"

import { useParams, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Breadcrumbs() {
  const pathUsername = useParams().username
  const pathCurrentActivity = useParams().activity
  const pathStudent = useParams().student
  const pathName = usePathname()
  const pathSegments = pathName.split('/')

  const [breadcrumbs, updateBreadcrumbs] = useState<any[]>([])

  useEffect(() => {
    let updatedBreadcrumbs = Object.entries(constructBreadcrumbsDict());
    updateBreadcrumbs(updatedBreadcrumbs);
  }, [constructBreadcrumbsDict])

  function constructBreadcrumbsDict() {
    pathSegments.forEach((_seg, idx) => {
      switch(idx) {
        case 1:
          breadcrumbs['Home'] = '/'
          break;
        case 2:
          breadcrumbs['Dashboard'] = `/${pathUsername}`
          break;
        case 3:
          if (pathSegments[2] === 'activities') {
            breadcrumbs[`${pathCurrentActivity}`] = null
          } else if (pathSegments[2] === 'students') {
            if (pathSegments.length === 4) {
              breadcrumbs[`${pathStudent}`] = null
            } else if (pathSegments.length > 4) {
              breadcrumbs[`All ${pathStudent} activities`] = `/${pathUsername}/students/${pathStudent}`
              breadcrumbs[`${pathCurrentActivity}`] = null
            }
          }
          break;
      }
    });
    return breadcrumbs;
  }


  return (
    <>
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
          {breadcrumbs.map((crumb, i) => (
            <li className="inline-flex items-center" key={`${crumb}-${i}`}>
              {crumb[0] === 'Home' && 
                <a data-testid={`breadcrumbs-${crumb[0]}`} href={`${crumb[1]}`} className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white">
                  <svg className="w-3 h-3 me-2.5" aria-hidden="true" xmlns="http:www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
                  </svg>
                  {crumb[0]}
                </a>
              }
              {crumb[0] !== 'Home' && 
                <>
                  <svg className="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http:www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                  </svg>
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