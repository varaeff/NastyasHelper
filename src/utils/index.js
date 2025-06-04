export const checkWords = (text, words, workType) => {
  const normilizedText = text
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line.length > 0)
    .join('\n')

  const highlightedText = normilizedText.replace(/\n/g, '<br>')

  const normilizedWords =
    workType === 'text'
      ? words
          .replace(/\((m|f|mpl|fpl)\)/gi, '')
          .split('\n')
          .map((word) => word.trim())
          .filter((word) => word.length > 0)
      : words
          .split('\n')
          .map((word) => word.trim())
          .filter((word) => word.length > 0)

  return [normilizedText, highlightedText, normilizedWords, null]
}

export const escapeRegExp = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const getRegExp = (word) => {
  const escapedWord = escapeRegExp(word.trim())
  const pattern = `(^|[^\\p{L}]|<br\\s*/?>)(${escapedWord})(?=[\\s.,!?;:]|<br\\s*/?>|$)`
  return new RegExp(pattern, 'giu')
}

export const copyWordsToClipboard = (wordsArray, text, found) => {
  const wordsToReturn = wordsArray.filter((word) => {
    const regex = getRegExp(word)
    return found ? regex.test(text) : !regex.test(text)
  })
  if (wordsToReturn.length > 0) {
    navigator.clipboard.writeText(wordsToReturn.join('\n')).then(() => {
      alert('Copied to clipboard')
    })
  }
}
