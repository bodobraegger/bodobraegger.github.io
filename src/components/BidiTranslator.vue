<script setup lang="ts">
import { ref, watch } from 'vue'

const MAX_CHARS = 500
const DEBOUNCE_DELAY = 500

const languages = [
  { code: 'auto', name: 'Detect Language' },
  { code: 'en', name: 'English' },
  { code: 'pt-BR', name: 'Portuguese (Brazilian)' },
  { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' },
  { code: 'it', name: 'Italian' },
  { code: 'no', name: 'Norwegian' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ar', name: 'Arabic' },
]

const langLeft = ref('pt-BR')
const langRight = ref('en')
const textLeft = ref('')
const textRight = ref('')
const isTranslating = ref(false)
const lastActiveField = ref<'left' | 'right'>('left')

let debounceTimer: NodeJS.Timeout | null = null

async function translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
  if (!text.trim())
    return ''

  // Limit text length
  const limitedText = text.length > MAX_CHARS ? text.substring(0, MAX_CHARS) : text

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(limitedText)}&langpair=${sourceLang}|${targetLang}`
    const response = await fetch(url)
    const data = await response.json()

    if (data.responseStatus === 200 && data.responseData)
      return data.responseData.translatedText

    else
      console.error('Translation error:', data)

    return text
  }
  catch (error) {
    console.error('Translation failed:', error)
    return text
  }
}

function handleTranslation(source: string, target: string, sourceField: 'left' | 'right') {
  if (debounceTimer)
    clearTimeout(debounceTimer)

  lastActiveField.value = sourceField

  const text = sourceField === 'left' ? textLeft.value : textRight.value

  if (!text.trim()) {
    if (sourceField === 'left')
      textRight.value = ''
    else
      textLeft.value = ''
    return
  }

  debounceTimer = setTimeout(async () => {
    if (isTranslating.value)
      return
    isTranslating.value = true

    const sourceLangValue = source === 'auto' ? 'auto' : source
    const translatedText = await translate(text, sourceLangValue, target)

    if (sourceField === 'left')
      textRight.value = translatedText
    else
      textLeft.value = translatedText

    isTranslating.value = false
  }, DEBOUNCE_DELAY)
}

function handleLeftInput() {
  handleTranslation(langLeft.value, langRight.value, 'left')
}

function handleRightInput() {
  handleTranslation(langRight.value, langLeft.value, 'right')
}

function swapLanguages() {
  // Swap language selections
  const tempLang = langLeft.value
  langLeft.value = langRight.value === 'auto' ? 'en' : langRight.value
  langRight.value = tempLang === 'auto' ? 'en' : tempLang

  // Swap text contents
  const tempText = textLeft.value
  textLeft.value = textRight.value
  textRight.value = tempText

  // If there was text, trigger translation
  if (textLeft.value.trim())
    handleLeftInput()
}

function preventAutoDetectRight() {
  if (langRight.value === 'auto')
    langRight.value = 'en'
}

// Watch for language changes
watch(langLeft, () => {
  if (textLeft.value.trim())
    handleLeftInput()
})

watch(langRight, () => {
  if (textRight.value.trim())
    handleRightInput()
})
</script>

<template>
  <div class="bidi-translator">
    <div class="translator-container">
      <div class="language-selector">
        <select id="selectl1" v-model="langLeft" class="lang-select">
          <option v-for="lang in languages" :key="lang.code" :value="lang.code">
            {{ lang.name }}
          </option>
        </select>
        <button class="swap-btn" aria-label="Swap languages" @click="swapLanguages">
          ⇄
        </button>
        <select id="selectl2" v-model="langRight" class="lang-select" @change="preventAutoDetectRight">
          <option v-for="lang in languages.filter(l => l.code !== 'auto')" :key="lang.code" :value="lang.code">
            {{ lang.name }}
          </option>
        </select>
      </div>

      <div class="text-panels">
        <div class="text-panel">
          <textarea
            v-model="textLeft"
            class="text-input"
            placeholder="Enter text to translate..."
            @input="handleLeftInput"
          />
          <div class="char-count" :class="{ 'at-limit': textLeft.length >= MAX_CHARS }">
            {{ textLeft.length }} / {{ MAX_CHARS }}
          </div>
        </div>
        <div class="text-panel">
          <textarea
            v-model="textRight"
            class="text-input"
            placeholder="Translation appears here..."
            @input="handleRightInput"
          />
          <div class="char-count" :class="{ 'at-limit': textRight.length >= MAX_CHARS }">
            {{ textRight.length }} / {{ MAX_CHARS }}
          </div>
        </div>
      </div>
      <!-- Powered by MyMemory Translation API -->
    </div>
  </div>
</template>

<style scoped>
.bidi-translator,
.bidi-translator * {
  color: var(--fg);
  background: transparent;
}

*:active {
  outline: none;
}

.language-selector {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.lang-select {
  flex: 1;
  min-width: 0;
  border: 1px dashed var(--fg-deep);
  border-radius: 0;
  padding: 0 2px;
  opacity: 0.7;
  cursor: pointer;
}

.lang-select:hover {
  opacity: 1;
  border: 1px solid var(--fg-deeper);
}

.lang-select:focus,
.lang-select:active {
  opacity: 1;
  border: 1px solid var(--fg-deeper);
  outline: none;
}

.lang-select option {
  /* needs to be explicitly set, not overwritten by parent * selector. */
  background: var(--c-bg);
  color: var(--fg);
}

.swap-btn {
  border: none;
  background: none;
  opacity: 0.7;
  cursor: pointer;
}

.swap-btn:hover {
  opacity: 1;
}

.text-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.text-panel {
  position: relative;
}

.text-input {
  width: 100%;
  min-height: 250px;
  padding-bottom: 2rem;
  background: transparent;
  border: 1px dashed var(--fg-deep);
  border-radius: 0;
  padding: 0.75rem;
  padding-bottom: 2rem;
  resize: vertical;
  opacity: 0.7;
}

.text-input:hover,
.text-input:focus {
  opacity: 1;
  border: 1px solid var(--fg-deeper);
  outline: none;
}

.char-count {
  position: absolute;
  bottom: 0.5rem;
  right: 0.75rem;
  font-size: 0.7rem;
  opacity: 0.4;
  pointer-events: none;
}

.char-count.at-limit {
  color: red;
  opacity: 1;
}

@media (max-width: 768px) {
  .text-panels {
    grid-template-columns: 1fr;
  }
}
</style>
