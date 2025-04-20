"use client"

import { useState, useEffect } from "react";
import Popup from "../popups/popup";
import { ICard } from "@/types/ICard";
import { IUser } from "@/types/IUser";
import { CompletionStatus } from "@/types/CompletionStatusEnum";
import AddCard from "../cards/add-card";
import { IActivity } from "@/types/IActivity";
import { useMounted } from "@/lib/helpers/useMounted";
import { getBorderColor } from "@/lib/helpers/getBorderColor";
import formatCardName from "@/lib/helpers/formatCardName";
import { DocumentMinusIcon, DocumentPlusIcon, EyeIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";

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
      //if (cards[0].activity === 'Quran') {
        //sortQuranCards(cards)
      //}
      cards.map(card => {
        // console.log(atob(card.cardId).split('-'))
        // const cardType = atob(card.cardId).split('-')[0]
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

  // function sortQuranCards(cards) {
  //   cards.map(card => {
  //     console.log(atob(card.cardId).split('-'))
  //     const cardType = atob(card.cardId).split('-')[0]
  //     let num = `${atob(card.cardId).split('-')[1]}`
  //     if (num.length === 1) {
  //       card.number = `00${num}`
  //     } else if (num.length === 2) {
  //       card.number = `0${num}`
  //     } else {
  //       card.number = `${num}`
  //     }
  //   });
  //   cards.sort((a, b) => a.number - b.number);
  //   cards.map((card) => delete card.number);
  // }


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
          <h3 className="today-page-title component-heading">Cards of the Day</h3>
          <ul className="py-3">
            {!cardsOfTheDay.length ? <p data-testid="no-cards-msg">You have no cards to review today.</p> :
            cardsOfTheDay?.length &&            
            cardsOfTheDay?.map((card) => (
              <li data-testid="list-today-cards" style={{ borderColor: getBorderColor(card) }} className="list-item-card" key={card.cardId}>
                <p data-testid="today-card-name">{formatCardName(card.cardId, childArgs?.activity?.name)}</p>
                <div className="flex">
                  <span data-testid="today-card-show-btn" className="hover:cursor-pointer mx-2" onClick={() => showCard(card)}>
                    <EyeIcon
                      title="Show today's card"
                      fill="none"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-6 h-6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </span>
                  <span data-testid="today-card-edit-btn" className="hover:cursor-pointer mx-2" onClick={() => editCard(card)}>
                    <PencilSquareIcon 
                      title="Edit today's card"
                      fill="none" 
                      strokeWidth="1.5" 
                      stroke="currentColor" 
                      className="w-6 h-6"
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </span>
                  <span data-testid="today-card-delete-btn" className={!isMain || isMain && userDetails?.accountType === 'teacher' ? "hover:cursor-pointer mx-2": "hidden"} onClick={() => deleteCard(card)}>
                    <TrashIcon 
                      title="Delete card of the day"
                      fill="none" 
                      strokeWidth="1.5" 
                      stroke="currentColor" 
                      className="w-6 h-6"
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </span>
                </div>
              </li>          
            ))}
          </ul>
        </>
      }

      {hash === '#active' &&
        <>
          <h3 className="component-heading">Active Cards</h3>
          <ul className="py-3" id="active">
            {!allActiveCards.length ?  <p data-testid="no-cards-msg">You have no active cards.</p> :
            allActiveCards?.length &&            
            allActiveCards?.map((card) => (
              <li data-testid="list-active-cards" style={{ borderColor: getBorderColor(card) }} className="list-item-card" key={card.cardId}>
                <p data-testid="active-card-name">{formatCardName(card.cardId, childArgs?.activity?.name)}</p>
                <div className="flex">
                  <span data-testid="active-card-show-btn" className="hover:cursor-pointer mx-2" onClick={() => showCard(card)}>
                    <EyeIcon
                      title="Show active card"
                      fill="none"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-6 h-6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </span>
                  <span data-testid="active-card-override-btn" className={!isMain || isMain && userDetails?.accountType === 'teacher' ? "hover:cursor-pointer mx-2": "hidden"} onClick={() => overrideStage(card)}>
                    <DocumentMinusIcon 
                      title="Override active card stage"
                      fill="none"
                      strokeWidth="1.5"
                      stroke="currentColor" 
                      className="w-6 h-6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </span>
                  <span data-testid="active-card-delete-btn" className={!isMain || isMain && userDetails?.accountType === 'teacher' ? "hover:cursor-pointer mx-2": "hidden"} onClick={() => deleteCard(card)}>
                    <TrashIcon 
                      title="Delete active card"
                      fill="none" 
                      strokeWidth="1.5" 
                      stroke="currentColor" 
                      className="w-6 h-6"
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </span>
                </div>
              </li>          
            ))}
          </ul>
        </>
      }

      {hash === '#inactive' &&
        <>
          <h3 className="component-heading">Inactive Cards</h3>
          <ul className="py-3">
            {!allInactiveCards.length ?  <p data-testid="no-cards-msg">You have no inactive cards.</p> :
            allInactiveCards?.length &&            
            allInactiveCards?.map((card) => (
              <li style={{ borderColor: getBorderColor(card) }} data-testid="list-inactive-cards" className="list-item-card" key={card.cardId}>
                <p data-testid="inactive-card-name">{formatCardName(card.cardId, childArgs?.activity?.name)}</p>
                <div className="flex">
                  <span data-testid="inactive-card-show-btn" className="hover:cursor-pointer mx-2" onClick={() => showCard(card)}>
                    <EyeIcon
                      title="Show inactive card"
                      fill="none"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-6 h-6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </span>
                  <span data-testid="inactive-card-activate-btn" className={!isMain || isMain && userDetails?.accountType === 'teacher' ? "hover:cursor-pointer mx-2": "hidden"} onClick={() => activateCard(card)}>
                    <DocumentPlusIcon 
                      title="Activate inactive card"
                      fill="none"
                      strokeWidth="1.5" 
                      stroke="currentColor" 
                      className="w-6 h-6"
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </span>
                  <span data-testid="inactive-card-delete-btn" className={!isMain || isMain && userDetails?.accountType === 'teacher' ? "hover:cursor-pointer mx-2": "hidden"} onClick={() => deleteCard(card)}>
                    <TrashIcon 
                      title="Delete inactive card"
                      fill="none" 
                      strokeWidth="1.5" 
                      stroke="currentColor" 
                      className="w-6 h-6"
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
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
