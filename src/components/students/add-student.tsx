'use client'

import { useState } from 'react'
import { findUser } from '../../api/controller'
import SearchUserForm from '../forms/search-user-form'
import Popup from '../popups/popup'
import { IUser } from '@/types/IUser'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { searchStudentSchema, SearchStudentFormData } from '@/lib/schemas/student.schemas'
import { toast } from 'sonner'
import { handleMutationError } from '@/lib/helpers/mutation-error-handler'

export default function AddStudent({ user }: { user: IUser }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SearchStudentFormData>({
    resolver: zodResolver(searchStudentSchema),
    defaultValues: { email: '' },
  })

  const [newStudent, getStudentInfo] = useState<IUser>({} as IUser)
  const [showModal, setShowModal] = useState(false)

  const modalType = 'addStudent'

  async function submitForm(data: SearchStudentFormData): Promise<void> {
    try {
      if (data.email === user.email) {
        toast.warning("You can't add yourself as a student.")
        reset()
        return
      }

      const currentStudents = user?.linkedAccountsData?.students
      if (currentStudents?.some((tuple) => tuple[0] === btoa(data.email))) {
        toast.warning('This is already one of your students.')
        reset()
        return
      }

      const newStudentUserId = { userId: btoa(data.email) }

      const response = await findUser(newStudentUserId)
      const { data: responseData } = response
      const { details }: { message: string; details: { student: IUser } } = responseData
      getStudentInfo(details.student)
      setShowModal(true)
    } catch (error: unknown) {
      handleMutationError(error, 'find student')
    }
  }

  return (
    <div className="justify-items-start">
      <h3 className="component-sub-title">Add a new student:</h3>
      <p>Enter your student&#39;s email:</p>
      <SearchUserForm
        register={register}
        errors={errors}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit(submitForm)}
      />
      <Popup {...{ showModal, modalType, user, newStudent }} onClose={() => setShowModal(false)} />
    </div>
  )
}
