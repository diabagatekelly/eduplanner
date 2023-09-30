import { FormEvent } from "react";
import { IUserLogin } from "../interfaces/IUser";

const LoginForm = ({ 
  handleInput,
  formData,
  isLoading,
  submitForm }: 
  {
    handleInput: (e: any) => void,
    formData: IUserLogin,
    isLoading: boolean,
    submitForm: (e: FormEvent<HTMLFormElement>) => void
  }) => {

  return (
    <>
      <form className="space-y-6" onSubmit={submitForm} method="POST">
        <div>
          <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">Email:</label>
          <div className="mt-2">
            <input onChange={handleInput} value={formData.email} id="email" name="email" type="text" autoComplete="email" required className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">Password:</label>
            <div className="text-sm">
              <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">Forgot password?</a>
            </div>
          </div>
          <div className="mt-2">
            <input onChange={handleInput} value={formData.password} id="password" name="password" type="password" autoComplete="current-password" required className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
          </div>
        </div>

        <div>
          <button type="submit" disabled={isLoading} className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">{isLoading ? 'Loading...' : 'Sign In'}</button>
        </div>
      </form>
    </>
  )
}

export default LoginForm;