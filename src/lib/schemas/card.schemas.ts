import { z } from 'zod'

export const miscCardSchema = z.object({
  words: z.string().min(1, 'Please enter at least one card'),
})

export type MiscCardFormData = z.infer<typeof miscCardSchema>

export const languageCardSchema = z.object({
  words: z.string().min(1, 'Please enter at least one item'),
})

export type LanguageCardFormData = z.infer<typeof languageCardSchema>

export const quranCustomSchema = z.object({
  content: z.string(),
})

export type QuranCustomFormData = z.infer<typeof quranCustomSchema>
