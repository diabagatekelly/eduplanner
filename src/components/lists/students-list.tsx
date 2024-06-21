import { useState, useEffect } from "react";
import Popup from "../popups/popup";
import { findUser } from "@/api/controller";
import { useDispatch } from "react-redux";
import { saveStudentDetails } from "@/store/actions/userActions";
import { useRouter } from "next/navigation";
import { IUser } from "@/interfaces/IUser";

export default function StudentsList({userDetails, getBorderColor}: {userDetails: IUser, getBorderColor: any}) {
  let args;
  const dispatch = useDispatch();
  const router = useRouter()

  const [studentIdsList, getStudentIdsList] = useState<[string, string][]>([])
  const [studentNames, getStudentName] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [popupUserDetails, getPopupUserDetails] = useState<{userId: string}>({ ...args });

  useEffect(() => {
    const studentIds = userDetails?.linkedAccountsData?.students || []
    getStudentIdsList([...studentIds])

    if (userDetails?.students) {
      const studentNames = Object.keys(userDetails?.students)
        .map(username => username.split('-').join(' '))
      getStudentName([...studentNames])
    }
  }, [userDetails])


   function deleteStudent(studentId: string) {
    getPopupUserDetails({ userId: studentId })
    setModalType('removeStudent')
    setShowModal(true);
  }

  async function fetchStudent(userId: string) {
    if (!userDetails?.students) {
      await getStudentDetails(userId)
      return;
    }

    if (userDetails?.students) {
      const allStudentObj = Object.values(userDetails?.students) 
      const selectedStudent = allStudentObj.find(student => student.userId === userId)
      
      if (!selectedStudent) {
        await getStudentDetails(userId)
        return
      }

      onFetchStudentSuccess(selectedStudent)
    }
  }

  async function getStudentDetails(userId: string): Promise<void> {
    try {
      const response = await findUser({userId})
      const {data} = response;
      const {details}: {message: string, details: {student: IUser}} = data;
      onFetchStudentSuccess(details.student)
      
    } catch (error) {
      console.log(error)

      if (!error.response) {
        setErrorMessage('Server is down. Try again later.')
        return
      }

      const {status, data} = error.response;

      if (status === 500) {
        setErrorMessage('Failed to fetch student details due to an internal error. Please try again later.')
      } else {
        setErrorMessage(data.message)
      }
    }
  }

  function onFetchStudentSuccess(studentDetails: IUser) {
    dispatch(saveStudentDetails(studentDetails));
    setShowModal(false)
    router.push(`/${userDetails.username}/students/${studentDetails.username}`);
  }

  return (
    <>
      {studentIdsList?.length ?
      <div>
        <ul>
          {studentIdsList?.map(([userId, username]) => (
            <li data-testid="students-list" style={{ borderColor: getBorderColor('students') }} className="flex justify-between border-4" key={userId}>
              <p data-testid="students-email" className="hover:cursor-pointer" onClick={() => fetchStudent(userId)}>{username.split('-').join(' ')}</p>
              <span data-testid="student-list-delete" onClick={() => deleteStudent(userId)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </span>
            </li>
          ))}
        </ul> 
        <p>{errorMessage}</p>
      </div>
        :
        <p data-testid="no-students-message">You have no students yet.</p>
      }
      <Popup {...{ showModal, modalType, user: popupUserDetails }} onClose={() => setShowModal(false)} />
      
    </>
  )

}
