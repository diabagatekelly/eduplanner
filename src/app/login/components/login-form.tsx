import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { LoginFormData } from '@/lib/schemas/auth.schemas'

export default function LoginForm({
  register,
  errors,
  isSubmitting,
  onSubmit,
  onFieldChange,
}: {
  register: UseFormRegister<LoginFormData>
  errors: FieldErrors<LoginFormData>
  isSubmitting: boolean
  onSubmit: () => void
  onFieldChange: () => void
}) {
  return (
    <>
      <form data-testid="login-form" className="space-y-6" onSubmit={onSubmit} method="POST">
        <div>
          <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
            Email:
          </label>
          <div className="mt-2">
            <input
              {...register('email', { onChange: onFieldChange })}
              id="email"
              type="text"
              autoComplete="email"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
              Password:
            </label>
            <div className="text-sm">
              <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                Forgot password?
              </a>
            </div>
          </div>
          <div className="mt-2">
            <input
              {...register('password', { onChange: onFieldChange })}
              id="password"
              type="password"
              autoComplete="current-password"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>
        </div>

        <div>
          <button
            data-testid="login-button"
            type="submit"
            disabled={isSubmitting}
            className="default-btn flex w-full justify-center"
          >
            {isSubmitting ? 'Loading...' : 'Sign In'}
          </button>
        </div>
      </form>
    </>
  )
}
