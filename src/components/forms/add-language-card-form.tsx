'use client'

import { FormEvent, useEffect, useState } from 'react'
import React from 'react'
import { IActivity } from '@/types/IActivity'
import { IUser } from '@/types/IUser'
import { IResponse } from '@/types/IApiResponse'
import Popup from '../popups/popup'
import { ICard } from '@/types/ICard'
import { createUserCard } from '@/store/actions/userActions'
import { CARD_ACTIVITY_TYPES } from '@/lib/constants/cardTypes'
import { useAppDispatch } from '@/store/hooks'
import { CompletionStatus } from '@/types/CompletionStatusEnum'
import { createCards } from '@/api/controller'
import { DocumentMinusIcon } from '@heroicons/react/24/solid'

interface IAddLanguageCardForm {
  handleInput: (e: React.FormEvent<HTMLInputElement>) => void
  submitList: (list: string) => Promise<void>
}

export default function AddLanguageCardForm<IAddLanguageCardForm>({
  isMain,
  user,
  activity,
}: {
  isMain: boolean
  user: IUser
  activity: IActivity
}) {
  const dispatch = useAppDispatch()

  const [file, uploadFile] = useState({
    content: '',
  })

  const [typedList, getTypedList] = useState({
    words: '',
  })

  const [shouldUpload, getuploadForm] = useState(false)
  const [shouldType, getTypeBox] = useState(false)
  const [grammarCard, createGrammarCard] = useState(false)
  const [vocabCard, createVocabCard] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formSubmitOutcomeMessage, setFormSubmitOutcomeMessage] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [popupItem, getPopupItem] = useState<{ list: string }>({ list: '' })

  useEffect(() => {}, [user, activity, file])

  async function onFileInput(e: React.FormEvent<HTMLInputElement>) {
    const files = (e.target as HTMLInputElement).files
    if (files?.[0]?.type !== 'text/plain') {
      setFormSubmitOutcomeMessage('The file uploaded is not a text (.txt) file.')
      return
    }

    const content = await files[0].text()
    const cleanedContent = cleanUpList(content)
    setFormSubmitOutcomeMessage('')
    uploadFile({
      content: cleanedContent,
    })
  }

  function removeUpload(_e: React.MouseEvent<SVGSVGElement, MouseEvent>) {
    const uploadInput = document.querySelector('#upload') as HTMLInputElement
    uploadFile({ content: '' })
    uploadInput.value = ''
  }

  function onTextareaChange(e: React.FormEvent<HTMLTextAreaElement>) {
    const target = e.target as HTMLTextAreaElement
    setFormSubmitOutcomeMessage('')
    getTypedList({
      words: target.value,
    })
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

  function selectWayToInputList(e: FormEvent<HTMLFormElement>) {
    setFormSubmitOutcomeMessage('')
    const chosenInputMethod = (e.target as HTMLSelectElement).value

    if (chosenInputMethod === 'Type list') {
      getTypeBox(true)
      getuploadForm(false)
    } else if (chosenInputMethod === 'Upload file') {
      getTypeBox(false)
      getuploadForm(true)
    } else {
      getTypeBox(false)
      getuploadForm(false)
    }
  }

  function setLanguageCardType(e: FormEvent<HTMLFormElement>) {
    setFormSubmitOutcomeMessage('')
    const languageCardType = (e.target as HTMLSelectElement).value

    ;(document.querySelector('#typed') as HTMLTextAreaElement).value = ''
    if (languageCardType === 'Vocab card') {
      createVocabCard(true)
      createGrammarCard(false)
      getTypeBox(false)
      getuploadForm(false)
      ;(document.querySelector('#listInputMethod') as HTMLFormElement).value = 'Choose ...'
    } else if (languageCardType === 'Grammar card') {
      createGrammarCard(true)
      createVocabCard(false)
      getTypeBox(false)
      getuploadForm(false)
    } else {
      createGrammarCard(false)
      createVocabCard(false)
      getTypeBox(false)
      getuploadForm(false)
    }
  }

  function validateInput(e: React.FormEvent<HTMLButtonElement>) {
    e.preventDefault()
    setFormSubmitOutcomeMessage('')

    if (
      ((shouldType || grammarCard) && typedList.words === '') ||
      (shouldUpload && file.content === '')
    ) {
      setFormSubmitOutcomeMessage('Oops, you are trying to validate an empty list')
      return
    }

    let listOfItemsToValidate = ''
    if (shouldType || grammarCard) {
      listOfItemsToValidate = cleanUpList(typedList.words)
      ;(document.querySelector('#typed') as HTMLTextAreaElement).value = listOfItemsToValidate
    } else if (shouldUpload) {
      listOfItemsToValidate = file.content
    }

    getPopupItem({ list: listOfItemsToValidate })
    setModalType('validate')
    setShowModal(true)
  }

  async function submitList(finalCardList: string) {
    setFormSubmitOutcomeMessage('')

    try {
      const finalCardListAsArr = finalCardList.split(', ')
      const language = activity?.name?.split('-')[0].toLowerCase()
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
          cardId: grammarCard
            ? `${btoa(`${language}-grammar-${word}`)}`
            : `${btoa(`${language}-vocab-${word}`)}`,
          activityType: grammarCard ? CARD_ACTIVITY_TYPES.GRAMMAR : CARD_ACTIVITY_TYPES.VOCAB,
          ...userCardBase,
        })
      })

      const payload = {
        userId: user.userId,
        activity: activity?.name,
        cards,
      }

      const createdCards = (await createCards(payload)) as unknown as IResponse<ICard[]>
      const { data } = createdCards
      const { message, details }: { message: string; details: ICard[] } = data
      dispatch(
        createUserCard({ username: user.username, activityName: activity.name, newCards: details })
      )

      setFormSubmitOutcomeMessage(message)
      window.location.reload()
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

  return (
    <>
      <div data-testid="add-language-card-form" id="addLanguageCardForm" className="space-y-6">
        <form
          className="max-w-md"
          data-testid="select-language-card-type"
          onChange={setLanguageCardType}
        >
          <label
            htmlFor="cardTypeSelect"
            className="block mb-2 text-md font-small text-gray-900 dark:text-white"
          >
            <b>Are you creating a vocab or grammar card?</b>
          </label>
          <select
            id="cardTypeSelect"
            name="cardTypeSelect"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option>Choose ...</option>
            <option>Vocab card</option>
            <option>Grammar card</option>
          </select>
        </form>

        <form
          data-testid="select-input-type"
          className={vocabCard === true && grammarCard === false ? 'max-w-md' : 'max-w-md hidden'}
          onChange={selectWayToInputList}
        >
          <label
            htmlFor="listInputMethod"
            className="block mb-2 text-md font-small text-gray-900 dark:text-white"
          >
            <b>How would you like to enter your vocab list?</b>
          </label>
          <select
            id="listInputMethod"
            name="listInputMethod"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option>Choose ...</option>
            <option>Type list</option>
            <option>Upload file</option>
          </select>
        </form>

        <div
          data-testid="upload-file-form"
          className={vocabCard === true && grammarCard === false && shouldUpload ? '' : 'hidden'}
        >
          <div>
            <p>Files supported: .txt</p>
          </div>

          <label
            htmlFor="upload"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Upload list of vocab words (in English):
          </label>
          <div className="flex justify-between space-x-2">
            <input
              data-testid="upload-form"
              className="space-y-2"
              onInput={onFileInput}
              type="file"
              id="upload"
              name="upload"
              accept=".txt"
            />
            <DocumentMinusIcon
              title="Remove uploaded file"
              style={{ cursor: 'pointer' }}
              data-testid="remove-upload-btn"
              onClick={removeUpload}
              fill="none"
              strokeWidth="1.5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`w-6 h-6 inline-block ${file.content === '' ? 'hidden' : ''}`}
            />
          </div>

          <div className="block mt-5">
            <button
              data-testid="add-upload-cards-val-button"
              onClick={validateInput}
              disabled={isLoading || (isMain && user.accountType === 'student')}
              className="inline-block mr-5 default-btn"
            >
              Validate Uploaded List
            </button>
          </div>
        </div>

        <div
          data-testid="type-list-form"
          className={
            (grammarCard === true && vocabCard === false) || shouldType === true ? '' : 'hidden'
          }
        >
          <div>
            {shouldType && <p>Type comma-separated list of vocab words.</p>}
            {grammarCard === true && vocabCard === false && !shouldType && (
              <div>
                <p>Type comma-separated list of grammar points.</p>
                <p>
                  <span>
                    A grammar point can be a custom instruction (ie. conjugate 3 verbs in present
                    tense, conjugate 3 verbs in past tense){' '}
                  </span>
                  <span>
                    or it can reference an exercise in a book (ie. Madinah 1 ex. 5 pg. 5, Al-kitaab
                    1 ex. 3 pg. 50).
                  </span>
                </p>
              </div>
            )}
          </div>

          <label
            htmlFor="typed"
            className="block mt-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            {shouldType && (
              <div>
                <p>List of vocab words separated by commas, in English</p>
                <p>
                  <i>ie. dog, cat, man</i>
                </p>
              </div>
            )}
            {grammarCard === true && vocabCard === false && (
              <div>
                <p>List of grammar points separated by commas, in English</p>
                <p>
                  <i>ie. conjugate 3 verbs in present tense, Madinah 1 ex. 5 pg. 5</i>
                </p>
              </div>
            )}
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
