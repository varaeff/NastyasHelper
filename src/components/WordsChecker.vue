<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { checkWords, escapeRegExp, getRegExp, copyWordsToClipboard } from '@/utils'

const workType = ref('text')

const text = ref('')
const words = ref('')
const wordsArray = ref([])

const highlightedText = ref('')
const filter = ref('all')
const selectedWord = ref(null)
const selectedNum = ref(1)
const interactiveTextRef = ref(null)
const foundCount = ref(0)

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
  selectedNum.value = 1
  const regex = getRegExp(word)

  const matches = text.value.replace(/\n/g, '<br>').match(regex) || []
  foundCount.value = matches.length

  highlightedText.value = text.value
    .replace(/\n/g, '<br>')
    .replace(regex, `$1<span class="highlight">$2</span>`)
}

const scrollToSelectedHighlight = () => {
  nextTick(() => {
    const container = interactiveTextRef.value
    if (container) {
      const highlights = container.querySelectorAll('.highlight')
      const idx = Math.max(0, Math.min(selectedNum.value - 1, highlights.length - 1))
      const highlight = highlights[idx]
      if (highlight) {
        container.scrollTop = highlight.offsetTop - container.offsetTop
      }
    }
  })
}

watch(filter, () => {
  selectedWord.value = null
  highlightedText.value = text.value.replace(/\n/g, '<br>')
})

watch(highlightedText, () => {
  scrollToSelectedHighlight()
})

