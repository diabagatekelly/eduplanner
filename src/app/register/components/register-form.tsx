import { FormEvent } from "react";
import { IUserFormData } from "../../../types/IUser";

export default function RegisterForm({
  handleInput,
  formData,
  isLoading,
  submitForm }:
  {
    handleInput: (e: React.FormEvent<HTMLInputElement>) => void,
    formData: IUserFormData,
    isLoading: boolean,
    submitForm: (e: FormEvent<HTMLFormElement>) => void
  }) {

  return (
    <>
      <form data-testid="register-form" className="space-y-6" onSubmit={submitForm} method="POST">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium leading-6 text-gray-900">First Name:</label>
          <div className="mt-2">
            <input onChange={handleInput} value={formData.firstName} id="firstName" name="firstName" type="text" autoComplete="firstName" required className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
          </div>
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium leading-6 text-gray-900">Last Name:</label>
          <div className="mt-2">
            <input onChange={handleInput} value={formData.lastName} id="lastName" name="lastName" type="text" autoComplete="lastName" required className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
          </div>
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">Password:</label>
          <div className="mt-2">
            <input onChange={handleInput} value={formData.password} id="password" name="password" type="password" autoComplete="password" required className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">Email:</label>
          <div className="mt-2">
            <input onChange={handleInput} value={formData.email} id="email" name="email" type="email" autoComplete="email" required className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
          </div>
        </div>
        <fieldset>
          <legend>Account Type:</legend>
          <div>
            <input type="radio" id="student" name="accountType" value="student" defaultChecked />
            <label htmlFor="student">Student</label>
          </div>

          <div>
            <input type="radio" id="teacher" name="accountType" value="teacher" />
            <label htmlFor="teacher">Teacher</label>
          </div>
        </fieldset>

        <div>
          <button type="submit" disabled={isLoading} className="flex w-full justify-center default-btn">{isLoading ? 'Loading...' : 'Create Account'}</button>
        </div>
      </form>
    </>
  )
}
