import { FormEvent } from "react";
import { ICard } from "../../interfaces/ICard";
import React from "react";

function CardFieldset({ objValue, handleInput, index }) {
  const { frontLabel, backLabel } = objValue;
  return (
    <fieldset className="input-group inline-block">
      <span className="inline-block w-auto mr-2">
        <label htmlFor={`front-${index}`} className="block text-sm font-medium leading-6 text-gray-900">Front:</label>
        <input onChange={(e) => handleInput(e, index)} value={frontLabel} id={`front-${index}`} name={`front-${index}`} type="text" autoComplete={`front-${index}`} 
          className="inline-block  rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
          required 
        />
      </span>
      <span className="inline-block w-auto mr-2">
        <label htmlFor={`back-${index}`} className="block text-sm font-medium leading-6 text-gray-900">Back:</label>
        <input onChange={(e) => handleInput(e, index)} value={backLabel} id={`back-${index}`} name={`back-${index}`} type="text" autoComplete={`back-${index}`} 
          className="inline-block  rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
          required 
        />
      </span>
    </fieldset>
  );
}

const AddCardForm = ({
  handleInput,
  formData,
  isLoading,
  submitForm,
  addCardFieldset,
  mode }:
  {
    handleInput: (e: any, index: number) => void,
    formData: ICard[],
    isLoading: boolean,
    submitForm: (e: FormEvent<HTMLFormElement>) => Promise<any>,
    addCardFieldset: () => void,
    mode: string
  }) => {


  return (
    <>
      <div id="addCardButton">
        <button onClick={addCardFieldset} className="mt-5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
          {mode === 'edit' ? 'Cancel Edit' : 'Add Another Card'}
        </button>
      </div>
      <form id="addCardForm" onSubmit={submitForm} method="POST" className="space-y-6" >
        {formData.map((val, i) => (
          <CardFieldset key={`${i}`} objValue={val} handleInput={handleInput} index={i}/>
        ))}
        <hr/>
        <div>
          <button type="submit" disabled={isLoading} className="mt-5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            Submit Cards
          </button>
        </div>
      </form>        
    </>
  )
}

export default AddCardForm;