import { useState, useEffect } from "react";
import Popup from "../popups/popup";
import { useRouter } from "next/navigation";
import { usePathname } from 'next/navigation'

const ActivitiesList = ({isMain, userDetails, getBorderColor}) => {
  let args;
  const router = useRouter();
  const pathName = usePathname();

  const [activitiesList, getActivitiesList] = useState([])
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [popupUserDetails, getPopupUserDetails] = useState({ ...args });
  const [popupItem, getPopupItem] = useState({ ...args })

  useEffect(() => {
    const activities = userDetails?.activities || []
    getActivitiesList([...activities])
  }, [userDetails])


  const deleteActivity = (activity) => {
    getPopupItem({ activityName: activity })
    getPopupUserDetails(userDetails)
    setModalType('removeActivity')
    setShowModal(true);
  }

  const fetchActivity = (activity) => {
    setShowModal(false)
    let url;
    if (isMain) {
      url = `/activities/${activity}`
      router.push(`/${userDetails.username}/${url}`);
    } else {
      let mainUser = pathName.split('/')[1]
      url = `/students/${userDetails.username}/activities/${activity}`
      router.push(`/${mainUser}/${url}`);
    }
  }


  return (
    <>
      {activitiesList?.length ?
        <ul>
          {activitiesList?.map((activity) => (
            <li style={{ borderColor: getBorderColor(activity) }} className="flex justify-between border-4" key={activity.name}>
              <p className="hover:cursor-pointer" onClick={() => fetchActivity(activity.name)}>{activity.name}</p>
              <span onClick={() => deleteActivity(activity.name)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </span>
            </li>
          ))}
        </ul> :
        <p>You have no activities yet.</p>
      }
      <Popup {...{ showModal, modalType, isMain, user: popupUserDetails, item: popupItem }} onClose={() => setShowModal(false)} />
      
    </>
  )

}

export default ActivitiesList;