"use-client"

export const OpenModalButton = ({ buttonTxt, setShowModal }) => {
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex w-auto justify-center rounded-md bg-red-600 px-3 mx-1 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
        {buttonTxt}
      </button>
    </>
  )
}