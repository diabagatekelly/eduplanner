"use client"

import { useState } from "react";
// import AddCardForm from "../forms/add-card-form.skip";
import { usePathname } from 'next/navigation';
import AddQuranCardForm from "../forms/add-quran-card-form";
import { IUser } from "@/interfaces/IUser";
import { IActivity } from "@/interfaces/IActivity";
import AddLanguageCardForm from "../forms/add-language-card-form";

export default function AddCard({ isMain, userDetails, activity } : {isMain: boolean, userDetails: IUser, activity: IActivity}) {
  const pathname = usePathname();
  
  const [formSuccessMessage, setFormSuccessMessage] = useState("")

  return (
    <div className="justify-items-start">
        {
          pathname.includes('/activities/Quran') && 
          <>
            <h3 className="text-3xl py-3 font-bold">Add New Quran Cards:</h3>
            <AddQuranCardForm {...{isMain, user: userDetails, activity}}/>
          </>
        }
        {
          pathname.includes('Language') &&
          <>
            <h3 className="text-3xl py-3 font-bold">Add New Language Cards:</h3>
            <AddLanguageCardForm {...{isMain, user: userDetails, activity}} />
          </>
        }
        {
          !pathname.includes('/activities/Quran') && !pathname.includes('Language') &&
          <>
            <h3 className="text-3xl py-3 font-bold">Add New Cards:</h3>
            <p>Coming soon for misc!</p>
            {/* <AddCardForm {...{ handleInput, formData, isLoading, submitForm, addCardFieldset, mode: args.mode }} /> */}
          </>
        }
           
      <div>{formSuccessMessage}</div>
    </div>
  )
}
