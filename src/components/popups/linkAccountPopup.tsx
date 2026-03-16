import { useEffect, useState } from 'react'
import { useLinkStudent } from '@/hooks/use-student-mutations'
import { IUser } from '@/types/IUser'
import { LinkIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { handleMutationError } from '@/lib/helpers/mutation-error-handler'
import { toast } from 'sonner'

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
  const teacherId = user?.userId ?? ''
  const linkStudentMutation = useLinkStudent(teacherId)

  const [studentInfo, getStudentInfo] = useState<IUser | Partial<IUser>>({ ...newStudent })
  const [teacher, getTeacherData] = useState<IUser | Partial<IUser>>({ ...user })

  useEffect(() => {
    getStudentInfo({ ...newStudent })
    getTeacherData({ ...user })
  }, [showModal, newStudent, user])

  async function addStudent() {
    try {
      if (!teacherId) throw new Error('Missing teacherId for linkStudent')
      await linkStudentMutation.mutateAsync([studentInfo.userId!, studentInfo.username!])
      toast.success('Successfully added a new student')
      onClose()
    } catch (error: unknown) {
      handleMutationError(error, 'add new student')
    }
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
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
