import { FormEvent } from "react";
import { IUserLogin } from "../../interfaces/IUser";

const SearchUserForm = ({
  handleInput,
  formData,
  isLoading,
  submitForm }:
  {
    handleInput: (e: any) => void,
    formData: any,
    isLoading: boolean,
    submitForm: (e: FormEvent<HTMLFormElement>) => void
  }) => {

  return (
    <>
      <form className="space-y-6" onSubmit={submitForm} method="POST">
        <input onChange={handleInput} value={formData.email} id="email" name="email" type="text" autoComplete="email" required className="inline-block  rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
        <span>
          <button type="submit" disabled={isLoading} className="ml-2 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Find Student</button>
        </span>
      </form>
    </>
  )
}

export default SearchUserForm;