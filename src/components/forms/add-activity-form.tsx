import { FormEvent } from 'react'
import { IActivityFormData } from '../../types/IActivity'

export default function AddActivityForm({
  handleInput,
  formData,
  isLoading,
  submitForm,
}: {
  handleInput: (e: React.FormEvent<HTMLInputElement>) => void
  formData: IActivityFormData
  isLoading: boolean
  submitForm: (e: FormEvent<HTMLFormElement>) => Promise<void>
}) {
  return (
    <>
      <form
        data-testid="add-activity-form"
        className="space-y-6"
        onSubmit={submitForm}
        method="POST"
      >
        <span className="inline-block w-auto mr-2">
          <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
            Name:
          </label>
          <input
            onChange={handleInput}
            value={formData.name}
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className="inline-block  rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </span>

        <span className="inline-block w-auto mr-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Description (optional):
          </label>
          <input
            onChange={handleInput}
            value={formData.description}
            id="description"
            name="description"
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
            onChange={handleInput}
            value={formData.points}
            id="points"
            name="points"
            type="number"
            className="inline-block rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </span>

        <fieldset>
          <legend>Has cards?:</legend>
          <div>
            <input type="radio" id="yesDecks" name="hasCards" value="true" />
            <label htmlFor="yesDecks">Yes</label>
          </div>

          <div>
            <input type="radio" id="noDecks" name="hasCards" value="false" defaultChecked />
            <label htmlFor="noDecks">No</label>
          </div>
        </fieldset>

        <span>
          <button
            data-testid="add-activity-btn"
            type="submit"
            disabled={isLoading}
            className="default-btn"
          >
            Add activity
          </button>
        </span>
      </form>
    </>
  )
}
