<script setup>
import { ref, computed } from 'vue'

const text = ref('')
const words = ref('')
const result = ref([])
const highlightedText = ref('')
const filter = ref('all')

const checkWords = () => {
  text.value = text.value
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line.length > 0)
    .join('\n')
  const wordsArray = words.value.split(/\s+/)
  highlightedText.value = text.value
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
  let textContent = text.value
  const regex = new RegExp(word, 'gi')

  textContent = textContent.replace(regex, `<span class="highlight">${word}</span>`)
  highlightedText.value = textContent
}

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
      <textarea
        v-model="text"
        rows="10"
        cols="50"
        placeholder="Вставь текст сюда"
        @change="checkWords"
      ></textarea>
      <textarea
        v-model="words"
        rows="10"
        cols="50"
        placeholder="Вставь слова сюда"
        @change="checkWords"
      ></textarea>
    </div>

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
          <p
            class="word"
            v-for="(word, index) in filteredWords"
            :key="index"
            @mouseover="selectWordsInText(word)"
            @mouseleave="highlightedText = text"
          >
            {{ word }} -
            {{ text.toLowerCase().includes(word.toLowerCase()) ? 'Найдено' : 'Не найдено' }}
          </p>
        </div>
      </div>
      <button @click="copyNotFoundWordsToClipboard">Скопировать не найденные слова</button>
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
  width: 45%;
  height: 200px;
  margin: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #fff;
}

.result {
  text-align: center;
}

.output {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding-bottom: 20px;
}

.interactive-text {
  width: 65%;
  padding: 10px;
  text-align: left;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #fff;
}

.words {
  width: 30%;
  text-align: left;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #fff;
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
}

button:hover {
  background-color: #0056b3;
}
button:active {
  background-color: #004085;
}
button:focus {
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.5);
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
</style>
