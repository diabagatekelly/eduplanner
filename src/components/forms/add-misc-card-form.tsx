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

  const [typedList, getTypedList] = useState({
    words: '',
  })

  const [formSubmitOutcomeMessage, setFormSubmitOutcomeMessage] = useState('')
  const [modalType, setModalType] = useState('')
  const [popupItem, getPopupItem] = useState<{ list: string }>({ list: '' })
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  function onTextareaChange(e: React.FormEvent<HTMLTextAreaElement>) {
    const target = e.target as HTMLTextAreaElement

    setFormSubmitOutcomeMessage('')
    getTypedList({
      words: target.value,
    })
  }

  async function submitList(finalCardList: string) {
    setFormSubmitOutcomeMessage('')

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
      setFormSubmitOutcomeMessage(createdCards.data.message)
    } catch (error: any) {
      setIsLoading(false)
      console.log(error)

      if (!error.response) {
        setFormSubmitOutcomeMessage('Server is down. Try again later.')
        return
      }

      const { status, data } = error.response

      if (status === 500) {
        setFormSubmitOutcomeMessage(
          'Failed to add cards due to an internal error. Please try again later.'
        )
      } else {
        setFormSubmitOutcomeMessage(data.message)
      }
    }
  }

  function validateInput(e: React.FormEvent<HTMLButtonElement>) {
    e.preventDefault()
    setFormSubmitOutcomeMessage('')

    if (typedList.words === '') {
      setFormSubmitOutcomeMessage('Oops, you are trying to validate an empty list')
      return
    }

    const listOfItemsToValidate = cleanUpList(typedList.words)
    ;(document.querySelector('#typed') as HTMLTextAreaElement).value = listOfItemsToValidate

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
            onChange={onTextareaChange}
            id="typed"
            name="typed"
            rows={4}
            cols={50}
          ></textarea>
          <div className="mt-5">
            <button
              data-testid="add-type-cards-validate-button"
              onClick={validateInput}
              disabled={isLoading || (isMain && user.accountType === 'student')}
              className={'inline-block mr-5 default-btn'}
            >
              Validate Typed List
            </button>
          </div>
        </div>
      </div>
      <p data-testid="outcome-message">{formSubmitOutcomeMessage}</p>
      <Popup
        {...{ showModal, modalType, item: popupItem, submitList, setFormSubmitOutcomeMessage }}
        onClose={() => setShowModal(false)}
      />
    </>
  )
}
