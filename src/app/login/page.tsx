"use client"

import Navbar from "../ui/navbar";
import React, { useState, FormEvent } from "react";

export default function Login() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    accountType: [],
  });

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [formSuccess, setFormSuccess] = useState(false)
  const [formSuccessMessage, setFormSuccessMessage] = useState("")

  const handleInput = (e) => {
    const fieldName = e.target.name;
    const fieldValue = e.target.value;

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
      const formData = new FormData(e.currentTarget)
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
        headers: {
          'accept': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setFormData({
            firstName: "",
            lastName: "",
            username: "",
            email: "",
            password: "",
            accountType: [],
          })
          setFormSuccessMessage(data.submission_text)
        })
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
      setFormSuccess(true)
    }
  }

  return (
    <>
      <Navbar />
      <div>
        {formSuccess ?
          <div>{formSuccessMessage}</div>
          :
          <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
              <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Sign in to your account</h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
              <form className="space-y-6" action="#" method="POST">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">Username or Email</label>
                  <div className="mt-2">
                    <input onChange={handleInput} value={formData.username} id="username" name="username" type="username" autoComplete="username" required className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">Password</label>
                    <div className="text-sm">
                      <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">Forgot password?</a>
                    </div>
                  </div>
                  <div className="mt-2">
                    <input onChange={handleInput} value={formData.password} id="password" name="password" type="password" autoComplete="current-password" required className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                  </div>
                </div>

                <div>
                  <button type="submit" disabled={isLoading} className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">{isLoading ? 'Loading...' : 'Sign In'}</button>
                </div>
              </form>

              <p className="mt-10 text-center text-sm text-gray-500">
                <span>No account yet? </span>
                <a href="#" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">Create an account</a>
              </p>
            </div>
          </div>


        }
      </div>
    </>
  )
}