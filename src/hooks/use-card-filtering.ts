import { useMemo } from 'react'
import { ICard } from '@/types/ICard'
import { IActivity } from '@/types/IActivity'
import { CompletionStatus } from '@/types/CompletionStatusEnum'

export function useCardFiltering(activity: IActivity | undefined, mounted: boolean | undefined) {
  const hash = mounted ? window.location.hash : ''

  const sortedCards = useMemo(() => {
    const cards: ICard[] = activity?.cards ? [...activity.cards] : []

    if (cards.length) {
      cards.sort((a, b) => {
        const numA = parseInt(atob(a.cardId).split('-')[1]) || 0
        const numB = parseInt(atob(b.cardId).split('-')[1]) || 0
        return numA - numB
      })
    }

    return cards
  }, [activity])

  const cardsOfTheDay = useMemo(() => {
    const today = new Date().toLocaleDateString('en-US', { timeZone: 'EST' })
    return sortedCards.filter(
      (card) =>
        card.completionStatus === CompletionStatus.REVIEW ||
        (card.completionStatus !== CompletionStatus.INACTIVE &&
          card.completionStatus !== CompletionStatus.COMPLETED &&
          (today === card.nextShowDate || today === card.addedOn))
    )
  }, [sortedCards])

  const allActiveCards = useMemo(
    () => sortedCards.filter((card) => card.completionStatus !== CompletionStatus.INACTIVE),
    [sortedCards]
  )

  const allInactiveCards = useMemo(
    () => sortedCards.filter((card) => card.completionStatus === CompletionStatus.INACTIVE),
    [sortedCards]
  )

  return { cardsOfTheDay, allActiveCards, allInactiveCards, hash }
}
