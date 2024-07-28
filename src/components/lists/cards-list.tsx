"use client"

import { useState, useEffect } from "react";
import Popup from "../popups/popup";
import { ICard } from "@/interfaces/ICard";
import { IUser } from "@/interfaces/IUser";
import { CompletionStatus } from "@/interfaces/CompletionStatusEnum";
import AddCard from "../cards/add-card";
import { IActivity } from "@/interfaces/IActivity";
import { useMounted } from "@/utils/useMounted";
import { getBorderColor } from "@/utils/getBorderColor";
import formatCardName from "@/utils/formatCardName";

export default function CardsList({isMain, userDetails, ...childArgs}: {isMain: boolean, userDetails: IUser, activity?: IActivity}) {
  let args;
  const mounted = useMounted();

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [popupItem, getPopupItem] = useState<{card: ICard, action: string}>({ ...args })
  const [popupUserDetails, getPopupUserDetails] = useState<IUser>({ ...args });
  const [cardsOfTheDay, getCardsOfTheDay] = useState<ICard[]>([])
  const [allActiveCards, getAllActiveCards] = useState<ICard[]>([])
  const [allInactiveCards, getAllInactiveCards] = useState<ICard[]>([])
  const [hash, getHash] = useState('')

  useEffect(() => {
    const extractedActivity = childArgs?.activity
    const cards: any[] | ICard = extractedActivity.cards || []

    if (cards.length) {
      cards.map(card => {
        let num = `${atob(card.cardId).split('-')[1]}`
        if (num.length === 1) {
          card.number = `00${num}`
        } else if (num.length === 2) {
          card.number = `0${num}`
        } else {
          card.number = `${num}`
        }
      });
      cards.sort((a, b) => a.number - b.number);
      cards.map((card) => delete card.number);
    }

    const todayCards = cards?.filter((card) => {
      return (
        card.completionStatus === CompletionStatus.REVIEW || 
        (card.completionStatus !== CompletionStatus.INACTIVE &&
        card.completionStatus !== CompletionStatus.COMPLETED  &&
        (new Date().toLocaleDateString('en-US', {timeZone: 'EST'}) === card.nextShowDate || 
        new Date().toLocaleDateString('en-US', {timeZone: 'EST'}) === card.addedOn))
      )
    })
    getCardsOfTheDay(todayCards)

    const activeCards = cards?.filter((card) => card.completionStatus !== CompletionStatus.INACTIVE)
    getAllActiveCards(activeCards)

    const inactiveCards = cards?.filter((card) => card.completionStatus === CompletionStatus.INACTIVE)
    getAllInactiveCards(inactiveCards)

  
    if (mounted) {
      const hashReducer = window.location.hash
      getHash(hashReducer)
    }

  }, [userDetails, childArgs?.activity, mounted])


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

  function overrideStage(card: ICard) {
    getPopupItem({card, action: 'override'})
    getPopupUserDetails(userDetails)
    setModalType('manageCard')
    setShowModal(true);
  }

  if (!mounted) return null;
  return (
    <>
      {hash === '' && 
        <>
          <h3 className="today-page-title mb-2 text-2xl font-bold">Cards of the Day</h3>
          <ul>
            {!cardsOfTheDay.length ? <p data-testid="no-cards-msg">You have no cards to review today.</p> :
            cardsOfTheDay?.length &&            
            cardsOfTheDay?.map((card) => (
              <li data-testid="list-today-cards" style={{ borderColor: getBorderColor(card) }} className="flex justify-between border-4 mb-3 px-3 py-1" key={card.cardId}>
                <p data-testid="today-card-name">{formatCardName(card.cardId, childArgs?.activity?.name)}</p>
                <div className="flex">
                  <span data-testid="today-card-show-btn" className="hover:cursor-pointer mx-2" onClick={() => showCard(card)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  </span>
                  <span data-testid="today-card-edit-btn" className="hover:cursor-pointer mx-2" onClick={() => editCard(card)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </span>
                  <span data-testid="today-card-delete-btn" className={!isMain || isMain && userDetails?.accountType === 'teacher' ? "hover:cursor-pointer mx-2": "hidden"} onClick={() => deleteCard(card)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </span>
                </div>
              </li>          
            ))}
          </ul>
        </>
      }

      {hash === '#active' &&
        <>
          <h3 className="mb-2 text-2xl font-bold">Active Cards</h3>
          <ul id="active">
            {!allActiveCards.length ?  <p data-testid="no-cards-msg">You have no active cards.</p> :
            allActiveCards?.length &&            
            allActiveCards?.map((card) => (
              <li data-testid="list-active-cards" style={{ borderColor: getBorderColor(card) }} className="flex justify-between border-4 mb-3 px-3 py-1" key={card.cardId}>
                <p data-testid="active-card-name">{formatCardName(card.cardId, childArgs?.activity?.name)}</p>
                <div className="flex">
                  <span data-testid="active-card-show-btn" className="hover:cursor-pointer mx-2" onClick={() => showCard(card)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  </span>
                  <span data-testid="active-card-override-btn" className={!isMain || isMain && userDetails?.accountType === 'teacher' ? "hover:cursor-pointer mx-2": "hidden"} onClick={() => overrideStage(card)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </span>
                  <span data-testid="active-card-delete-btn" className={!isMain || isMain && userDetails?.accountType === 'teacher' ? "hover:cursor-pointer mx-2": "hidden"} onClick={() => deleteCard(card)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </span>
                </div>
              </li>          
            ))}
          </ul>
        </>
      }

      {hash === '#inactive' &&
        <>
          <h3 className="mb-2 text-2xl font-bold">Inactive Cards</h3>
          <ul>
            {!allInactiveCards.length ?  <p data-testid="no-cards-msg">You have no inactive cards.</p> :
            allInactiveCards?.length &&            
            allInactiveCards?.map((card) => (
              <li style={{ borderColor: getBorderColor(card) }} data-testid="list-inactive-cards" className="flex justify-between border-4 mb-3" key={card.cardId}>
                <p data-testid="inactive-card-name">{formatCardName(card.cardId, childArgs?.activity?.name)}</p>
                <div className="flex">
                  <span data-testid="inactive-card-show-btn" className="hover:cursor-pointer mx-2" onClick={() => showCard(card)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  </span>
                  <span data-testid="inactive-card-activate-btn" className={!isMain || isMain && userDetails?.accountType === 'teacher' ? "hover:cursor-pointer mx-2": "hidden"} onClick={() => activateCard(card)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </span>
                  <span data-testid="inactive-card-delete-btn" className={!isMain || isMain && userDetails?.accountType === 'teacher' ? "hover:cursor-pointer mx-2": "hidden"} onClick={() => deleteCard(card)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </span>
                </div>
              </li>          
            ))}
          </ul>
        </>
      }

      {hash === '#add' &&
        <AddCard {...{ isMain, userDetails, activity: childArgs.activity }} />
      }
      
      <Popup {...{ showModal, modalType, isMain, user: popupUserDetails, activity: childArgs.activity, item: popupItem }} onClose={() => setShowModal(false)} />
    </>
  )
}
