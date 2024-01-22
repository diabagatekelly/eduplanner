import { CompletionStatus } from "./CompletionStatusEnum"
import { ISODateString } from "./isoDateType"

export interface IActivity {
  activityId: string, // btoa(name-email)
  name: string,
  points: number,
  description: string,
  completionStatus: CompletionStatus,
  hasCards: boolean | string,
  createdOn: ISODateString,
  lastUpdatedOn: ISODateString,
  userId: string 
}


export type IActivityFormData = Omit<IActivity, 'userId'|'activityId'|'completionStatus'|'createdOn'|'lastUpdatedOn'>;
// 'activityId, completionStatus, createdOn, lastUpdatedOn'