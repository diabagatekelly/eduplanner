import { CompletionStatus } from './CompletionStatusEnum'
import { ISODateString } from './isoDateType'

export interface ICard {
  cardId: string
  activity: string
  activityType: string
  addedOn: ISODateString
  lastUpdatedOn: ISODateString
  nextShowDate: ISODateString
  stage: string
  completionStatus: CompletionStatus
}

export interface IQuranJuzCard {
  cardId: string // btoa(juz-30)
  type: 'Quran'
  level: 'Juz'
  juz: number
}

export interface IQuranSurahCard {
  cardId: string // btoa(surah-114-juz-30)
  type: 'Quran'
  level: 'Surah'
  name: string
  juz: number
  number: number
}

export type IQuranCards = (IQuranJuzCard | IQuranSurahCard)[]

//JUST FOR REFERENCE
export interface ILanguageVocabCard {
  cardId: string // btoa(arabic-vocab-house)
  word: string
  instructions: 'Recall to / from; use in spoken sentences; EXTRA: practice spelling; use in 3 written sentences'
}
