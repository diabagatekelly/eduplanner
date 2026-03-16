import { z } from 'zod'

export const activitySchema = z.object({
  name: z.string().min(1, 'Activity name is required'),
  description: z.string(),
  points: z.number(),
  hasCards: z.enum(['true', 'false']),
})

export type ActivityFormData = z.infer<typeof activitySchema>
