export const COMPLETION_STATUS = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  REVIEW: 'review',
  DELINQUENT: 'delinquent',
  INACTIVE: 'inactive',
} as const

export type CompletionStatus = (typeof COMPLETION_STATUS)[keyof typeof COMPLETION_STATUS]
