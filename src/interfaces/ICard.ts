import { CompletionStatus } from "./CompletionStatusEnum";
import { ISODateString } from "./isoDateType";

export interface ICard {
  cardId: string,
  activity: string,
  activityType: string,
  addedOn: ISODateString,
  lastUpdatedOn: ISODateString,
  nextShowDate: ISODateString,
  stage: string,
  cardContent: string,
  completionStatus: CompletionStatus,
}