<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { checkWords, escapeRegExp, getRegExp, copyNotFoundWordsToClipboard } from '@/utils'

const text = ref('')
const words = ref('')
const wordsArray = ref([])

const highlightedText = ref('')
const filter = ref('all')
const selectedWord = ref(null)
const interactiveTextRef = ref(null)

const isEditModalOpen = ref(false)
const editWordIndex = ref(null)
const editWordValue = ref('')
const editWordFound = ref(false)

const openEditModal = (word, index) => {
  editWordIndex.value = index
  editWordValue.value = word
  isEditModalOpen.value = true
  checkEditWordFound()
}

const checkEditWordFound = () => {
  const regex = getRegExp(editWordValue.value.trim())
  editWordFound.value = regex.test(text.value)
}

const saveEditWord = () => {
  if (editWordIndex.value !== null) {
    wordsArray.value.splice(editWordIndex.value, 1, editWordValue.value.trim())
    isEditModalOpen.value = false
    editWordIndex.value = null
    editWordValue.value = ''
    highlightedText.value = text.value.replace(/\n/g, '<br>')
  }
}

const selectWordsInText = (word) => {
  selectedWord.value = word
  const escapedWord = escapeRegExp(word.trim())
  const regex = new RegExp(`(^|[^\\p{L}])(${escapedWord})(?=[\\s.,!?;:]|$|<br>)`, 'giu')

  highlightedText.value = text.value
    .replace(/\n/g, '<br>')
    .replace(regex, `$1<span class="highlight">$2</span>`)
}

watch(filter, () => {
  selectedWord.value = null
  highlightedText.value = text.value.replace(/\n/g, '<br>')
})

watch(highlightedText, async () => {
  await nextTick()
  const container = interactiveTextRef.value
  if (container) {
    const highlight = container.querySelector('.highlight')
    if (highlight) {
      container.scrollTop = highlight.offsetTop - container.offsetTop
    }
  }
})

const filteredWords = computed(() => {
  if (filter.value === 'found' || filter.value === 'not-found') {
    return wordsArray.value.filter((word) => {
      const regex = getRegExp(word)
      const isMatch = regex.test(text.value)
      return filter.value === 'found' ? isMatch : !isMatch
    })
  }

  return wordsArray.value
})
</script>

<template>
  <header>Проверка наличия слов в тексте</header>

  <main>
    <div class="text-area">
      <textarea v-model="text" rows="10" cols="50" placeholder="Вставь текст сюда"></textarea>
      <textarea v-model="words" rows="10" cols="50" placeholder="Вставь слова сюда"></textarea>
    </div>

    <button @click="[text, highlightedText, wordsArray, selectedWord] = checkWords(text, words)">
      Проверить слова
    </button>

    <div v-if="wordsArray.length" class="result">
      <h2>Результат:</h2>
      <div class="output">
        <div class="interactive-text" v-html="highlightedText" ref="interactiveTextRef"></div>

        <div class="words">
          <div class="filter">
            <div class="label">
              <input type="radio" id="all" value="all" v-model="filter" />
              <label for="all">Все слова</label>
            </div>
            <div class="label">
              <input type="radio" id="found" value="found" v-model="filter" />
              <label for="found">Найденные слова</label>
            </div>
            <div class="label">
              <input type="radio" id="not-found" value="not-found" v-model="filter" />
              <label for="not-found">Не найденные слова</label>
            </div>
          </div>

          <p
            class="word"
            v-for="(word, index) in filteredWords"
            :key="index"
            @click="selectWordsInText(word)"
            @dblclick="openEditModal(word, wordsArray.indexOf(word))"
            :class="{ selected: selectedWord === word }"
          >
            {{ word }}
          </p>
        </div>
      </div>
      <button @click="copyNotFoundWordsToClipboard(wordsArray, text)">
        Скопировать не найденные слова
      </button>
    </div>

    <div v-if="isEditModalOpen" class="modal-overlay">
      <div class="modal">
        <h3 class="modal-element">Редактировать слово</h3>
        <input
          class="modal-element modal-input"
          v-model="editWordValue"
          @input="checkEditWordFound"
          @keyup.enter="saveEditWord"
          autofocus
        />
        <div class="modal-element" :style="{ color: editWordFound ? 'green' : 'red' }">
          {{ editWordFound ? 'Слово найдено в тексте' : 'Слово не найдено в тексте' }}
        </div>
        <div class="modal-buttons">
          <button @click="saveEditWord" :disabled="!editWordValue.trim()">Сохранить</button>
          <button @click="[isEditModalOpen, editWordIndex, editWordValue] = [false, null, '']">
            Отмена
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
header {
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
}

main {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.text-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 21px;
}

textarea {
  width: 48%;
  height: 200px;
  margin: 10px;
  padding: 10px;
  resize: none;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #fff;
}

.result {
  text-align: center;
  width: 100%;
}

.output {
  display: flex;
  justify-content: space-between;
  min-width: 100%;
  padding-bottom: 20px;
}

.interactive-text {
  width: 63%;
  padding: 10px;
  text-align: left;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #fff;
  max-height: 300px;
  overflow-y: auto;
}

.words {
  width: 35%;
  text-align: left;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #fff;
  max-height: 300px;
  overflow-y: auto;
}

.words-label {
  background-color: #fff;
  margin-bottom: 10px;
}

.word {
  cursor: pointer;
  background-color: #fff;
}

.word:hover {
  font-weight: bold;
}

.word.selected {
  background-color: #ffe066;
  font-weight: bold;
}

::v-deep(.highlight) {
  font-weight: bold;
  background-color: yellow;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

button {
  padding: 10px 20px;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  margin-bottom: 20px;
}

button:hover {
  background-color: #0056b3;
  box-shadow: 4px 4px 8px 0 rgba(0, 123, 255, 0.5);
}
button:active {
  background-color: #004085;
  box-shadow: none;
}
button:focus {
  outline: none;
}

.filter {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 10px;
  background-color: #fff;
}

.label {
  background-color: #fff;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  padding: 24px 32px;
  border-radius: 10px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  min-width: 300px;
  text-align: center;
}

.modal-element {
  margin-bottom: 10px;
  background-color: #fff;
}

.modal-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #fff;
}

.modal-buttons {
  margin-top: 16px;
  display: flex;
  gap: 12px;
  justify-content: center;
  background: #fff;
}
</style>
