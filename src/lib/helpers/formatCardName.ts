export default function formatCardName(cardId: string, activityName: string) {
  if (activityName === 'Quran') {
    return _formatQuranCardName(cardId)
  } else if (activityName.includes('Language')) {
    return _formatLanguageCardName(cardId)
  } else {
    return _formatMiscCardName(cardId)
  }
}

function _formatQuranCardName(cardId) {
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

function _formatLanguageCardName(cardId) {
  const cardName = atob(cardId)
  const cardNameNoHyphens = cardName.split('-')
  return `${_capitalizeFirstLetter(cardNameNoHyphens[0])} ${_capitalizeFirstLetter(cardNameNoHyphens[1])}: ${cardNameNoHyphens[2]}`
}

function _formatMiscCardName(cardId) {
  const cardName = atob(cardId)
  const cardNameNoHyphens = cardName.split('-')
  return `Miscellaneous Card: ${cardNameNoHyphens[2]}`
}

function _capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
