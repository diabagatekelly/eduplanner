"use client"

import LoginForm from "@/components/forms/login-form";
import React, { useState, FormEvent } from "react";
import { useRouter } from 'next/navigation'
import { ILogin } from "@/interfaces/IUser";
import Link from "next/link";
import { setAuthToken } from "@/store/actions/authActions";
import { useDispatch } from "react-redux";
import { populateUser } from "@/store/actions/userActions";
import { loginUser } from "@/api/controller";

export default function Login() {
  const dispatch = useDispatch()
  const router = useRouter()

  const [formData, setFormData] = useState<ILogin>({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [formSuccess, setFormSuccess] = useState(false)
  const [formSuccessMessage, setFormSuccessMessage] = useState("")

  const handleInput = (e: any) => {
    const fieldName: string = e.target.name;
    const fieldValue: any = e.target.value;

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
      const jsonData = {}

      for (const pair of rawFormData.entries()) {
        jsonData[pair[0]] = `${pair[1]}`;
      }

      const response = await loginUser(jsonData)
        .then((response) => {
          setIsLoading(false)
          if (response.status !== 200) {
            setFormSuccess(false)
            setFormSuccessMessage(response.data.message)
          } else {
            setFormData({
              email: "",
              password: "",
            });
            setFormSuccess(true);
            setFormSuccessMessage('Logging in...')
            const url = `${response.data.firstName}-${response.data.lastName}`
            router.push('/' + url)
            dispatch(setAuthToken(response.data));
            dispatch(populateUser());
          }
        })


    } catch (error) {
      console.error(error)
      setIsLoading(false)
      setFormSuccess(false)
      if (error.response) {
        setFormSuccessMessage(error.response.data.message)
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
        <div className="mt-3 text-center">{formSuccessMessage}</div>

        <p className="mt-10 text-center text-sm text-gray-500">
          <span>No account yet? </span>
          <Link data-testid="register-link" href="/register" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">Create an account</Link>
        </p>
      </div>
    </div>
  )
}