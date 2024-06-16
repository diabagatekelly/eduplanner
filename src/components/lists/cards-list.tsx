"use client"

import { useState, useEffect } from "react";
import Popup from "../popups/popup";
import AddCard from "../cards/add-card";
import store from "@/store/store";
import { ICard } from "@/interfaces/ICard";
import { IUser } from "@/interfaces/IUser";
import { CompletionStatus } from "@/interfaces/CompletionStatusEnum";

export function CardsList({isMain, userDetails, getBorderColor, ...childArgs}) {
  let args;

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [popupItem, getPopupItem] = useState({ ...args })
  const [popupUserDetails, getPopupUserDetails] = useState<IUser>({ ...args });
  const [cardsOfTheDay, getCardsOfTheDay] = useState([])
  const [allActiveCards, getAllActiveCards] = useState([])
  const [allInactiveCards, getAllInactiveCards] = useState([])
  const [hash, getHash] = useState('')

  useEffect(() => {
    const cards = childArgs?.activity?.cards || []
    
    const todayCards = cards?.filter((card) => {
      return (
        card.completionStatus !== CompletionStatus.INACTIVE &&
        (new Date().toLocaleDateString() === card.nextShowDate || 
        new Date().toLocaleDateString() === card.addedOn)
      )
    })
    getCardsOfTheDay(todayCards)

    const activeCards = cards?.filter((card) => card.completionStatus !== CompletionStatus.INACTIVE)
    getAllActiveCards(activeCards)

    const inactiveCards = cards?.filter((card) => card.completionStatus === CompletionStatus.INACTIVE)
    getAllInactiveCards(inactiveCards)

    const {hashReducer} = store.getState()
    getHash(hashReducer)

  }, [userDetails, childArgs?.activity])


  function deleteCard(card: ICard) {
    getPopupItem({card, action: 'delete'})
    getPopupUserDetails(userDetails)
    setModalType('manageCard')
    setShowModal(true);
  }

  function activateCard(card: ICard) {
    getPopupItem({card, action: 'activate'})
    getPopupUserDetails(userDetails)
    setModalType('manageCard')
    setShowModal(true);
  }

  function editCard(card: ICard) {
    getPopupItem({card, action: 'edit'})
    getPopupUserDetails(userDetails)
    setModalType('manageCard')
    setShowModal(true);
  }

  function showCard(card: ICard) {
    getPopupItem({card, action: 'show'})
    getPopupUserDetails(userDetails)
    setModalType('manageCard')
    setShowModal(true);
  }

  function formatCardName(cardId) {
    const cardName = atob(cardId)
    const cardNameNoHyphens = cardName.split('-')
    if (cardNameNoHyphens[0] === 'juz') {
      return `${_capitalizeFirstLetter(cardNameNoHyphens[0])} ${cardNameNoHyphens[1]}`
    } else if (cardNameNoHyphens[0] === 'custom') {
      return `${_capitalizeFirstLetter(cardNameNoHyphens[0])}: ${cardNameNoHyphens[1]}`
    } else {
      return `${_capitalizeFirstLetter(cardNameNoHyphens[0])} ${cardNameNoHyphens[1]}: ${cardNameNoHyphens[3]}`
    }
  }

  function _capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  return (
    <>
      {hash === '' && 
        <ul>
          {!cardsOfTheDay.length ?  <p>You have no cards to review today. Card list with trash can; click takes to card page with buttons for submitting for review, approving, rejecting, deactivate?</p> :
          cardsOfTheDay?.length &&            
          cardsOfTheDay?.map((card) => (
            <li style={{ borderColor: getBorderColor(card) }} className="flex justify-between border-4" key={card.cardId}>
              <p>{formatCardName(card.cardId)}</p>
              <div className="flex">
                <span className="hover:cursor-pointer" onClick={() => showCard(card)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                </span>
                <span className={card.completionStatus !== CompletionStatus.COMPLETED ? "hover:cursor-pointer" : "hover:cursor-pointer hidden"} onClick={() => editCard(card)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                </span>
                <span className={!isMain || isMain && userDetails?.accountType === 'teacher' ? "hover:cursor-pointer": "hidden"} onClick={() => deleteCard(card)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </span>
              </div>
            </li>          
          ))}
        </ul>
      }

      {hash === '#active' &&
        <ul id="active">
          {!allActiveCards.length ?  <p>You have no active cards.</p> :
          allActiveCards?.length &&            
          allActiveCards?.map((card) => (
            <li style={{ borderColor: getBorderColor(card) }} className="flex justify-between border-4" key={card.cardId}>
              <p>{formatCardName(card.cardId)}</p>
              <span className="hover:cursor-pointer" onClick={() => showCard(card)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </span>
              <span className={!isMain || isMain && userDetails?.accountType === 'teacher' ? "hover:cursor-pointer": "hidden"} onClick={() => deleteCard(card)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </span>
            </li>          
          ))}
        </ul>
      }

      {hash === '#inactive' &&
        <ul>
          {!allInactiveCards.length ?  <p>You have no inactive cards.</p> :
          allInactiveCards?.length &&            
          allInactiveCards?.map((card) => (
            <li className="flex justify-between border-4" key={card.cardId}>
              <p>{formatCardName(card.cardId)}</p>
              <div className="flex">
                <span className="hover:cursor-pointer" onClick={() => showCard(card)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                </span>
                <span className={!isMain || isMain && userDetails?.accountType === 'teacher' ? "hover:cursor-pointer": "hidden"} onClick={() => activateCard(card)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </span>
                <span className={!isMain || isMain && userDetails?.accountType === 'teacher' ? "hover:cursor-pointer": "hidden"} onClick={() => deleteCard(card)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </span>
              </div>
            </li>          
          ))}
        </ul>
      }

      {hash === '#add' &&
        <AddCard {...{ isMain, userDetails, activity: childArgs.activity }} />
      }
      
      <Popup {...{ showModal, modalType, isMain, user: popupUserDetails, activity: childArgs.activity, item: popupItem }} onClose={() => setShowModal(false)} />
    </>
  )
}
