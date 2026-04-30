import { CompletionStatus, COMPLETION_STATUS } from '@/lib/constants/completion-status'

export function getBorderColor(listItem: { completionStatus?: CompletionStatus }) {
  let borderColor = 'rgb(253 186 116)' //orange
  if (listItem?.completionStatus === COMPLETION_STATUS.PENDING) {
    borderColor = 'rgb(253 186 116)' //orange
  } else if (listItem?.completionStatus === COMPLETION_STATUS.COMPLETED) {
    borderColor = 'rgb(34 197 94)' //green
  } else if (
    listItem?.completionStatus === COMPLETION_STATUS.REVIEW ||
    listItem?.completionStatus === COMPLETION_STATUS.INACTIVE
  ) {
    borderColor = 'rgb(107 114 128)' //gray
  } else if (listItem?.completionStatus === COMPLETION_STATUS.DELINQUENT) {
    borderColor = 'rgb(239 68 68)' //red
  } else {
    borderColor = 'rgb(0, 0, 0)'
  }

  return borderColor
}
