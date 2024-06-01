import { removeAuthToken } from "@/store/actions/authActions";
import { resetUser } from "@/store/actions/userActions";
import { useRouter } from "next/navigation";
import { deleteUser } from "../../api/controller";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const DeleteAccountPopup = ({onClose, showModal, isMain, ...childArgs}) => {
  const dispatch = useDispatch()
  const router = useRouter()

  const [userInfo, getUserInfo] = useState({ ...childArgs });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const user = childArgs.user
    getUserInfo(user)

  }, [showModal, isMain, childArgs])

  const deleteAccount = async () => {
    try {
      const userDetails = { email: userInfo.email }
      const response = await deleteUser(userDetails)
        .then(async (response) => {
          if (response.status !== 200) {
            setErrorMessage(response.data.message)
          } else {
            onDeleteAccountSuccess()
          }
        })
    } catch (error) {
      console.error(error)
      if (error.response) {
        setErrorMessage(error.response.data.message)
      }
    }
  }

  const onDeleteAccountSuccess = () => {
    dispatch(resetUser());
    dispatch(removeAuthToken());
    onClose();
    router.push('/register');
  }
 
  return (
    <>
      <dialog open={showModal} id="popup-modal" className="fixed top-0 left-0 right-0 z-50 overflow-x-hidden overflow-y-auto md:inset-0 max-h-full border-4 border-gray-800 rounded-lg">
        <div className="relative w-full max-w-md max-h-full">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <button onClick={onClose} type="button" id="popup-close-btn" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="popup-modal">
              <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
            <div className="p-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto mb-4 text-green-400 w-12 h-12 dark:text-green-200">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
              <div className="modal-message">
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to delete this account forever?</h3>
                <h5 className="mb-5"><span>{isMain ? `${userInfo?.firstName} ${userInfo?.lastName} - ${userInfo?.email}` : `${userInfo?.email}`} </span></h5>
              </div>

              <button onClick={deleteAccount} data-modal-hide="popup-modal" type="button" className="text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2">
                Yes, I&#39;m sure
              </button>
              <button onClick={onClose} data-modal-hide="popup-modal" type="button" className="text-white-500 bg-red hover:bg-red-100 focus:ring-4 focus:outline-none focus:ring-red-200 rounded-lg border border-red-200 text-sm font-medium px-5 py-2.5 hover:text-red-900 focus:z-10 dark:bg-red-700 dark:text-white-300 dark:border-red-500 dark:hover:text-black dark:hover:bg-gray-600 dark:focus:ring-red-600">No, cancel</button>
              <p>{errorMessage}</p>
            </div>
          </div>
        </div>
      </dialog>
    </>
  )
}

export default DeleteAccountPopup;