watch(workType, () => {
  text.value = ''
  words.value = ''
  wordsArray.value = []
  highlightedText.value = ''
  selectedWord.value = null
  selectedNum.value = 1
  foundCount.value = 0
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
  <main>
    <div class="work-selector">
      <div class="margin">
        <input class="radio" type="radio" id="text" value="text" v-model="workType" />
        <label for="text">Manuscript check</label>
      </div>
      <div>
        <input class="radio" type="radio" id="voc" value="voc" v-model="workType" />
        <label for="voc">Word list check</label>
      </div>
    </div>
    <h1>{{ workType === 'text' ? 'Manuscript check' : 'Word list check' }}</h1>
    <div class="text-areas">
      <div class="textarea-container">
        <h2>{{ workType === 'text' ? 'Manuscript' : 'Glossary list' }}</h2>
        <textarea
          v-model="text"
          rows="10"
          cols="50"
          :placeholder="workType === 'text' ? 'Insert your text here' : 'insert Glossary list here'"
        ></textarea>
      </div>
      <div class="textarea-container">
        <h2>{{ workType === 'text' ? 'Word list' : 'Core Vocabulary list' }}</h2>
        <textarea
          v-model="words"
          rows="10"
          cols="50"
          :placeholder="
            workType === 'text' ? 'Insert your word list here' : 'insert Core Vocabulary list here'
          "
        ></textarea>
      </div>
    </div>

    <button
      @click="[text, highlightedText, wordsArray, selectedWord] = checkWords(text, words, workType)"
    >
      Check
    </button>

    <div v-if="wordsArray.length" class="result">
      <h2>Results</h2>
      <div :class="['output', workType === 'voc' ? 'equal' : '']">
        <div class="interactive-text" v-html="highlightedText" ref="interactiveTextRef"></div>

        <div class="words">
          <div class="filter">
            <div class="label">
              <input class="radio" type="radio" id="all" value="all" v-model="filter" />
              <label class="label" for="all">All words</label>
            </div>
            <div class="label">
              <input class="radio" type="radio" id="found" value="found" v-model="filter" />
              <label class="label" for="found">Found words</label>
            </div>
            <div class="label">
              <input class="radio" type="radio" id="not-found" value="not-found" v-model="filter" />
              <label class="label" for="not-found">Not found words</label>
            </div>
          </div>

          <div class="words_list" v-for="(word, index) in filteredWords" :key="index">
            <p
              class="word"
              @click="selectWordsInText(word)"
              @dblclick="openEditModal(word, wordsArray.indexOf(word))"
              :class="{ selected: selectedWord === word }"
            >
              {{ word }}
            </p>
            <div v-if="foundCount > 1 && selectedWord === word" class="inline_buttons">
              <p class="counter">{{ selectedNum }}/{{ foundCount }}</p>
              <button
                @click="
                  () => {
                    selectedNum === foundCount ? (selectedNum = 1) : selectedNum++
                    scrollToSelectedHighlight()
                  }
                "
                class="inline_button"
              >
                ▼
              </button>
              <button
                @click="
                  () => {
                    selectedNum === 1 ? (selectedNum = foundCount) : selectedNum--
                    scrollToSelectedHighlight()
                  }
                "
                class="inline_button"
              >
                ▲
              </button>
            </div>
          </div>
        </div>
      </div>
      <button class="margin" @click="copyWordsToClipboard(wordsArray, text, false)">
        Copy not found words
      </button>
      <button @click="copyWordsToClipboard(wordsArray, text, true)">Copy found words</button>
    </div>

    <div v-if="isEditModalOpen" class="modal-overlay">
      <div class="modal">
        <h3 class="modal-element">Edit word</h3>
        <input
          class="modal-element modal-input"
          v-model="editWordValue"
          @input="checkEditWordFound"
          @keyup.enter="saveEditWord"
          autofocus
        />
        <div class="modal-element" :style="{ color: editWordFound ? 'green' : 'red' }">
          {{ editWordFound ? 'Found' : 'Not found' }}
        </div>
        <div class="modal-buttons">
          <button @click="saveEditWord" :disabled="!editWordValue.trim()">Save</button>
          <button @click="[isEditModalOpen, editWordIndex, editWordValue] = [false, null, '']">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<style lang="scss" scoped>
main {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.radio {
  margin-right: 5px;
  transform: translateY(2px);
}

.work-selector {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-right: auto;
  margin-bottom: 20px;
}

h1 {
  margin-bottom: 20px;
}

.text-areas {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 21px;
}

.textarea-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 48%;
}

textarea {
  width: 100%;
  height: 200px;
  margin: 0;
  padding: 10px;
  resize: none;
  border: 1px solid $border-color;
  border-radius: 10px;
  background-color: $background-text;
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

.interactive-text,
.words {
  padding: 10px;
  text-align: left;
  border: 1px solid $border-color;
  border-radius: 10px;
  background-color: $background-text;
  max-height: 300px;
  overflow-y: auto;
}

.interactive-text {
  width: 63%;
}

.words {
  width: 35%;

  &-label {
    background-color: $background-text;
    margin-bottom: 10px;
  }

  &_list {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    height: 1.2rem;
    background-color: $background-text;
  }
}

.word {
  cursor: pointer;
  background-color: $background-text;

  &:hover {
    font-weight: bold;
  }

  &.selected {
    background-color: #ffe066;
    font-weight: bold;
  }
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
  color: $background-text;
  cursor: pointer;
  margin-bottom: 20px;

  &:hover {
    background-color: #0056b3;
    box-shadow: 4px 4px 8px 0 rgba(0, 123, 255, 0.5);
  }

  &:active {
    background-color: #004085;
    box-shadow: none;
  }

  &:focus {
    outline: none;
  }
}

.margin {
  margin-right: 20px;
}

.inline_buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: $background-text;
}

.counter {
  margin-right: 5px;
  background-color: $background-text;
}

.inline_button {
  height: 1.4rem;
  margin-right: 5px;
  margin-bottom: 0;
  background-color: #f0f0f0;
  color: #333;
  border: none;
  padding: 2px 10px;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    color: $background-text;
  }
}

.filter {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 10px;
  background-color: $background-text;
}

.label {
  background-color: $background-text;
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
  background: $background-text;
  padding: 24px 32px;
  border-radius: 10px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  min-width: 300px;
  text-align: center;

  &-element {
    margin-bottom: 10px;
    background-color: $background-text;
  }

  &-input {
    width: 100%;
    padding: 10px;
    border: 1px solid $border-color;
    border-radius: 5px;
    background-color: $background-text;
  }

  &-buttons {
    margin-top: 16px;
    display: flex;
    gap: 12px;
    justify-content: center;
    background: $background-text;
  }
}
</style>
