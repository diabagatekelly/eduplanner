"use client"

import LoginForm from "@/components/forms/login-form";
import React, { useState, FormEvent } from "react";
import { useRouter } from 'next/navigation'
import { IUserLogin } from "@/interfaces/IUser";
import { IResponse } from "@/interfaces/IApiResponse";
import Link from "next/link";
import { setAuthToken } from "@/store/actions/authActions";
import { useDispatch } from "react-redux";
import { populateUser } from "@/store/actions/userActions";
import { loginUser } from "@/api/controller";

interface ILogin {

}

export default function Login<ILogin>() {
  const dispatch = useDispatch()
  const router = useRouter()

  const [formData, setFormData] = useState<IUserLogin>({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [formSubmitOutcomeMessage, setFormSubmitOutcomeMessage] = useState("")

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement
    const fieldName: string = target.name;
    const fieldValue: any = target.value;

    setFormData((prevState) => ({
      ...prevState,
      [fieldName]: fieldValue
    }));

  }

  async function submitForm(e: FormEvent<HTMLFormElement>) {
    try {
      // We don't want the page to refresh
      e.preventDefault()
      setIsLoading(true) // Set loading to true when the request starts

      const rawFormData = new FormData(e.currentTarget)
      const userCredentials: IUserLogin = {
        email: "",
        password: ""
      }

      for (const pair of rawFormData.entries()) {
        userCredentials[pair[0]] = `${pair[1]}`;
      }

      const response = await loginUser(userCredentials) as unknown as IResponse;

      const {data} = response;
      setIsLoading(false)

      const {message, details} = data;

      setFormData({
        email: "",
        password: ""
      });
      setFormSubmitOutcomeMessage('Logging in ...')
      router.push('/' + details.user.username )
      dispatch(setAuthToken(details));
      dispatch(populateUser());
    } catch (error) {
      setIsLoading(false)
      console.log(error)


      if (!error.response) {
        setFormSubmitOutcomeMessage('Server is down. Try again later.')
        return
      }

      const {status, data} = error.response;

      if (status === 500) {
        setFormSubmitOutcomeMessage('Failed to login due to an internal error. Please try again later.')
      } else {
        setFormSubmitOutcomeMessage(data.message)
      }

    }
  }

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Sign in to your account</h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <LoginForm {...{ handleInput, formData, isLoading, submitForm }} />
        <div className="mt-3 text-center">{formSubmitOutcomeMessage}</div>

        <p className="mt-10 text-center text-sm text-gray-500">
          <span>No account yet? </span>
          <Link data-testid="register-link" href="/register" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">Create an account</Link>
        </p>
      </div>
    </div>
  )
}