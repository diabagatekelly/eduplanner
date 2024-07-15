import { CompletionStatus } from "@/interfaces/CompletionStatusEnum"

export function getBorderColor(listItem) {
  let borderColor = 'orange'
  if (listItem?.completionStatus === CompletionStatus.PENDING) {
    borderColor = 'orange'
  } else if (listItem?.completionStatus === CompletionStatus.COMPLETED) {
    borderColor = 'green'
  } else if (listItem?.completionStatus === CompletionStatus.REVIEW) {
    borderColor = 'gray'
  } else {
    borderColor = 'red'
  }

  return borderColor;
}