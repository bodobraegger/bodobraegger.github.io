<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

const MAX_CHARS = 500
const DEBOUNCE_DELAY = 500
const COPIED_FEEDBACK_MS = 1500

const languages = [
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
const lastTypedField = ref<'left' | 'right' | null>(null)
const clipboardLeft = useClipboard({ copiedDuring: COPIED_FEEDBACK_MS })
const clipboardRight = useClipboard({ copiedDuring: COPIED_FEEDBACK_MS })

async function translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
  if (!text.trim())
    return ''

  // Limit text length
  const limitedText = text.length > MAX_CHARS ? text.substring(0, MAX_CHARS) : text

  try {
    // Adding email parameter increases rate limit from 1000 to 10000 words/day
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(limitedText)}&langpair=${sourceLang}|${targetLang}&de=contact@bbo.do`
    const response = await fetch(url)
    const data = await response.json()

    if (data.responseStatus === 200 && data.responseData)
      return data.responseData.translatedText

    if (data.responseData?.translatedText)
      return data.responseData.translatedText
    throw new Error(`Translation API error: ${data.responseStatus} - ${data.responseDetails || 'No details'}`)
  }
  catch (error) {
    console.error('Translation failed:', error)
    return String(error)
  }
}

const translateLater = useDebounceFn(async (text: string, source: string, target: string, sourceField: 'left' | 'right') => {
  if (isTranslating.value)
    return
  isTranslating.value = true

  const translatedText = await translate(text, source, target)

  if (sourceField === 'left')
    textRight.value = translatedText
  else
    textLeft.value = translatedText

  isTranslating.value = false
}, DEBOUNCE_DELAY)

function handleTranslation(source: string, target: string, sourceField: 'left' | 'right') {
  const text = sourceField === 'left' ? textLeft.value : textRight.value

  if (!text.trim()) {
    if (sourceField === 'left')
      textRight.value = ''
    else
      textLeft.value = ''
    return
  }

  // Same language on both sides: just copy the text over
  if (source === target) {
    if (sourceField === 'left')
      textRight.value = text
    else
      textLeft.value = text
    return
  }

  translateLater(text, source, target, sourceField)
}

function handleLeftInput() {
  lastTypedField.value = 'left'
  handleTranslation(langLeft.value, langRight.value, 'left')
}

function handleRightInput() {
  lastTypedField.value = 'right'
  handleTranslation(langRight.value, langLeft.value, 'right')
}

function clearLeft() {
  textLeft.value = ''
}

function clearRight() {
  textRight.value = ''
}

// Watch for language changes
watch(langLeft, () => {
  // When left language changes, translate FROM right TO left (left is the target)
  if (textRight.value.trim()) {
    handleRightInput()
  }
})

watch(langRight, () => {
  // When right language changes, translate FROM left TO right (right is the target)
  if (textLeft.value.trim()) {
    handleLeftInput()
  }
})

// Ctrl+C with nothing selected copies the translation, which sits opposite
// the side last typed in
function handleKeyDown(event: KeyboardEvent) {
  if (!(event.ctrlKey || event.metaKey) || event.key !== 'c')
    return
  if (window.getSelection()?.toString())
    return

  const translationIsLeft = lastTypedField.value === 'right'
  const text = translationIsLeft ? textLeft.value : textRight.value
  if (!text.trim())
    return

  event.preventDefault()
  ;(translationIsLeft ? clipboardLeft : clipboardRight).copy(text)
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
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
        <span class="bidi-indicator" aria-label="Bidirectional translation">
          ↔
        </span>
        <select id="selectl2" v-model="langRight" class="lang-select">
          <option v-for="lang in languages" :key="lang.code" :value="lang.code">
            {{ lang.name }}
          </option>
        </select>
      </div>

      <div class="text-panels">
        <div class="text-panel" :class="{ copied: clipboardLeft.copied.value }">
          <button
            v-if="textLeft"
            class="clear-btn"
            title="Clear all"
            @click.stop="clearLeft"
          >
            ×
          </button>
          <textarea
            v-model="textLeft"
            class="text-input"
            placeholder="texto ou tradução..."
            @input="handleLeftInput"
            @click.stop
          />
          <div class="panel-footer">
            <div class="char-count" :class="{ 'at-limit': textLeft.length >= MAX_CHARS }">
              {{ textLeft.length }} / {{ MAX_CHARS }}
            </div>
            <button
              v-if="textLeft"
              class="copy-btn"
              :aria-label="clipboardLeft.copied.value ? 'Copied!' : 'Copy to clipboard'"
              title="copy to clipboard"
              @click.stop="clipboardLeft.copy(textLeft)"
            >
              {{ clipboardLeft.copied.value ? 'copied' : '⎘' }}
            </button>
          </div>
        </div>
        <div class="text-panel" :class="{ copied: clipboardRight.copied.value }">
          <button
            v-if="textRight"
            class="clear-btn"
            title="Clear all"
            @click.stop="clearRight"
          >
            ×
          </button>
          <textarea
            v-model="textRight"
            class="text-input"
            placeholder="text or translation..."
            @input="handleRightInput"
            @click.stop
          />
          <div class="panel-footer">
            <div class="char-count" :class="{ 'at-limit': textRight.length >= MAX_CHARS }">
              {{ textRight.length }} / {{ MAX_CHARS }}
            </div>
            <button
              v-if="textRight"
              class="copy-btn"
              :aria-label="clipboardRight.copied.value ? 'Copied!' : 'Copy to clipboard'"
              title="Copy to clipboard"
              @click.stop="clipboardRight.copy(textRight)"
            >
              {{ clipboardRight.copied.value ? 'copied' : '⎘' }}
            </button>
          </div>
        </div>
      </div>
      <!-- Powered by MyMemory Translation API -->
    </div>
  </div>
</template>

<style>
.bidi-translator * {
  color: var(--fg);
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
  opacity: 0.7;
  cursor: pointer;
  background: transparent;
}

.lang-select:hover,
.lang-select:focus {
  opacity: 1;
  border-color: var(--fg-deeper);
  outline: none;
}

.lang-select option {
  background: var(--c-bg);
  color: var(--fg);
}

.bidi-indicator {
  display: flex;
  align-items: center;
  opacity: 0.5;
  font-size: 1.5rem;
  user-select: none;
  pointer-events: none;
}

.text-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  position: relative;
}

.text-panels::after {
  content: 'write or paste to translate, ctrl+c to copy translation';
  position: absolute;
  bottom: -1.5rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  white-space: nowrap;
}

.text-panels:has(.text-panel:hover)::after {
  opacity: 0.5;
}

.text-panel {
  position: relative;
  overflow: hidden;
}

.text-panel.copied .text-input {
  border-style: solid;
  transition: border-style 0s;
}

.text-input {
  width: 100%;
  min-height: 350px;
  padding: 0.75rem 0.75rem 1rem;
  background: transparent;
  border: 1px dashed var(--fg-deep);
  border-radius: 0;
  opacity: 0.7;
  line-height: 1.4;
  resize: none;
  overflow-y: auto;
  field-sizing: content;
  transition: border-style 0.2s;
}

.text-input:hover,
.text-input:focus {
  opacity: 1;
  border-color: var(--fg-deeper);
  outline: none;
}

.panel-footer {
  position: absolute;
  bottom: 0.75rem;
  left: 0.75rem;
  right: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  opacity: 0.3;
  pointer-events: none;
}

.char-count.at-limit {
  color: red;
  opacity: 1;
}

.clear-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  opacity: 0.5;
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
  padding: 0.25rem 0.5rem;
  transition: opacity 0.2s;
  z-index: 1;
  mix-blend-mode: difference;
}

.clear-btn:hover {
  opacity: 1;
}

.copy-btn {
  opacity: 0.7;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}

.copy-btn:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .text-panels {
    grid-template-columns: 1fr;
  }

  .text-input {
    min-height: 20vh;
  }

  /* Hide chat on mobile */
  .chat-widget,
  footer {
    display: none !important;
  }
}
</style>
