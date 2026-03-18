import { useState, useEffect } from 'react'
import { ICard } from '@/types/ICard'
import { IUser } from '@/types/IUser'
import { IActivity } from '@/types/IActivity'
import { CompletionStatus } from '@/types/CompletionStatusEnum'

export function useCardFiltering(
  activity: IActivity | undefined,
  userDetails: IUser,
  mounted: boolean | undefined
) {
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

  return { cardsOfTheDay, allActiveCards, allInactiveCards, hash }
}
