"use client"

import LoginForm from "../ui/login-form";
import React, { useState, FormEvent } from "react";
import { useRouter } from 'next/navigation'
import { IUserLogin } from "../interfaces/IUser";
import axios from "axios";
import Link from "next/link";
import { setAuthToken } from "../actions/authActions";
import { useDispatch } from "react-redux";
import { populateUser } from "../actions/userActions";

export default function Login() {
  const dispatch = useDispatch()

  const [formData, setFormData] = useState<IUserLogin>({
    username: "",
    password: "",
  });

  // const url = 'http://localhost:8080/user/login'
  const url = `${process.env.NEXT_BASE_URL}/user/login`

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter()

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

      const data = JSON.stringify(jsonData)

      const response = await axios.post(
        url,
        data
      ).then((response) => {
        setIsLoading(false)
        if (response.status !== 200) {
          setFormSuccess(false)
          setFormSuccessMessage(response.data.message)
        } else {
          setFormData({
            username: "",
            password: "",
          });
          setFormSuccess(true);
          setFormSuccessMessage('Logging in...')
          router.push('/'+ response.data.username)
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
    <div>
      {formSuccess ?
        <div>{formSuccessMessage}</div>
        :
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Sign in to your account</h2>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <LoginForm {...{handleInput, formData, isLoading, submitForm}}  />

            <p className="mt-10 text-center text-sm text-gray-500">
              <span>No account yet? </span>
              <Link href="/register" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">Create an account</Link>
            </p>
          </div>
        </div>
      }
    </div>
  )
}