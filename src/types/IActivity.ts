import { CompletionStatus } from './CompletionStatusEnum'
import { ICard } from './ICard'
import { ISODateString } from './isoDateType'

export interface IActivity {
  activityId: string // btoa(userEmail-activityName)
  name: string
  points: number
  description: string
  completionStatus: CompletionStatus
  hasCards: boolean | string
  createdOn: ISODateString
  lastUpdatedOn: ISODateString
  cards?: ICard[] | []
}

export type IActivityFormData = Omit<
  IActivity,
  'activityId' | 'completionStatus' | 'createdOn' | 'lastUpdatedOn' | 'cards'
>
