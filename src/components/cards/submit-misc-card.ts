import { createCards } from "@/api/controller"
import { CompletionStatus } from "@/interfaces/CompletionStatusEnum"
import { IResponse } from "@/interfaces/IApiResponse"
import { ICard } from "@/interfaces/ICard"

export default async function SubmitMiscCard({userId, activity, miscList, type}: {userId: string, activity: string, miscList: string[], type: string}) {
  const language = activity.split('-')[0].toLowerCase()

  const cards: ICard[] = miscList.map((word) => {
    return {
      cardId: `${btoa(`${language}-grammar-${word}`)}`,
      activity: activity,
      activityType: 'Grammar',
      addedOn: null,
      lastUpdatedOn: null,
      nextShowDate: null,
      stage: '0',
      completionStatus: CompletionStatus.INACTIVE
    }
  })
  
  const payload = {
    userId,
    activity,
    cards
  }

  return await createCards(payload) as IResponse;
}