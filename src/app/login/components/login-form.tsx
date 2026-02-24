import { FormEvent } from 'react'

export default function LoginForm({
  handleInput,
  formData,
  isLoading,
  submitForm,
}: {
  handleInput: (e: React.FormEvent<HTMLInputElement>) => void
  formData: { email: string; password: string }
  isLoading: boolean
  submitForm: (e: FormEvent<HTMLFormElement>) => Promise<void>
}) {
  return (
    <>
      <form data-testid="login-form" className="space-y-6" onSubmit={submitForm} method="POST">
        <div>
          <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
            Email:
          </label>
          <div className="mt-2">
            <input
              onChange={handleInput}
              value={formData.email}
              id="email"
              name="email"
              type="text"
              autoComplete="email"
              required
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
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
              onChange={handleInput}
              value={formData.password}
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <button
            data-testid="login-button"
            type="submit"
            disabled={isLoading}
            className="default-btn flex w-full justify-center"
          >
            {isLoading ? 'Loading...' : 'Sign In'}
          </button>
        </div>
      </form>
    </>
  )
}
