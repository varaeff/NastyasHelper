export const checkWords = (text, words) => {
  const normilizedText = text
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line.length > 0)
    .join('\n')

  const highlightedText = normilizedText.replace(/\n/g, '<br>')

  const normilizedWords = words
    .replace(/\((m|f|mpl|fpl)\)/gi, '')
    .split('\n')
    .map((word) => word.trim())
    .filter((word) => word.length > 0)

  return [normilizedText, highlightedText, normilizedWords, null]
}

export const getRegExp = (word) => {
  const pattern = `(^|\\s)${word.toLowerCase()}(?=[\\s.,!?;:])`
  return new RegExp(pattern, 'gi')
}

export const copyNotFoundWordsToClipboard = (wordsArray, text) => {
  const notFoundWords = wordsArray.filter((word) => {
    const regex = getRegExp(word)
    return !regex.test(text)
  })
  if (notFoundWords.length > 0) {
    navigator.clipboard.writeText(notFoundWords.join('\n')).then(() => {
      alert('Не найденные слова скопированы в буфер обмена!')
    })
  } else {
    alert('Все слова найдены!')
  }
}
