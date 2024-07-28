"use client"

import { useState } from "react";
import { ICard } from "../../interfaces/ICard";
import React from "react";
import { IUser } from "@/interfaces/IUser";
import { IActivity } from "@/interfaces/IActivity";
import Popup from "../popups/popup";
import { createCards } from "@/api/controller";
import { IResponse } from "@/interfaces/IApiResponse";
import { createUserCard } from "@/store/actions/userActions";
import { useDispatch } from "react-redux";
import { CompletionStatus } from "@/interfaces/CompletionStatusEnum";


export default function AddMiscCardForm({isMain, user, activity}:{isMain: boolean, user: IUser, activity: IActivity}) {
  let args;
  const dispatch = useDispatch();

  const [typedList, getTypedList] = useState({
    words: ''
  })
  
  const [formSubmitOutcomeMessage, setFormSubmitOutcomeMessage] = useState("")
  const [shouldProceed, determineShouldProceed] = useState<'yes'|'no'>('no')
  const [modalType, setModalType] = useState('');
  const [popupItem, getPopupItem] = useState<{list: string}>({ ...args })
  const [showModal, setShowModal] = useState(false);
  const [finalCardList, setFinalCardList] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function onTextareaChange(e: React.FormEvent<HTMLTextAreaElement>) {
    const target = e.target as HTMLTextAreaElement;
    const isContentValid = target.value.split(',').length <= 10;

    if (isContentValid || !isContentValid && (e.nativeEvent as InputEvent).inputType === 'deleteContentBackward') {
      setFormSubmitOutcomeMessage('');
      getTypedList({
        words: target.value
      })
    } else {
      setFormSubmitOutcomeMessage('Oops, this is as long as your list can get!');
      getTypedList({
        words: typedList.words
      });
      (document.querySelector('#typed') as HTMLTextAreaElement).value = typedList.words.substring(0, typedList.words.length - 1);
    }
  }

  async function submitForm(e: React.FormEvent<HTMLButtonElement>) {
    e.preventDefault();
    setFormSubmitOutcomeMessage('');

    try {
      const finalCardListAsArr = finalCardList.split(', ');
      let cards: ICard[] = [];

      const userCardBase = {
        activity: activity?.name,
        addedOn: null,
        lastUpdatedOn: null,
        nextShowDate: null,
        stage: '0',
        completionStatus: CompletionStatus.INACTIVE
      }
      
      finalCardListAsArr.forEach((word) => {
        cards.push({
          cardId: `${btoa(`misc-card-${word}`)}`,
          activityType: 'Miscellaneous',
          ...userCardBase
        })
      })

      const payload = {
        userId: user.userId,
        activity: activity?.name,
        cards
      }
      
      const createdCards = await createCards(payload) as IResponse;
      const {data} = createdCards;
      const {message, details}: {message: string, details: ICard[]} = data;
      dispatch(createUserCard({username: user.username, activityName: activity.name, newCards: details}))

      setFormSubmitOutcomeMessage(message)
      window.location.reload()
      
    } catch (error) {
      setIsLoading(false)
      console.log(error)

      if (!error.response) {
        setFormSubmitOutcomeMessage('Server is down. Try again later.')
        return
      }

      const {status, data} = error.response;

      if (status === 500) {
        setFormSubmitOutcomeMessage('Failed to add cards due to an internal error. Please try again later.')
      } else {
        setFormSubmitOutcomeMessage(data.message)
      }
    }
  }

  function validateInput(e: React.FormEvent<HTMLButtonElement>) {
    e.preventDefault();
    setFormSubmitOutcomeMessage('');
    determineShouldProceed('no');

    if (typedList.words === '') {
      setFormSubmitOutcomeMessage('Oops, you are trying to validate an empty list');
      return
    }

    const listOfItemsToValidate = cleanUpList(typedList.words);
    (document.querySelector('#typed') as HTMLTextAreaElement).value = listOfItemsToValidate;

    getPopupItem({list: listOfItemsToValidate})
    setModalType('validate')
    setShowModal(true)
  }

  function cleanUpList(list: string) {
    const wordsAsArray = list.split(',')
    const listOfItemsToValidate = Array.from(new Set(
      wordsAsArray.filter(item => (item !== ' ' && item !== ''))
      .map((item) => {
        return item.trim();
      })
    )).join(', ')

    return listOfItemsToValidate
  }

  return (
    <>
      <div data-testid="add-misc-card-form" id="addMiscCardForm" className="space-y-6">

        <div data-testid="type-list-form">
          <div>
            <p>Type comma-separated list of cards/instructions.</p>
          </div>
          
          <label htmlFor="typed" className="block mt-2 text-sm font-medium text-gray-900 dark:text-white">
            <div>
              <p>List of cards separated by commas, in English, max: 20 cards</p>
              <p><i>ie. cook an egg, practice making your bed</i></p>
            </div>
          </label>
          <textarea data-testid="textarea-for-typed-list" className="border border-gray-500 p-3" onChange={onTextareaChange} id="typed" name="typed" rows={4} cols={50}></textarea>
          <div className="mt-5">
            <button data-testid="add-type-cards-validate-button" onClick={validateInput} disabled={isLoading || (isMain && user.accountType === 'student')} 
              className={"inline-block mr-5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"}>
              Validate Typed List
            </button>
            <button data-testid="add-type-cards-submit-button" type="submit" onClick={submitForm} disabled={isLoading || (isMain && user.accountType === 'student') || shouldProceed === 'no'} 
              className={`inline-block rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${isLoading || (isMain && user.accountType === 'student') || shouldProceed === 'no' ? "bg-gray-600 focus-visible:outline-gray-600" : "bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600"}`}>
              Create Cards
            </button>
          </div>
        </div>
        
      </div>
      <p data-testid="outcome-message">{formSubmitOutcomeMessage}</p>
      <Popup {...{ showModal, modalType, item: popupItem, determineShouldProceed, setFormSubmitOutcomeMessage, setFinalCardList}} onClose={() => setShowModal(false)} />
    </>
  )
}
