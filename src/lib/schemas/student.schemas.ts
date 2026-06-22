import { z } from 'zod'

export const searchStudentSchema = z.object({
  email: z.string().min(1, 'Email is required'),
})

export type SearchStudentFormData = z.infer<typeof searchStudentSchema>
