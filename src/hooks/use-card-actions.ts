import { useState } from 'react'
import {
  useEditCard,
  useEditCardStage,
  useResetCardStage,
  useActivateCard,
  useDeleteCard,
  useRequestCardReview,
} from '@/hooks/use-card-mutations'
import { ICard } from '@/types/ICard'
import { IUser } from '@/types/IUser'
import { IActivity } from '@/types/IActivity'
import { CompletionStatus } from '@/types/CompletionStatusEnum'
import { toast } from 'sonner'
import { handleMutationError } from '@/lib/helpers/mutation-error-handler'

export function useCardActions(
  userId: string,
  activity: IActivity,
  card: ICard,
  user: IUser | Partial<IUser>,
  onClose: () => void
) {
  const editCardMutation = useEditCard(userId)
  const editCardStageMutation = useEditCardStage(userId)
  const resetCardStageMutation = useResetCardStage(userId)
  const activateCardMutation = useActivateCard(userId)
  const deleteCardMutation = useDeleteCard(userId)
  const requestReviewMutation = useRequestCardReview()

  const [newStage, setNewStage] = useState('')

  function assertUserId() {
    if (!userId) throw new Error('Missing userId for card mutation')
  }

  async function resetStage() {
    try {
      assertUserId()
      await resetCardStageMutation.mutateAsync({
        activity: activity.name,
        cardId: card.cardId,
      })
      toast.success('Successfully reset card')
      onClose()
    } catch (error: unknown) {
      handleMutationError(error, 'reset card')
    }
  }

  async function submitForReview() {
    try {
      assertUserId()
      const requestReview = {
        id: card.cardId,
        teacherId: user.linkedAccountsData!.teacher!,
        student: {
          id: user.userId!,
          fullName: `${user.firstName} ${user.lastName}`,
          email: user.email!,
        },
      }

      await requestReviewMutation.mutateAsync(requestReview)

      await editCardStageMutation.mutateAsync({
        activity: activity.name,
        cardId: card.cardId,
        editData: {
          completionStatus: CompletionStatus.REVIEW,
        },
      })

      toast.success('Request for review successfully sent.')
      onClose()
    } catch (error: unknown) {
      handleMutationError(error, 'request review')
    }
  }

  async function overrideStage(e: React.MouseEvent<HTMLButtonElement>) {
    try {
      assertUserId()
      e.preventDefault()
      await editCardMutation.mutateAsync({
        activity: activity.name,
        cardId: card.cardId,
        editData: {
          stage: newStage,
        },
      })
      toast.success('Successfully overrode status.')
      onClose()
    } catch (error: unknown) {
      handleMutationError(error, 'override card stage')
    }
  }

  async function submitEditStage(newStageStatus: boolean) {
    try {
      assertUserId()
      await editCardStageMutation.mutateAsync({
        activity: activity.name,
        cardId: card.cardId,
        editData: {
          stage: card.stage,
          promote: newStageStatus,
        },
      })
      toast.success('Successfully edited status.')
      onClose()
    } catch (error: unknown) {
      handleMutationError(error, 'update card status')
    }
  }

  async function removeCard() {
    try {
      assertUserId()
      await deleteCardMutation.mutateAsync([
        {
          activity: activity.name,
          cardId: card.cardId,
        },
      ])
      toast.success('Successfully removed card')
      onClose()
    } catch (error: unknown) {
      handleMutationError(error, 'remove card')
    }
  }

  async function activate() {
    try {
      assertUserId()
      await activateCardMutation.mutateAsync({
        activity: activity.name,
        cardId: card.cardId,
      })
      toast.success('Successfully activated card')
      onClose()
    } catch (error: unknown) {
      handleMutationError(error, 'activate card')
    }
  }

  return {
    resetStage,
    submitForReview,
    overrideStage,
    submitEditStage,
    removeCard,
    activate,
    newStage,
    setNewStage,
  }
}
