export const ACTIVITY_TYPES = {
  QURAN: 'Quran',
  LANGUAGE: 'Language',
  MISC: 'Misc',
} as const

export type ActivityType = (typeof ACTIVITY_TYPES)[keyof typeof ACTIVITY_TYPES]
