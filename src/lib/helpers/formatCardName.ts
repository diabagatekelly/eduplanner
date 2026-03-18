import { ACTIVITY_TYPES } from '@/lib/constants/activityTypes'

export default function formatCardName(cardId: string, activityName: string | undefined) {
  if (!activityName) return ''
  if (activityName === ACTIVITY_TYPES.QURAN) {
    return _formatQuranCardName(cardId)
  } else if (activityName.includes(ACTIVITY_TYPES.LANGUAGE)) {
    return _formatLanguageCardName(cardId)
  } else {
    return _formatMiscCardName(cardId)
  }
}

function _formatQuranCardName(cardId: string) {
  const cardName = atob(cardId)
  const cardNameNoHyphens = cardName.split('-')

  if (cardNameNoHyphens[0] === 'juz') {
    return `${_capitalizeFirstLetter(cardNameNoHyphens[0])} ${cardNameNoHyphens[1]}`
  } else if (cardNameNoHyphens[0] === 'custom') {
    return `${_capitalizeFirstLetter(cardNameNoHyphens[0])}: ${cardNameNoHyphens[1]}`
  } else {
    return `${_capitalizeFirstLetter(cardNameNoHyphens[0])} ${cardNameNoHyphens[1]}: ${cardNameNoHyphens[3]}`
  }
}

function _formatLanguageCardName(cardId: string) {
  const cardName = atob(cardId)
  const cardNameNoHyphens = cardName.split('-')
  return `${_capitalizeFirstLetter(cardNameNoHyphens[0])} ${_capitalizeFirstLetter(cardNameNoHyphens[1])}: ${cardNameNoHyphens[2]}`
}

function _formatMiscCardName(cardId: string) {
  const cardName = atob(cardId)
  const cardNameNoHyphens = cardName.split('-')
  return `Miscellaneous Card: ${cardNameNoHyphens[2]}`
}

function _capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
