'use client'

import { FormEvent, useEffect, useState } from 'react'
import { ICard, IQuranCards } from '../../types/ICard'
import React from 'react'
import { IActivity } from '@/types/IActivity'
import { CARD_ACTIVITY_TYPES } from '@/lib/constants/cardTypes'
import { IUser } from '@/types/IUser'
import { useCreateCards, useDeleteCard } from '@/hooks/use-card-mutations'
import { quranCards } from '@/lib/constants/quran-bank'
import { CompletionStatus } from '@/types/CompletionStatusEnum'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { quranCustomSchema, QuranCustomFormData } from '@/lib/schemas/card.schemas'
import { toast } from 'sonner'
import { handleMutationError } from '@/lib/helpers/mutation-error-handler'

export default function AddQuranCardForm({
  isMain,
  user,
  activity,
}: {
  isMain: boolean
  user: IUser
  activity: IActivity
}) {
  const createCardsMutation = useCreateCards(user.userId)
  const deleteCardMutation = useDeleteCard(user.userId)

  const {
    register,
    getValues,
    reset: resetForm,
  } = useForm<QuranCustomFormData>({
    resolver: zodResolver(quranCustomSchema),
    defaultValues: { content: '' },
  })

  const [formData, setFormData] = useState<IQuranCards[]>([])
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const [selectedJuz, setSelectedJuz] = useState<number[]>([])

  useEffect(() => {
    const selectedJuz = [...quranCards]
      .filter(
        (card) =>
          activity?.cards?.some((currentCards: ICard) => currentCards.cardId === card.cardId) &&
          card.level === 'Juz'
      )
      .map((selectedJuz) => selectedJuz.juz)
    setSelectedJuz([...selectedJuz])

    const cardsToDisplay = [...quranCards].map((card: any) => {
      if (
        activity?.cards?.some((currentCards: ICard) => currentCards.cardId === card.cardId) ||
        selectedJuz.includes(card.juz)
      ) {
        card.shouldDisable = true
      } else {
        card.shouldDisable = false
      }
      return card
    })

    setFormData([...cardsToDisplay])
  }, [user, activity])

  function Checkboxes({ quranCard, handleInput }: { quranCard: any; handleInput: any }) {
    if (quranCard.level === 'Juz') {
      const { cardId, juz, shouldDisable, isChecked } = quranCard
      return (
        <div data-testid="quran-checkbox" className="flex items-center mb-4">
          <input
            data-testid="quran-checkbox-input"
            checked={isChecked}
            disabled={shouldDisable}
            onChange={(e) => handleInput(e)}
            id={`checkbox-juz-${juz}`}
            type="checkbox"
            value={cardId}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor={`checkbox-juz-${juz}`}
            className={
              shouldDisable
                ? 'ms-2 text-sm font-medium text-gray-900 dark:text-gray-300 italic'
                : 'ms-2 text-sm font-medium text-gray-900 dark:text-gray-300'
            }
          >
            Juz {juz}
          </label>
        </div>
      )
    } else if (quranCard.level === 'Surah') {
      const { cardId, name, number, juz, shouldDisable, isChecked } = quranCard
      return (
        <div data-testid="quran-checkbox" className="flex items-center mb-4 ml-6">
          <input
            data-testid="quran-checkbox-input"
            checked={isChecked}
            disabled={shouldDisable}
            onChange={(e) => handleInput(e)}
            id={`checkbox-juz-${juz}-surah-${number}`}
            type="checkbox"
            value={cardId}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor={`checkbox-juz-${juz}-surah-${number}`}
            className={
              shouldDisable
                ? 'ms-2 text-sm font-medium text-gray-900 dark:text-gray-300 italic'
                : 'ms-2 text-sm font-medium text-gray-900 dark:text-gray-300'
            }
          >
            {number} - {name}
          </label>
        </div>
      )
    }
  }

  function handleInput(e: React.FormEvent<HTMLInputElement>) {
    const alreadySelected = [...selectedCards]
    const ajzah = [...selectedJuz]

    const newlySelected: string = (e.target as HTMLInputElement).value
    const isChecked: boolean = (e.target as HTMLInputElement).checked
    const newlySelectedCard = [...quranCards].find((card) => card.cardId === newlySelected)

    if (isChecked && !alreadySelected.includes(newlySelected)) {
      alreadySelected.push(newlySelected)
      if (newlySelectedCard?.level === 'Juz') {
        ajzah.push(newlySelectedCard.juz)
      }
    } else if (!isChecked && alreadySelected.includes(newlySelected)) {
      alreadySelected.splice(alreadySelected.indexOf(newlySelected), 1)

      if (newlySelectedCard && ajzah.includes(newlySelectedCard.juz)) {
        ajzah.splice(ajzah.indexOf(newlySelectedCard.juz), 1)
      }
    }

    const cards = [...formData].map((card: any) => {
      if (alreadySelected.some((selectedCardId: string) => selectedCardId === card.cardId)) {
        card.isChecked = true
      } else {
        card.isChecked = false
      }

      return card
    })

    setSelectedJuz([...ajzah])
    setFormData([...cards])
    setSelectedCards([...alreadySelected])
  }

  async function submitForm(e: FormEvent<HTMLFormElement>): Promise<any> {
    e.preventDefault()
    try {
      const customContent = getValues('content').trim()

      if (!selectedCards.length && customContent === '') {
        toast.warning('Please select the cards you want to add.')
        return
      }

      const cardsToRemove = [...quranCards]
        .filter(
          (card) =>
            card.level === 'Surah' &&
            selectedJuz.includes(card.juz) &&
            activity?.cards?.some((currentCard: ICard) => currentCard.cardId === card.cardId)
        )
        .map((card) => {
          return { userId: user.userId, activity: activity.name, cardId: card.cardId }
        })

      const finalizedListToCreate = selectedCards.filter((card) =>
        cardsToRemove.length
          ? cardsToRemove.some((cardToRemove) => cardToRemove.cardId !== card)
          : true
      )

      const cards: ICard[] = finalizedListToCreate.map((card) => {
        return {
          cardId: card,
          activity: activity.name,
          activityType: CARD_ACTIVITY_TYPES.QURAN,
          addedOn: null,
          lastUpdatedOn: null,
          nextShowDate: null,
          stage: '0',
          completionStatus: CompletionStatus.INACTIVE,
        }
      })

      if (customContent !== '') {
        cards.push({
          cardId: `${btoa(`custom-${customContent}`)}`,
          activity: activity.name,
          activityType: CARD_ACTIVITY_TYPES.QURAN,
          addedOn: null,
          lastUpdatedOn: null,
          nextShowDate: null,
          stage: '0',
          completionStatus: CompletionStatus.INACTIVE,
        })
      }

      const createResponse = await createCardsMutation.mutateAsync({
        activity: activity.name,
        cards,
      })
      const { data } = createResponse

      if (cardsToRemove.length) {
        await deleteCardMutation.mutateAsync(
          cardsToRemove.map((card) => ({ activity: card.activity, cardId: card.cardId }))
        )
      }

      toast.success(data.message)
    } catch (error: unknown) {
      handleMutationError(error, 'add cards')
    }
  }

  return (
    <>
      <form
        data-testid="addQuranCardForm"
        id="addQuranCardForm"
        onSubmit={submitForm}
        method="POST"
        className="space-y-6"
      >
        <fieldset>
          <legend className="sr-only">Checkbox variants</legend>
          {formData.map((val, i) => (
            <Checkboxes key={`${i}`} quranCard={val} handleInput={handleInput} />
          ))}
        </fieldset>
        <hr />
        <fieldset>
          <div className="mb-5">
            <label
              htmlFor="content"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Custom (Surah name range start to range end):
            </label>
            <input
              {...register('content')}
              data-testid="custom-quran"
              id="content"
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Naas 1 to 2"
            />
          </div>
        </fieldset>
        <div>
          <button
            data-testid="add-cards-submit-button"
            type="submit"
            disabled={createCardsMutation.isPending || (isMain && user.accountType === 'student')}
            className={'default-btn'}
          >
            Submit Cards
          </button>
        </div>
      </form>
    </>
  )
}
