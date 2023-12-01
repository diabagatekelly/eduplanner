import { useState, useEffect } from "react";
import Popup from "../popups/popup";
import { findUser } from "@/app/api/controller";
import { useDispatch } from "react-redux";
import { updateStudentData } from "@/app/actions/userActions";
import { useRouter } from "next/navigation";

const StudentsList = ({isMain, userDetails, getBorderColor}) => {
  let args;
  const dispatch = useDispatch();
  const router = useRouter()

  const [studentsList, getStudentsList] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [popupUserDetails, getPopupUserDetails] = useState({ ...args });

  useEffect(() => {
    const studentIds = userDetails?.studentIds || []
    getStudentsList([...studentIds])
  }, [userDetails])


   const deleteStudent = (student) => {
    getPopupUserDetails({ email: student })
    setModalType('removeStudent')
    setShowModal(true);
  }

  const onFetchStudentSuccess = (response) => {
    dispatch(updateStudentData(response));
    setShowModal(false)
    const url = `${response.firstName}-${response.lastName}`
    router.push(`/${userDetails.username}/students/${url}`);
  }

  const fetchStudent = async (userEmail) => {
    try {
      const studentEmail = {
        params: {
          email: userEmail
        }
      }
      const response = await findUser(studentEmail)
        .then(async (response) => {
          if (response.status !== 200) {
            setErrorMessage(response.data.message)
          } else {
            onFetchStudentSuccess(response.data)
          }
        })
    } catch(error) {
      console.error(error)
      if (error.response) {
        setErrorMessage(error.response.data.message)
      }
    }
  }




  return (
    <>
      {studentsList?.length ?
        <ul>
          {studentsList?.map((students) => (
            <li style={{ borderColor: getBorderColor('students') }} className="flex justify-between border-4" key={students}>
              <p className="hover:cursor-pointer" onClick={() => fetchStudent(students)}>{students?.split('-').join(' ')}</p>
              <span onClick={() => deleteStudent(students)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </span>
              <p>{errorMessage}</p>
            </li>

          ))}
        </ul> :
        <p>You have no students yet.</p>
      }
      <Popup {...{ showModal, modalType, isMain, user: popupUserDetails }} onClose={() => setShowModal(false)} />
      
    </>
  )

}

export default StudentsList;