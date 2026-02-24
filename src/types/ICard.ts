import { CompletionStatus } from './CompletionStatusEnum'
import { ISODateString } from './isoDateType'

export type CardActivityType = 'Quran' | 'Vocab' | 'Grammar' | 'Miscellaneous'

export interface ICard {
  cardId: string
  activity: string
  activityType: CardActivityType
  addedOn: ISODateString | null
  lastUpdatedOn: ISODateString | null
  nextShowDate: ISODateString | null
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

export interface ILanguageVocabCard {
  cardId: string // btoa(arabic-vocab-house)
  word: string
  instructions: 'Recall to / from; use in spoken sentences; EXTRA: practice spelling; use in 3 written sentences'
}

export interface ILanguageGrammarCard {
  cardId: string // btoa(arabic-grammar-rule)
  rule: string
}

export interface IMiscCard {
  cardId: string // btoa(misc-card-description)
  description: string
}
