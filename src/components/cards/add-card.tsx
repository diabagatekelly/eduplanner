'use client'

import { useState } from 'react'
import AddMiscCardForm from '../forms/add-misc-card-form'
import { usePathname } from 'next/navigation'
import AddQuranCardForm from '../forms/add-quran-card-form'
import { IUser } from '@/types/IUser'
import { IActivity } from '@/types/IActivity'
import AddLanguageCardForm from '../forms/add-language-card-form'

export default function AddCard({
  isMain,
  userDetails,
  activity,
}: {
  isMain: boolean
  userDetails: IUser
  activity: IActivity
}) {
  const pathname = usePathname()

  return (
    <div className="justify-items-start">
      {pathname.includes('/activities/Quran') && (
        <>
          <h3 className="component-heading">Add New Quran Cards:</h3>
          <AddQuranCardForm {...{ isMain, user: userDetails, activity }} />
        </>
      )}
      {pathname.includes('Language') && (
        <>
          <h3 className="component-heading">Add New Language Cards:</h3>
          <AddLanguageCardForm {...{ isMain, user: userDetails, activity }} />
        </>
      )}
      {!pathname.includes('/activities/Quran') && !pathname.includes('Language') && (
        <>
          <h3 className="component-heading">Add New Cards:</h3>
          <AddMiscCardForm {...{ isMain, user: userDetails, activity }} />
        </>
      )}
    </div>
  )
}
