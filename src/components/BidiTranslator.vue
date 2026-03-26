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
const copiedLeft = ref(false)
const copiedRight = ref(false)
const panelLeft = ref<HTMLElement | null>(null)
const panelRight = ref<HTMLElement | null>(null)

let debounceTimer: NodeJS.Timeout | null = null

function setClickPosition(event: MouseEvent, panel: HTMLElement | null) {
  if (!panel)
    return

  const rect = panel.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  panel.style.setProperty('--click-x', `${x}px`)
  panel.style.setProperty('--click-y', `${y}px`)
}

async function copyToClipboard(text: string, side: 'left' | 'right', event?: MouseEvent) {
  if (!text.trim())
    return

  // Set click position for ripple effect
  if (event) {
    const panel = side === 'left' ? panelLeft.value : panelRight.value
    setClickPosition(event, panel)
  }

  try {
    await navigator.clipboard.writeText(text)
    if (side === 'left')
      copiedLeft.value = true
    else
      copiedRight.value = true

    setTimeout(() => {
      if (side === 'left')
        copiedLeft.value = false
      else
        copiedRight.value = false
    }, 1500)
  }
  catch (error) {
    console.error('Failed to copy:', error)
  }
}

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
        <span class="bidi-indicator" aria-label="Bidirectional translation">
          ↔
        </span>
        <select id="selectl2" v-model="langRight" class="lang-select" @change="preventAutoDetectRight">
          <option v-for="lang in languages.filter(l => l.code !== 'auto')" :key="lang.code" :value="lang.code">
            {{ lang.name }}
          </option>
        </select>
      </div>

      <div class="text-panels">
        <div ref="panelLeft" class="text-panel" :class="{ copied: copiedLeft }" @dblclick="copyToClipboard(textLeft, 'left', $event)">
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
              class="copy-btn"
              :aria-label="copiedLeft ? 'Copied!' : 'Copy to clipboard'"
              title="copy to clipboard"
              @click.stop="copyToClipboard(textLeft, 'left', $event)"
            >
              {{ copiedLeft ? 'copied' : '⎘' }}
            </button>
          </div>
        </div>
        <div ref="panelRight" class="text-panel" :class="{ copied: copiedRight }" @dblclick="copyToClipboard(textRight, 'right', $event)">
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
              class="copy-btn"
              :aria-label="copiedRight ? 'Copied!' : 'Copy to clipboard'"
              title="Copy to clipboard"
              @click.stop="copyToClipboard(textRight, 'right', $event)"
            >
              {{ copiedRight ? 'copied' : '⎘' }}
            </button>
          </div>
        </div>
      </div>
      <!-- Powered by MyMemory Translation API -->
    </div>
  </div>
</template>

<style scoped>
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
  content: 'write or paste to translate, double-click border to copy';
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
  cursor: pointer;
  overflow: hidden;
}

.text-panel.copied::before {
  content: '';
  position: absolute;
  top: var(--click-y, 50%);
  left: var(--click-x, 50%);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--fg-deep) 0%, transparent 70%);
  transform: translate(-50%, -50%) scale(0);
  animation: ripple 0.5s ease-out;
  pointer-events: none;
  opacity: 0.3;
}

@keyframes ripple {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}

.text-input {
  width: 100%;
  min-height: 350px;
  padding: 0.75rem 0.75rem 1rem;
  background: transparent;
  border: 1px dashed var(--fg-deep);
  opacity: 0.7;
  line-height: 1.4;
  resize: none;
  overflow-y: auto;
  field-sizing: content;
}

.text-input:hover,
.text-input:focus {
  opacity: 1;
  border-color: var(--fg-deeper);
  outline: none;
}

.panel-footer {
  position: absolute;
  bottom: 0.5rem;
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

.copy-btn {
  opacity: 0.7;
  cursor: pointer;
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
}
</style>
