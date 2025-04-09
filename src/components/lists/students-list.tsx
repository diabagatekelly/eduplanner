"use client"

import { useState, useEffect } from "react";
import Popup from "../popups/popup";
import { findUser } from "@/api/controller";
import { useDispatch } from "react-redux";
import { saveStudentDetails } from "@/store/actions/userActions";
import { useRouter } from "next/navigation";
import { IUser } from "@/interfaces/IUser";
import { getBorderColor } from "@/utils/getBorderColor";
import { TrashIcon } from "@heroicons/react/24/solid";

export default function StudentsList({userDetails}: {userDetails: IUser}) {
  let args;
  const dispatch = useDispatch();
  const router = useRouter()

  const [studentIdsList, getStudentIdsList] = useState<[string, string][]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [popupUserDetails, getPopupUserDetails] = useState<{userId: string, username: string}>({ ...args });

  useEffect(() => {
    const studentIds = userDetails?.linkedAccountsData?.students || []
    getStudentIdsList([...studentIds])
  }, [userDetails])


   function deleteStudent(studentId: string, studentUsername: string) {
    getPopupUserDetails({ userId: studentId, username: studentUsername })
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
      <>
        <ul className="py-3">
          {studentIdsList?.map(([userId, username]) => (
            <li data-testid="students-list" style={{ borderColor: getBorderColor({completionStatus: null}) }} className="list-item-card" key={userId}>
              <p data-testid="students-email" className="hover:cursor-pointer list-text" onClick={() => fetchStudent(userId)}>{username?.split('-').join(' ')}</p>
              <span data-testid="student-list-delete" onClick={() => deleteStudent(userId, username)}>
                <TrashIcon 
                  title="Delete student"
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
        <p>{errorMessage}</p>
      </>
        :
      <p data-testid="no-students-message">You have no students yet.</p>
      }
      <Popup {...{ showModal, modalType, user: popupUserDetails }} onClose={() => setShowModal(false)} />
      
    </>
  )

}
