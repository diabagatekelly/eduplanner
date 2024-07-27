import { createLanguageVocabCards } from "@/api/controller";
import { CompletionStatus } from "@/interfaces/CompletionStatusEnum";
import { IResponse } from "@/interfaces/IApiResponse"
import { ICard, ILanguageVocabCards, ILanguageVocabOralCard, ILanguageVocabSpellingCard } from "@/interfaces/ICard";

export default async function SubmitLanguageVocabCard({userId, activity, vocabList}: {userId: string, activity: string, vocabList: string[]}) {
  const language = activity.split('-')[0].toLowerCase()
  let userCards: ICard[] = [];
  let bankCards: ILanguageVocabCards = [];

  vocabList.forEach((word) => {
    const oralCard: ICard = {
      cardId: `${btoa(`${language}-vocab-${word}-oral`)}`,
      activity: activity,
      activityType: 'Vocab',
      addedOn: null,
      lastUpdatedOn: null,
      nextShowDate: null,
      stage: '0',
      completionStatus: CompletionStatus.INACTIVE
    };
    const spellingCards: ICard = {
      cardId: `${btoa(`${language}-vocab-${word}-spelling`)}`,
      activity: activity,
      activityType: 'Vocab',
      addedOn: null,
      lastUpdatedOn: null,
      nextShowDate: null,
      stage: '0',
      completionStatus: CompletionStatus.INACTIVE
    }
    userCards.push(oralCard, spellingCards)

    const spellingBankCard: ILanguageVocabSpellingCard = {
      cardId: `${btoa(`${language}-vocab-${word}-spelling`)}`, 
      word,
      instructions: 'Write in target language; use in 3 written sentences',
      type: 'spelling'
    }
    const oralBankCard: ILanguageVocabOralCard = {
      cardId: `${btoa(`${language}-vocab-${word}-oral`)}`, 
      word,
      instructions: 'Recall to / from; use in 3 spoken sentences',
      type: 'oral'
    }
    bankCards.push(oralBankCard, spellingBankCard)
  })
  
  const payload = {
    userId,
    activity,
    cards: {
      userCards,
      bankCards
    }
  }

  return await createLanguageVocabCards(payload) as IResponse;
}