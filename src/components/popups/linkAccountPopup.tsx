import { linkAccount } from '../../api/controller'
import { useEffect, useState } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { addNewStudent, saveStudentDetails } from '@/store/actions/userActions'
import { IUser } from '@/types/IUser'
import { LinkIcon, XMarkIcon } from '@heroicons/react/24/solid'

export default function LinkAccountPopup({
  onClose,
  showModal,
  newStudent,
  user,
}: {
  onClose: () => void
  showModal: boolean
  newStudent?: IUser | Partial<IUser>
  user?: IUser | Partial<IUser>
}) {
  const dispatch = useAppDispatch()

  const [studentInfo, getStudentInfo] = useState<IUser | Partial<IUser>>({ ...newStudent })
  const [teacher, getTeacherData] = useState<IUser | Partial<IUser>>({ ...user })
  const [outcomeMessage, setOutcomeMessage] = useState('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    getStudentInfo(newStudent)
    getTeacherData(user)
  }, [showModal, newStudent, user])

  async function addStudent() {
    try {
      setIsLoading(true)
      const linkAccountsData: { teacherId: string; studentId: [string, string] } = {
        teacherId: teacher.userId,
        studentId: [studentInfo.userId, studentInfo.username],
      }
      await linkAccount(linkAccountsData)
      onLinkAccountSuccess()
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      console.log(error)

      if (!error.response) {
        setOutcomeMessage('Server is down. Try again later.')
        return
      }

      const { status, data } = error.response

      if (status === 500) {
        setOutcomeMessage(
          'Failed to add new student due to an internal error. Please try again later.'
        )
      } else {
        setOutcomeMessage(data.message)
      }
    }
  }

  function onLinkAccountSuccess() {
    dispatch(addNewStudent(studentInfo as IUser))
    dispatch(saveStudentDetails(studentInfo as IUser))
    setOutcomeMessage('Successfully added a new student')
    onClose()
    window.location.reload()
  }

  return (
    <>
      <div
        data-testid="link-account-popup"
        hidden={!showModal}
        id="popup-modal"
        className="popup-styling"
      >
        <div className="relative w-full max-w-md max-h-full">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <button
              data-testid="close-link-account-popup"
              onClick={onClose}
              type="button"
              className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              data-modal-hide="popup-modal"
            >
              <XMarkIcon
                title="Close modal"
                className="w-6 h-6"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <span className="sr-only">Close modal</span>
            </button>
            <div className="p-6 text-center">
              <LinkIcon
                fill="none"
                strokeWidth={1}
                stroke="currentColor"
                className="mx-auto mb-4 text-green-400 w-12 h-12 dark:text-green-200"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <div className="modal-message">
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                  Are you sure you want to add this student?
                </h3>
                <h5 className="mb-5">
                  <span>
                    {studentInfo?.firstName} {studentInfo?.lastName} - {studentInfo?.email}{' '}
                  </span>
                </h5>
              </div>

              <button
                data-testid="link-accounts-btn"
                onClick={addStudent}
                data-modal-hide="popup-modal"
                type="button"
                className="green-btn mr-2"
              >
                Yes, I&#39;m sure
              </button>
              <button
                onClick={onClose}
                data-modal-hide="popup-modal"
                type="button"
                className="neutral-btn"
              >
                No, cancel
              </button>
              <p data-testid="add-student-outcome-message">{outcomeMessage}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
