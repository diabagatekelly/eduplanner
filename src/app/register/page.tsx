'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import RegisterForm from '@/app/register/components/register-form'
import { IUser } from '@/types/IUser'
import { IResponse } from '@/types/IApiResponse'
import { registerUser } from '@/api/controller'
import { ISODateString } from '@/types/isoDateType'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, RegisterFormData } from '@/lib/schemas/auth.schemas'

export default function Register() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      accountType: 'student',
    },
  })

  const [formSubmitOutcomeMessage, setFormSubmitOutcomeMessage] = useState('')

  function clearMessage() {
    if (formSubmitOutcomeMessage.length) {
      setFormSubmitOutcomeMessage('')
    }
  }

  async function submitForm(data: RegisterFormData) {
    try {
      const userId = btoa(data.email)
      const username = `${data.firstName}-${data.lastName}`
      const linkedAccountsData = data.accountType === 'teacher' ? { students: [] } : {}
      const now = new Date()

      const userData: IUser = {
        ...data,
        userId,
        username,
        lastLogin: now.toLocaleDateString('en-US', {
          timeZone: 'EST',
        }) as ISODateString,
        activities: [],
        linkedAccountsData,
      }

      const response = (await registerUser(userData)) as unknown as IResponse<{
        token: string
        user: IUser
      }>

      const { data: responseData } = response
      const { message } = responseData

      reset()
      setFormSubmitOutcomeMessage(message)
      router.push('/login')
    } catch (error: any) {
      if (!error.response) {
        setFormSubmitOutcomeMessage('Server is down. Try again later.')
        return
      }

      const { status, data: errorData } = error.response

      if (status === 500) {
        setFormSubmitOutcomeMessage(
          'Failed to create user due to an internal error. Please try again later.'
        )
      } else {
        setFormSubmitOutcomeMessage(errorData.message)
      }
    }
  }

  return (
    <div>
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Create an account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <RegisterForm
            register={register}
            errors={errors}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit(submitForm)}
            onFieldChange={clearMessage}
          />
          <div className="submit-form-outcome-message">{formSubmitOutcomeMessage}</div>
        </div>
      </div>
    </div>
  )
}
