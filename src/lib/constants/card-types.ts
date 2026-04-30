export const CARD_ACTIVITY_TYPES = {
  QURAN: 'Quran',
  VOCAB: 'Vocab',
  GRAMMAR: 'Grammar',
  MISCELLANEOUS: 'Miscellaneous',
} as const

export type CardActivityType = (typeof CARD_ACTIVITY_TYPES)[keyof typeof CARD_ACTIVITY_TYPES]
