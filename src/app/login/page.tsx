'use client'

import LoginForm from '@/app/login/components/login-form'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, getSession } from 'next-auth/react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginFormData } from '@/lib/schemas/auth.schemas'

export default function Login() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const [formSubmitOutcomeMessage, setFormSubmitOutcomeMessage] = useState('')

  function clearMessage() {
    if (formSubmitOutcomeMessage.length) {
      setFormSubmitOutcomeMessage('')
    }
  }

  async function submitForm(data: LoginFormData) {
    try {
      const result = await signIn('credentials', {
        userId: btoa(data.email),
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setFormSubmitOutcomeMessage(
          result.code === 'credentials'
            ? 'User not found. Incorrect email or password. Please try again.'
            : 'Failed to login due to an internal error. Please try again later.'
        )
        return
      }

      reset()
      setFormSubmitOutcomeMessage('Logging in ...')

      const session = await getSession()

      const username = (session?.user as any)?.username
      if (!username) {
        setFormSubmitOutcomeMessage(
          'Failed to login due to an internal error. Please try again later.'
        )
        return
      }

      // Full navigation needed to reload auth session — router.push won't suffice
      // eslint-disable-next-line react-hooks/immutability
      window.location.href = '/' + username
    } catch {
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
        <LoginForm
          register={register}
          errors={errors}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit(submitForm)}
          onFieldChange={clearMessage}
        />
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
