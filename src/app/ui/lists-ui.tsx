import { useEffect, useState } from "react";
import store from "../store";
import Popup from "./popup";
import ListFetchStudent from "../listItemActions/fetchStudent";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { updateStudentData } from "../actions/userActions";

const ListsUi = ({ listType, isMain }) => {
  let args;
  let listActionClass;
  const dispatch = useDispatch()
  const router = useRouter()

  const [listData, setListData] = useState([])
  const [user, getUserData] = useState({ ...args });
  const [errorMessage, setErrorMessage] = useState('')
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('')
  const [newStudent, setStudent] = useState({...args})
  const [activityName, setActivity] = useState('')

  useEffect(() => {
    const { userReducer } = store.getState()
    getUserData(userReducer);

    if (listType === 'students') {
      const studentIds = user.studentIds || []
      setListData([...studentIds])
    } else if (listType === 'activities') {
      const activities = user.activities || []
      setListData([...activities])
    }
  }, [user, listType])

  const onError = (message) => {
    setErrorMessage(message)
  }

  const onFetchStudentSuccess = (response) => {
    dispatch(updateStudentData(response));
    setShowModal(false)
    const url = `${response.firstName}-${response.lastName}`
    router.push(`/${user.username}/students/${url}`);
  }

  const fetchListItem = async (dataPt) => {
    if (listType === 'students') {
      listActionClass = new ListFetchStudent(onError, onFetchStudentSuccess)
      listActionClass.listAction(dataPt)
    } else if (listType === 'activities') {
      setShowModal(false)
      const url = isMain ? `/activities/${dataPt}` : `/students/${newStudent.username}/activities/${dataPt}`
      router.push(`/${user.username}/${url}`);
    }
  }

  const deleteItem = (item) => {
    if (listType === 'students') {
      deleteStudent(item)
    } else if (listType === 'activities') {
      deleteActivity(item)
    }
  }

  const deleteStudent = (student) => {
    setStudent({email: student})
    setModalType('removeStudent')
    setShowModal(true);
  }

  const deleteActivity = (activityName) => {
    setActivity(activityName)
    setModalType('removeActivity')
    setShowModal(true);
  }

  const setDataPt = (dataPt) => {
    return typeof dataPt === 'string' ? dataPt : dataPt.name
  }

  const getBorderColor = (dataPt) => {
    let borderColor = 'orange'
    if (listType === 'activities') {
      if (dataPt.completionStatus === 'pending') {
        borderColor = 'orange'
      } else if (dataPt.completionStatus === 'completed') {
        borderColor = 'green'
      } else {
        borderColor = 'red'
      }
    }
    return borderColor;
  }

  return (
    <>
      {listData?.length ?
        <ul>
          {listData?.map((dataPt) => (
            <li style={{borderColor: getBorderColor(dataPt)}} className="flex justify-between border-4" key={setDataPt(dataPt)}>
              <p className="hover:cursor-pointer" onClick={() => fetchListItem(setDataPt(dataPt))}>{setDataPt(dataPt).split('-').join(' ')}</p>
              <span onClick={() => deleteItem(setDataPt(dataPt))}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </span>
              <p>{errorMessage}</p>
            </li>

          ))}
        </ul> :
        <p>You have no {listType} yet.</p>
      }
      <Popup {...{ showModal, modalType, newStudent, isMain, activityName }} onClose={() => setShowModal(false)} />
    </>
  )
}

export default ListsUi;