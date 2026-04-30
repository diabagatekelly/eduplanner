import { useMemo } from 'react'
import { ICard } from '@/types/ICard'
import { IActivity } from '@/types/IActivity'
import { COMPLETION_STATUS } from '@/lib/constants/completion-status'

export function useCardFiltering(activity: IActivity | undefined, mounted: boolean | undefined) {
  const hash = mounted ? window.location.hash : ''

  const sortedCards = useMemo(() => {
    const cards: ICard[] = activity?.cards ? [...activity.cards] : []

    if (cards.length) {
      cards.sort((a, b) => {
        const partA = atob(a.cardId).split('-')[1]
        const partB = atob(b.cardId).split('-')[1]

        const numA = Number.parseInt(partA, 10)
        const numB = Number.parseInt(partB, 10)

        const safeA = Number.isNaN(numA) ? Number.POSITIVE_INFINITY : numA
        const safeB = Number.isNaN(numB) ? Number.POSITIVE_INFINITY : numB

        return safeA - safeB
      })
    }

    return cards
  }, [activity])

  const cardsOfTheDay = useMemo(() => {
    const today = new Date().toLocaleDateString('en-US', { timeZone: 'EST' })
    return sortedCards.filter(
      (card) =>
        card.completionStatus === COMPLETION_STATUS.REVIEW ||
        (card.completionStatus !== COMPLETION_STATUS.INACTIVE &&
          card.completionStatus !== COMPLETION_STATUS.COMPLETED &&
          (today === card.nextShowDate || today === card.addedOn))
    )
  }, [sortedCards])

  const allActiveCards = useMemo(
    () => sortedCards.filter((card) => card.completionStatus !== COMPLETION_STATUS.INACTIVE),
    [sortedCards]
  )

  const allInactiveCards = useMemo(
    () => sortedCards.filter((card) => card.completionStatus === COMPLETION_STATUS.INACTIVE),
    [sortedCards]
  )

  return { cardsOfTheDay, allActiveCards, allInactiveCards, hash }
}
