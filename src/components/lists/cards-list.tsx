'use client'

import { useState, useEffect } from 'react'
import Popup, { CardAction } from '../popups/popup'
import { ICard } from '@/types/ICard'
import { IUser } from '@/types/IUser'
import { CompletionStatus } from '@/types/CompletionStatusEnum'
import AddCard from '../cards/add-card'
import { IActivity } from '@/types/IActivity'
import { useMounted } from '@/lib/helpers/useMounted'
import { getBorderColor } from '@/lib/helpers/getBorderColor'
import formatCardName from '@/lib/helpers/formatCardName'
import {
  DocumentMinusIcon,
  DocumentPlusIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/solid'

export default function CardsList({
  isMain,
  userDetails,
  activity,
}: {
  isMain: boolean
  userDetails: IUser
  activity?: IActivity
}) {
  const mounted = useMounted()

  const [showModal, setShowModal] = useState(false)
  const [popupItem, setPopupItem] = useState<{ card: ICard; action: CardAction }>(
    {} as { card: ICard; action: CardAction }
  )
  const [popupUserDetails, setPopupUserDetails] = useState<IUser>({} as IUser)
  const [cardsOfTheDay, setCardsOfTheDay] = useState<ICard[]>([])
  const [allActiveCards, setAllActiveCards] = useState<ICard[]>([])
  const [allInactiveCards, setAllInactiveCards] = useState<ICard[]>([])
  const [hash, setHash] = useState('')

  useEffect(() => {
    const cards: any[] | ICard = activity?.cards || []

    if (cards.length) {
      cards.map((card) => {
        let num = `${atob(card.cardId).split('-')[1]}`
        if (num.length === 1) {
          card.number = `00${num}`
        } else if (num.length === 2) {
          card.number = `0${num}`
        } else {
          card.number = `${num}`
        }
      })
      cards.sort((a, b) => a.number - b.number)
      cards.map((card) => delete card.number)
    }

    const todayCards = cards?.filter((card) => {
      return (
        card.completionStatus === CompletionStatus.REVIEW ||
        (card.completionStatus !== CompletionStatus.INACTIVE &&
          card.completionStatus !== CompletionStatus.COMPLETED &&
          (new Date().toLocaleDateString('en-US', { timeZone: 'EST' }) === card.nextShowDate ||
            new Date().toLocaleDateString('en-US', { timeZone: 'EST' }) === card.addedOn))
      )
    })
    setCardsOfTheDay(todayCards)

    const activeCards = cards?.filter((card) => card.completionStatus !== CompletionStatus.INACTIVE)
    setAllActiveCards(activeCards)

    const inactiveCards = cards?.filter(
      (card) => card.completionStatus === CompletionStatus.INACTIVE
    )
    setAllInactiveCards(inactiveCards)

    if (mounted) {
      const hashReducer = window.location.hash
      setHash(hashReducer)
    }
  }, [userDetails, activity, mounted])

  function openCardPopup(card: ICard, action: CardAction) {
    setPopupItem({ card, action })
    setPopupUserDetails(userDetails)
    setShowModal(true)
  }

  if (!mounted) return null
  return (
    <>
      {hash === '' && (
        <>
          <h3 className="today-page-title component-heading">Cards of the Day</h3>
          <ul className="py-3">
            {!cardsOfTheDay.length ? (
              <p data-testid="no-cards-msg">You have no cards to review today.</p>
            ) : (
              cardsOfTheDay?.length &&
              cardsOfTheDay?.map((card) => (
                <li
                  data-testid="list-today-cards"
                  style={{ borderColor: getBorderColor(card) }}
                  className="list-item-card"
                  key={card.cardId}
                >
                  <p data-testid="today-card-name">{formatCardName(card.cardId, activity?.name)}</p>
                  <div className="flex">
                    <span
                      data-testid="today-card-show-btn"
                      className="hover:cursor-pointer mx-2"
                      onClick={() => openCardPopup(card, 'show')}
                    >
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
                    <span
                      data-testid="today-card-edit-btn"
                      className="hover:cursor-pointer mx-2"
                      onClick={() => openCardPopup(card, 'edit')}
                    >
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
                    <span
                      data-testid="today-card-delete-btn"
                      className={
                        !isMain || (isMain && userDetails?.accountType === 'teacher')
                          ? 'hover:cursor-pointer mx-2'
                          : 'hidden'
                      }
                      onClick={() => openCardPopup(card, 'delete')}
                    >
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
              ))
            )}
          </ul>
        </>
      )}

      {hash === '#active' && (
        <>
          <h3 className="component-heading">Active Cards</h3>
          <ul className="py-3" id="active">
            {!allActiveCards.length ? (
              <p data-testid="no-cards-msg">You have no active cards.</p>
            ) : (
              allActiveCards?.length &&
              allActiveCards?.map((card) => (
                <li
                  data-testid="list-active-cards"
                  style={{ borderColor: getBorderColor(card) }}
                  className="list-item-card"
                  key={card.cardId}
                >
                  <p data-testid="active-card-name">
                    {formatCardName(card.cardId, activity?.name)}
                  </p>
                  <div className="flex">
                    <span
                      data-testid="active-card-show-btn"
                      className="hover:cursor-pointer mx-2"
                      onClick={() => openCardPopup(card, 'show')}
                    >
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
                    <span
                      data-testid="active-card-override-btn"
                      className={
                        !isMain || (isMain && userDetails?.accountType === 'teacher')
                          ? 'hover:cursor-pointer mx-2'
                          : 'hidden'
                      }
                      onClick={() => openCardPopup(card, 'override')}
                    >
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
                    <span
                      data-testid="active-card-delete-btn"
                      className={
                        !isMain || (isMain && userDetails?.accountType === 'teacher')
                          ? 'hover:cursor-pointer mx-2'
                          : 'hidden'
                      }
                      onClick={() => openCardPopup(card, 'delete')}
                    >
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
              ))
            )}
          </ul>
        </>
      )}

      {hash === '#inactive' && (
        <>
          <h3 className="component-heading">Inactive Cards</h3>
          <ul className="py-3">
            {!allInactiveCards.length ? (
              <p data-testid="no-cards-msg">You have no inactive cards.</p>
            ) : (
              allInactiveCards?.length &&
              allInactiveCards?.map((card) => (
                <li
                  style={{ borderColor: getBorderColor(card) }}
                  data-testid="list-inactive-cards"
                  className="list-item-card"
                  key={card.cardId}
                >
                  <p data-testid="inactive-card-name">
                    {formatCardName(card.cardId, activity?.name)}
                  </p>
                  <div className="flex">
                    <span
                      data-testid="inactive-card-show-btn"
                      className="hover:cursor-pointer mx-2"
                      onClick={() => openCardPopup(card, 'show')}
                    >
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
                    <span
                      data-testid="inactive-card-activate-btn"
                      className={
                        !isMain || (isMain && userDetails?.accountType === 'teacher')
                          ? 'hover:cursor-pointer mx-2'
                          : 'hidden'
                      }
                      onClick={() => openCardPopup(card, 'activate')}
                    >
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
                    <span
                      data-testid="inactive-card-delete-btn"
                      className={
                        !isMain || (isMain && userDetails?.accountType === 'teacher')
                          ? 'hover:cursor-pointer mx-2'
                          : 'hidden'
                      }
                      onClick={() => openCardPopup(card, 'delete')}
                    >
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
              ))
            )}
          </ul>
        </>
      )}

      {hash === '#add' && <AddCard {...{ isMain, userDetails, activity: activity! }} />}

      {showModal && (
        <Popup
          showModal={showModal}
          config={{
            type: 'manageCard',
            isMain,
            user: popupUserDetails,
            activity: activity!,
            item: popupItem,
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
