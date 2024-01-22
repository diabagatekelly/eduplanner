import { ISODateString } from "@/interfaces/isoDateType";

export function formatISODate(isoDate: string): ISODateString {
  return isoDate.split('T')[0] as ISODateString
}