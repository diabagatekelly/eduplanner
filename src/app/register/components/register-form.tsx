import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { RegisterFormData } from '@/lib/schemas/auth.schemas'

export default function RegisterForm({
  register,
  errors,
  isSubmitting,
  onSubmit,
  onFieldChange,
}: {
  register: UseFormRegister<RegisterFormData>
  errors: FieldErrors<RegisterFormData>
  isSubmitting: boolean
  onSubmit: () => void
  onFieldChange: () => void
}) {
  return (
    <>
      <form data-testid="register-form" className="space-y-6" onSubmit={onSubmit} method="POST">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium leading-6 text-gray-900">
            First Name:
          </label>
          <div className="mt-2">
            <input
              {...register('firstName', { onChange: onFieldChange })}
              id="firstName"
              type="text"
              autoComplete="firstName"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
            {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
          </div>
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium leading-6 text-gray-900">
            Last Name:
          </label>
          <div className="mt-2">
            <input
              {...register('lastName', { onChange: onFieldChange })}
              id="lastName"
              type="text"
              autoComplete="lastName"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
            {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
          </div>
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
            Password:
          </label>
          <div className="mt-2">
            <input
              {...register('password', { onChange: onFieldChange })}
              id="password"
              type="password"
              autoComplete="password"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
            Email:
          </label>
          <div className="mt-2">
            <input
              {...register('email', { onChange: onFieldChange })}
              id="email"
              type="email"
              autoComplete="email"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>
        </div>
        <fieldset>
          <legend>Account Type:</legend>
          <div>
            <input
              {...register('accountType')}
              type="radio"
              id="student"
              value="student"
              defaultChecked
            />
            <label htmlFor="student">Student</label>
          </div>

          <div>
            <input {...register('accountType')} type="radio" id="teacher" value="teacher" />
            <label htmlFor="teacher">Teacher</label>
          </div>
        </fieldset>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full justify-center default-btn"
          >
            {isSubmitting ? 'Loading...' : 'Create Account'}
          </button>
        </div>
      </form>
    </>
  )
}
