import { FormEvent } from "react";

export default function SearchUserForm({
  handleInput,
  formData,
  isLoading,
  submitForm }:
  {
    handleInput: (e: React.FormEvent<HTMLInputElement>) => void,
    formData: {email: string},
    isLoading: boolean,
    submitForm: (e: FormEvent<HTMLFormElement>) => Promise<void>
  }) {

  return (
    <>
      <form data-testid="find-student-form" className="space-y-6" onSubmit={submitForm} method="POST">
        <input data-testid="student-email" onChange={handleInput} value={formData.email} id="email" name="email" type="text" autoComplete="email" required className="inline-block  rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
        <span>
          <button data-testid="find-student-btn" type="submit" disabled={isLoading} className="ml-2 default-btn">Find Student</button>
        </span>
      </form>
    </>
  )
}
