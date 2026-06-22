import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { ActivityFormData } from '@/lib/schemas/activity.schemas'

export default function AddActivityForm({
  register,
  errors,
  isSubmitting,
  onSubmit,
}: {
  register: UseFormRegister<ActivityFormData>
  errors: FieldErrors<ActivityFormData>
  isSubmitting: boolean
  onSubmit: () => void
}) {
  return (
    <>
      <form data-testid="add-activity-form" className="space-y-6" onSubmit={onSubmit}>
        <span className="inline-block w-auto mr-2">
          <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
            Name:
          </label>
          <input
            {...register('name')}
            id="name"
            type="text"
            autoComplete="name"
            className="inline-block  rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </span>

        <span className="inline-block w-auto mr-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Description (optional):
          </label>
          <input
            {...register('description')}
            id="description"
            type="text"
            autoComplete="description"
            className="inline-block  rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </span>

        <span className="inline-block w-auto mr-2">
          <label htmlFor="points" className="block text-sm font-medium leading-6 text-gray-900">
            Points (optional):
          </label>
          <input
            {...register('points', { valueAsNumber: true })}
            id="points"
            type="number"
            className="inline-block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </span>

        <fieldset>
          <legend>Has cards?:</legend>
          <div>
            <input {...register('hasCards')} type="radio" id="yesDecks" value="true" />
            <label htmlFor="yesDecks">Yes</label>
          </div>

          <div>
            <input
              {...register('hasCards')}
              type="radio"
              id="noDecks"
              value="false"
              defaultChecked
            />
            <label htmlFor="noDecks">No</label>
          </div>
        </fieldset>

        <span>
          <button
            data-testid="add-activity-btn"
            type="submit"
            disabled={isSubmitting}
            className="default-btn"
          >
            Add activity
          </button>
        </span>
      </form>
    </>
  )
}
