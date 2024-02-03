"use client"

import React, { useState, FormEvent } from "react";
import { useRouter } from 'next/navigation';
import { useDispatch } from "react-redux";
import RegisterForm from "@/components/forms/register-form";
import { IUser, IUserFormData } from "@/interfaces/IUser";
import { setAuthToken } from "@/store/actions/authActions";
import { registerUser } from "@/api/controller";
import { ISODateString } from "@/interfaces/isoDateType";
import { formatISODate } from "@/utils/formatDate";

interface IRegister {
  handleInput: (e: React.FormEvent<HTMLInputElement>) => void,
  submitForm: (e: FormEvent<HTMLFormElement>) => Promise<void>
}

interface IResponse {
  status: number,
  data: IResponseBody
}

interface IResponseBody {
  status: string,
  message: string,
  details?: Record<any, any>
}

export default function Register<IRegister>() {
  const dispatch = useDispatch();
  const router = useRouter();

  const [formData, setFormData] = useState<IUserFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    accountType: ""
  });

  const [isLoading, setIsLoading] = useState(false)
  const [formSubmitOutcomeMessage, setFormSubmitOutcomeMessage] = useState("")

  function handleInput(e: React.FormEvent<HTMLInputElement>) {
    const target = e.target as HTMLInputElement
    const fieldName = target.name;
    const fieldValue = target.value;

    setFormData((prevState) => ({
      ...prevState,
      [fieldName]: fieldValue
    }));
  }

  async function submitForm(e: FormEvent<HTMLFormElement>) {
    // We don't want the page to refresh
    e.preventDefault()
    setIsLoading(true) // Set loading to true when the request starts

    try {
      const rawFormData = new FormData(e.currentTarget)
      const jsonData: IUserFormData = {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        accountType: ""
      }

      for (const pair of rawFormData.entries()) {
        jsonData[pair[0]] = `${pair[1]}`;
      }

      const userId = btoa(jsonData.email)
      const username = `${jsonData.firstName}-${jsonData.lastName}`

      const userData: IUser = {
        ...jsonData,
        userId,
        username,
        lastLogin: formatISODate(new Date().toISOString() as ISODateString) 
      };

      const response = await registerUser(userData) as unknown as IResponse;
      const {status, data} = response;
      setIsLoading(false)

      if (status !== 200) {
        setFormSubmitOutcomeMessage(response.data.message)
      } else {
        const {message, details} = data;
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          accountType: "",
        });
        setFormSubmitOutcomeMessage(message)
        router.push('/' + details.user.username )
        dispatch(setAuthToken(details));
      }

    } catch (error) {
      setIsLoading(false)
      console.log(error)

      if (!error.response) {
        setFormSubmitOutcomeMessage('Server is down. Try again later.')
        return
      }

      const {status, data} = error.response;
      setFormSubmitOutcomeMessage('Failed to create user due to an internal error. Please try again later.')
    }
  }

  return (
    <div>
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Create an account</h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <RegisterForm {...{ handleInput, formData, isLoading, submitForm }} />
          <div className="submit-form-outcome-message">{formSubmitOutcomeMessage}</div>
        </div>
      </div>
    </div>
  )
};