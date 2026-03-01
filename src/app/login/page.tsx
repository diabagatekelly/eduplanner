'use client'

import LoginForm from '@/app/login/components/login-form'
import React, { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, getSession } from 'next-auth/react'
import Link from 'next/link'

export default function Login() {
  const router = useRouter()

  const [formData, setFormData] = useState<{ email: string; password: string }>({
    email: '',
    password: '',
  })

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [formSubmitOutcomeMessage, setFormSubmitOutcomeMessage] = useState('')

  function handleInput(e: React.FormEvent<HTMLInputElement>) {
    if (formSubmitOutcomeMessage.length) {
      setFormSubmitOutcomeMessage('')
    }

    const target = e.target as HTMLInputElement
    setFormData((prevState) => ({
      ...prevState,
      [target.name]: target.value,
    }))
  }

  async function submitForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const rawFormData = new FormData(e.currentTarget)
    const email = rawFormData.get('email') as string
    const password = rawFormData.get('password') as string

    try {
      const result = await signIn('credentials', {
        userId: btoa(email),
        password,
        redirect: false,
      })

      setIsLoading(false)

      if (result?.error) {
        setFormSubmitOutcomeMessage(
          'Failed to login due to an internal error. Please try again later.'
        )
        return
      }

      setFormData({ email: '', password: '' })
      setFormSubmitOutcomeMessage('Logging in ...')

      const session = await getSession()
      if (session?.user) {
        sessionStorage.setItem('user_data', JSON.stringify(session.user))
      }

      const username = (session?.user as any)?.username
      if (!username) {
        setFormSubmitOutcomeMessage(
          'Failed to login due to an internal error. Please try again later.'
        )
        return
      }

      router.push('/' + username)
    } catch {
      setIsLoading(false)
      setFormSubmitOutcomeMessage(
        'Failed to login due to an internal error. Please try again later.'
      )
    }
  }

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <LoginForm {...{ handleInput, formData, isLoading, submitForm }} />
        <div className="mt-3 text-center">{formSubmitOutcomeMessage}</div>

        <p className="mt-10 text-center text-sm text-gray-500">
          <span>No account yet? </span>
          <Link
            data-testid="register-link"
            href="/register"
            className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
