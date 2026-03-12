import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createCards,
  editAnyCardAttr,
  editCardStage,
  resetCardStage,
  activateCard,
  deleteCard,
  requestCardReview,
} from '@/api/controller'
import { queryKeys } from '@/lib/query-keys'
import { ICard } from '@/types/ICard'

function invalidateUserAndStudent(queryClient: ReturnType<typeof useQueryClient>, userId: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.student(userId) }),
  ])
}

export function useCreateCards(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ activity, cards }: { activity: string; cards: ICard[] }) =>
      createCards({ userId, activity, cards }),
    onSuccess: async () => {
      await invalidateUserAndStudent(queryClient, userId)
    },
  })
}

export function useEditCard(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      activity,
      cardId,
      editData,
    }: {
      activity: string
      cardId: string
      editData: Record<string, any>
    }) => editAnyCardAttr({ userId, activity, cardId, editData }),
    onSuccess: async () => {
      await invalidateUserAndStudent(queryClient, userId)
    },
  })
}

export function useEditCardStage(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      activity,
      cardId,
      editData,
    }: {
      activity: string
      cardId: string
      editData: Record<string, any>
    }) => editCardStage({ userId, activity, cardId, editData }),
    onSuccess: async () => {
      await invalidateUserAndStudent(queryClient, userId)
    },
  })
}

export function useResetCardStage(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ activity, cardId }: { activity: string; cardId: string }) =>
      resetCardStage({ userId, activity, cardId }),
    onSuccess: async () => {
      await invalidateUserAndStudent(queryClient, userId)
    },
  })
}

export function useActivateCard(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ activity, cardId }: { activity: string; cardId: string }) =>
      activateCard({ userId, activity, cardId }),
    onSuccess: async () => {
      await invalidateUserAndStudent(queryClient, userId)
    },
  })
}

export function useDeleteCard(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (cards: { activity: string; cardId: string }[]) =>
      deleteCard(cards.map((card) => ({ ...card, userId }))),
    onSuccess: async () => {
      await invalidateUserAndStudent(queryClient, userId)
    },
  })
}

export function useRequestCardReview() {
  return useMutation({
    mutationFn: (data: {
      id: string
      teacherId: string
      student: { id: string; fullName: string; email: string }
    }) => requestCardReview(data),
  })
}
