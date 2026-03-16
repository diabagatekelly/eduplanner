'use client'

import { useState } from 'react'
import { ICard } from '../../types/ICard'
import React from 'react'
import { IUser } from '@/types/IUser'
import { IActivity } from '@/types/IActivity'
import Popup from '../popups/popup'
import { useCreateCards } from '@/hooks/use-card-mutations'
import { CompletionStatus } from '@/types/CompletionStatusEnum'
import { CARD_ACTIVITY_TYPES } from '@/lib/constants/cardTypes'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { miscCardSchema, MiscCardFormData } from '@/lib/schemas/card.schemas'
import { toast } from 'sonner'
import { handleMutationError } from '@/lib/helpers/mutation-error-handler'

export default function AddMiscCardForm({
  isMain,
  user,
  activity,
}: {
  isMain: boolean
  user: IUser
  activity: IActivity
}) {
  const createCardsMutation = useCreateCards(user.userId)

  const { register, getValues, setValue, formState } = useForm<MiscCardFormData>({
    resolver: zodResolver(miscCardSchema),
    defaultValues: { words: '' },
  })

  const [modalType, setModalType] = useState('')
  const [popupItem, getPopupItem] = useState<{ list: string }>({ list: '' })
  const [showModal, setShowModal] = useState(false)

  async function submitList(finalCardList: string) {
    try {
      const finalCardListAsArr = finalCardList.split(', ')
      let cards: ICard[] = []

      const userCardBase = {
        activity: activity?.name,
        addedOn: null,
        lastUpdatedOn: null,
        nextShowDate: null,
        stage: '0',
        completionStatus: CompletionStatus.INACTIVE,
      }

      finalCardListAsArr.forEach((word) => {
        cards.push({
          cardId: `${btoa(`misc-card-${word}`)}`,
          activityType: CARD_ACTIVITY_TYPES.MISCELLANEOUS,
          ...userCardBase,
        })
      })

      const createdCards = await createCardsMutation.mutateAsync({
        activity: activity?.name,
        cards,
      })
      toast.success(createdCards.data.message)
    } catch (error: unknown) {
      handleMutationError(error, 'add cards')
    }
  }

  function validateInput(e: React.FormEvent<HTMLButtonElement>) {
    e.preventDefault()

    const words = getValues('words')
    if (words === '') {
      toast.warning('Oops, you are trying to validate an empty list')
      return
    }

    const listOfItemsToValidate = cleanUpList(words)
    setValue('words', listOfItemsToValidate)

    getPopupItem({ list: listOfItemsToValidate })
    setModalType('validate')
    setShowModal(true)
  }

  function cleanUpList(list: string) {
    const wordsAsArray = list.split(',')
    const listOfItemsToValidate = Array.from(
      new Set(
        wordsAsArray
          .filter((item) => item !== ' ' && item !== '')
          .map((item) => {
            return item.trim()
          })
      )
    ).join(', ')

    return listOfItemsToValidate
  }

  return (
    <>
      <div data-testid="add-misc-card-form" id="addMiscCardForm" className="space-y-6">
        <div data-testid="type-list-form">
          <div>
            <p>Type comma-separated list of cards/instructions.</p>
          </div>

          <label
            htmlFor="typed"
            className="block mt-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            <div>
              <p>List of cards separated by commas, in English</p>
              <p>
                <i>ie. cook an egg, practice making your bed</i>
              </p>
            </div>
          </label>
          <textarea
            data-testid="textarea-for-typed-list"
            className="border border-gray-500 p-3"
            {...register('words')}
            id="typed"
            rows={4}
            cols={50}
          ></textarea>
          <div className="mt-5">
            <button
              data-testid="add-type-cards-validate-button"
              onClick={validateInput}
              disabled={createCardsMutation.isPending || (isMain && user.accountType === 'student')}
              className={'inline-block mr-5 default-btn'}
            >
              Validate Typed List
            </button>
          </div>
        </div>
      </div>
      <Popup
        {...{ showModal, modalType, item: popupItem, submitList }}
        onClose={() => setShowModal(false)}
      />
    </>
  )
}
