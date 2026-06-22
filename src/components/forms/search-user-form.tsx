import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { SearchStudentFormData } from '@/lib/schemas/student.schemas'

export default function SearchUserForm({
  register,
  errors,
  isSubmitting,
  onSubmit,
}: {
  register: UseFormRegister<SearchStudentFormData>
  errors: FieldErrors<SearchStudentFormData>
  isSubmitting: boolean
  onSubmit: () => void
}) {
  return (
    <>
      <form data-testid="find-student-form" className="space-y-6" onSubmit={onSubmit} method="POST">
        <input
          data-testid="student-email"
          {...register('email')}
          id="email"
          type="text"
          autoComplete="email"
          className="inline-block  rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        <span>
          <button
            data-testid="find-student-btn"
            type="submit"
            disabled={isSubmitting}
            className="ml-2 default-btn"
          >
            Find Student
          </button>
        </span>
      </form>
    </>
  )
}
