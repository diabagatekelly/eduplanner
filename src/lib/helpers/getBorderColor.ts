import { CompletionStatus } from "@/types/CompletionStatusEnum"

export function getBorderColor(listItem) {
  let borderColor = 'rgb(253 186 116)' //orange
  if (listItem?.completionStatus === CompletionStatus.PENDING) {
    borderColor = 'rgb(253 186 116)' //orange
  } else if (listItem?.completionStatus === CompletionStatus.COMPLETED) {
    borderColor = 'rgb(34 197 94)' //green
  } else if ([CompletionStatus.REVIEW, CompletionStatus.INACTIVE].includes(listItem?.completionStatus)) {
    borderColor = 'rgb(107 114 128)' //gray
  } else if (listItem?.completionStatus === CompletionStatus.DELINQUENT) {
    borderColor = 'rgb(239 68 68)' //red
  } else {
    borderColor = 'rgb(0, 0, 0)'
  }

  return borderColor;
}