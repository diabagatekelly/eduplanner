"use client"

import Navbar from "../ui/navbar";
import RegisterForm from "../ui/register-form";
import React, { useState, FormEvent } from "react";
import { useRouter } from 'next/navigation'
import { IUserRegister } from "../interfaces/IUser";

export default function Login() {
  const [formData, setFormData] = useState<IUserRegister>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    accountType: "",
  });
  const url = 'https://eduplanner-backend-7fdf262835f2.herokuapp.com/user/register';

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
      const formData = new URLSearchParams()

      for (const pair of rawFormData.entries()) {
        formData.append(pair[0], `${pair[1]}`);
      }

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'accept': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      })

      const data = await response.json()
      setIsLoading(false)
      if (data.status) {
        setFormSuccess(false)
        setFormSuccessMessage(data.message)
      } else {
        setFormData({
          firstName: "",
          lastName: "",
          username: "",
          email: "",
          password: "",
          accountType: "",
        });
        setFormSuccess(true);
        setFormSuccessMessage('New user created.')
        router.push('/'+ data.username)
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <Navbar />
      <div>
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Create an account</h2>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <RegisterForm {...{ handleInput, formData, isLoading, submitForm }} />
            <div>{formSuccessMessage}</div>
          </div>
        </div>
      </div>
    </>
  )
}