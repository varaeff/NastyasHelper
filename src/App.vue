<script setup>
import { ref, computed, watch } from 'vue'

const text = ref('')
const words = ref('')
const result = ref([])

const highlightedText = ref('')
const filter = ref('all')
const selectedWord = ref(null)

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
  editWordFound.value = text.value.toLowerCase().includes(editWordValue.value.trim().toLowerCase())
}

const saveEditWord = () => {
  if (editWordIndex.value !== null) {
    result.value.splice(editWordIndex.value, 1, editWordValue.value.trim())
    isEditModalOpen.value = false
    editWordIndex.value = null
    editWordValue.value = ''
    highlightedText.value = text.value.replace(/\n/g, '<br>')
  }
}

const cancelEditWord = () => {
  isEditModalOpen.value = false
  editWordIndex.value = null
  editWordValue.value = ''
}

const checkWords = () => {
  text.value = text.value
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line.length > 0)
    .join('\n')

  const wordsArray = words.value
    .replace(/\((m|f|mpl|fpl)\)/gi, '')
    .split('\n')
    .map((word) => word.trim())
    .filter((word) => word.length > 0)
  highlightedText.value = text.value.replace(/\n/g, '<br>')
  result.value = wordsArray.map((word) => word.trim()).filter((word) => word.length > 0)
}

const copyNotFoundWordsToClipboard = () => {
  const notFoundWords = result.value.filter((word) => {
    return !text.value.toLowerCase().includes(word.toLowerCase())
  })
  if (notFoundWords.length > 0) {
    navigator.clipboard.writeText(notFoundWords.join(' ')).then(() => {
      alert('Не найденные слова скопированы в буфер обмена!')
    })
  } else {
    alert('Все слова найдены!')
  }
}

const selectWordsInText = (word) => {
  highlightedText.value = text.value.replace(/\n/g, '<br>')
  selectedWord.value = word

  let textContent = text.value
  const regex = new RegExp(word, 'gi')

  textContent = textContent.replace(regex, `<span class="highlight">${word}</span>`)
  highlightedText.value = textContent.replace(/\n/g, '<br>')
}

watch(filter, () => {
  selectedWord.value = null
  highlightedText.value = text.value.replace(/\n/g, '<br>')
})

const filteredWords = computed(() => {
  if (filter.value === 'found') {
    return result.value.filter((word) => text.value.toLowerCase().includes(word.toLowerCase()))
  } else if (filter.value === 'not-found') {
    return result.value.filter((word) => !text.value.toLowerCase().includes(word.toLowerCase()))
  }
  return result.value
})
</script>

<template>
  <header>Проверка наличия слов в тексте</header>

  <main>
    <div class="text-area">
      <textarea v-model="text" rows="10" cols="50" placeholder="Вставь текст сюда"></textarea>
      <textarea v-model="words" rows="10" cols="50" placeholder="Вставь слова сюда"></textarea>
    </div>

    <button @click="checkWords">Проверить слова</button>

    <div v-if="result.length" class="result">
      <h2>Результат:</h2>
      <div class="output">
        <div class="interactive-text" v-html="highlightedText"></div>

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

          <div v-if="filter === 'all'">
            <p
              class="word"
              v-for="(word, index) in filteredWords"
              :key="index"
              @click="selectWordsInText(word)"
              @dblclick="openEditModal(word, result.indexOf(word))"
              :class="{ selected: selectedWord === word }"
            >
              {{ word }} -
              {{ text.toLowerCase().includes(word.toLowerCase()) ? 'Найдено' : 'Не найдено' }}
            </p>
          </div>
          <div v-else>
            <p
              class="word"
              v-for="(word, index) in filteredWords"
              :key="index"
              @click="selectWordsInText(word)"
              @dblclick="openEditModal(word, result.indexOf(word))"
              :class="{ selected: selectedWord === word }"
            >
              {{ word }}
            </p>
          </div>
        </div>
      </div>
      <button @click="copyNotFoundWordsToClipboard">Скопировать не найденные слова</button>
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
          <button @click="cancelEditWord">Отмена</button>
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
  margin-bottom: 20px;
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
