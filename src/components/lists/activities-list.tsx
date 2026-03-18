'use client'

import { useState, useEffect } from 'react'
import Popup from '../popups/popup'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { IUser } from '@/types/IUser'
import { IActivity } from '@/types/IActivity'
import { fromDbFormat } from '@/lib/helpers/formatActivityName'
import { getBorderColor } from '@/lib/helpers/getBorderColor'
import { TrashIcon } from '@heroicons/react/24/solid'

export default function ActivitiesList({
  isMain,
  userDetails,
}: {
  isMain: boolean
  userDetails: IUser
}) {
  const router = useRouter()
  const pathName = usePathname()

  const [activitiesList, setActivitiesList] = useState<IActivity[]>([])
  const [showModal, setShowModal] = useState(false)
  const [popupUserDetails, setPopupUserDetails] = useState<IUser>({} as IUser)
  const [popupItem, setPopupItem] = useState<{ activityName: string }>({ activityName: '' })

  useEffect(() => {
    const activities = userDetails?.activities ?? []
    setActivitiesList([...activities])
  }, [userDetails])

  function deleteActivity(activityName: string) {
    setPopupItem({ activityName })
    setPopupUserDetails(userDetails)
    setShowModal(true)
  }

  function fetchActivity(activityName: string) {
    setShowModal(false)
    let url
    if (isMain) {
      url = `activities/${activityName}`
      router.push(`/${userDetails.username}/${url}`)
    } else {
      let mainUser = pathName.split('/')[1]
      url = `students/${userDetails.username}/activities/${activityName}`
      router.push(`/${mainUser}/${url}`)
    }
  }

  return (
    <>
      {activitiesList?.length ? (
        <>
          <h3 className="component-sub-title">Current activities:</h3>
          <ul data-testid="activities-list" className="py-3">
            {activitiesList?.map((activity) => (
              <li
                style={{ borderColor: getBorderColor(activity) }}
                className="list-item-card"
                key={activity?.name}
              >
                <p
                  data-testid="activity-in-list"
                  className="hover:cursor-pointer list-text"
                  onClick={() => fetchActivity(activity?.name)}
                >
                  {fromDbFormat(activity?.name)}
                </p>
                <span
                  data-testid="delete-activities-in-list"
                  onClick={() => deleteActivity(activity?.name)}
                >
                  <TrashIcon
                    title="Delete activity"
                    fill="none"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p data-testid="no-activities-message">You have no activities yet.</p>
      )}

      {showModal && (
        <Popup
          showModal={showModal}
          config={{ type: 'removeActivity', user: popupUserDetails, item: popupItem }}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
