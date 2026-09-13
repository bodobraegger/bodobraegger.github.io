<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import type { PenEntry } from '../logics/pens'

const props = defineProps<{
  pens: PenEntry[]
  activeId: string | null
  open: boolean
  hint: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'select', id: string): void
  (e: 'putDown'): void
  (e: 'undo'): void
}>()

const settingsOpen = ref(false)
const penRow = ref<HTMLElement>()
const scrollable = ref(false)

const activePen = computed(() => props.pens.find(pen => pen.id === props.activeId) ?? null)

// The row holds one line and scrolls sideways, so the erasers stay pinned next
// to the actions where a thumb always finds them.
const drawingPens = computed(() => props.pens.filter(pen => !pen.eraser))
const eraserPens = computed(() => props.pens.filter(pen => pen.eraser))

// The slider is linear and maps to an exponential width, as on the desktop controls.
const sliderValue = computed({
  get: () => Math.log2(activePen.value?.width || 1),
  set: (value: number) => {
    if (activePen.value)
      activePen.value.width = 2 ** value
  },
})

// The settings dot previews the stroke, but stays inside the button.
const dotSize = computed(() => `${Math.min(Math.max(activePen.value?.width ?? 3, 4), 22)}px`)

watch(() => props.activeId, () => {
  settingsOpen.value = false
  // Keeps the pen in hand in sight when it sits outside the scrolled part.
  nextTick(() => {
    penRow.value?.querySelector('.active')?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  })
})
watch(() => props.open, (open) => {
  if (!open)
    settingsOpen.value = false
})

function select(pen: PenEntry) {
  emit('select', pen.id)
}

/** The edge only fades out while there is something more to scroll to. */
function measure() {
  const row = penRow.value
  scrollable.value = !!row && row.scrollWidth - row.clientWidth > 1
}

watch(() => [props.open, props.pens.length], () => nextTick(measure), { immediate: true })

onMounted(() => {
  nextTick(measure)
  window.addEventListener('resize', measure)
})

onUnmounted(() => window.removeEventListener('resize', measure))
</script>

<template>
  <div class="pen-toolbar font-mono">
    <button
      v-if="!open"
      class="pen-toolbar-fab"
      aria-label="Open drawing tools"
      @click="emit('update:open', true)"
    >
      {{ pens[0]?.emoji ?? '🖉' }}
    </button>

    <template v-else>
      <p v-if="hint" class="pen-toolbar-hint">
        one finger draws · two fingers scroll
      </p>

      <div v-if="settingsOpen && activePen" class="pen-toolbar-settings">
        <input
          v-model.number="sliderValue"
          type="range"
          min="0"
          max="8"
          step="0.1"
          aria-label="Stroke width"
        >
        <span>{{ Math.round(activePen.width) }}px</span>
        <input
          v-if="!activePen.eraser"
          v-model="activePen.color"
          type="color"
          aria-label="Stroke color"
        >
      </div>

      <div class="pen-toolbar-bar">
        <div ref="penRow" class="pen-toolbar-pens" :class="{ scrollable }">
          <button
            v-for="pen in drawingPens"
            :key="pen.id"
            class="pen-toolbar-pen"
            :class="{ active: pen.id === activeId }"
            :aria-pressed="pen.id === activeId"
            :aria-label="pen.eraser ? 'Eraser' : `Pen ${pen.emoji}`"
            @click="select(pen)"
          >
            <span :style="{ color: pen.color }">{{ pen.emoji }}</span>
            <i :style="{ background: pen.eraser ? 'transparent' : pen.color }" />
          </button>
        </div>

        <div class="pen-toolbar-actions">
          <button
            v-for="pen in eraserPens"
            :key="pen.id"
            class="pen-toolbar-pen"
            :class="{ active: pen.id === activeId }"
            :aria-pressed="pen.id === activeId"
            aria-label="Eraser"
            @click="select(pen)"
          >
            <span>{{ pen.emoji }}</span>
            <i />
          </button>

          <button
            v-if="activePen"
            class="pen-toolbar-action"
            aria-label="Stroke settings"
            :aria-expanded="settingsOpen"
            @click="settingsOpen = !settingsOpen"
          >
            <i
              class="pen-toolbar-dot"
              :style="{ width: dotSize, height: dotSize, background: activePen.eraser ? 'transparent' : activePen.color }"
            />
          </button>
          <button class="pen-toolbar-action" aria-label="Undo last stroke" @click="emit('undo')">
            ↶
          </button>
          <button class="pen-toolbar-action" aria-label="Put the pen down" @click="emit('putDown')">
            ✕
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.pen-toolbar {
  position: fixed;
  left: 0.75rem;
  right: 0.75rem;
  /* Clears the chat widget that sits along the bottom edge. */
  bottom: calc(env(safe-area-inset-bottom, 0px) + 2.75rem);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.85rem;
  pointer-events: none;
}

.pen-toolbar > * {
  pointer-events: auto;
}

.pen-toolbar button {
  min-height: 2.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 0;
  color: var(--fg);
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.pen-toolbar-fab,
.pen-toolbar-bar,
.pen-toolbar-settings {
  /* See-through, like the chat bar: the page reads on through the blur. */
  background: color-mix(in srgb, var(--c-bg) 40%, transparent);
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  border: 1px dashed var(--c-border);
  border-radius: 999px;
}

.pen-toolbar-fab {
  min-width: 2.75rem;
  font-size: 1.5rem;
  line-height: 1;
  box-shadow: 0 2px 10px rgb(0 0 0 / 12%);
}

.pen-toolbar-bar {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  max-width: 100%;
  padding: 0 0.35rem;
  box-shadow: 0 2px 10px rgb(0 0 0 / 12%);
}

/* One line, whatever number of pens a page carries: the row scrolls sideways
   and fades out at the edge while there is more to reach. */
.pen-toolbar-pens {
  display: flex;
  flex: 1 1 auto;
  flex-wrap: nowrap;
  align-items: center;
  min-width: 0;
  gap: 0.2rem;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.pen-toolbar-pens::-webkit-scrollbar {
  display: none;
}

.pen-toolbar-pens.scrollable {
  mask-image: linear-gradient(to right, #000 calc(100% - 1.5rem), transparent);
  -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 1.5rem), transparent);
}

/* The eraser and the actions stay out of the scroll, so a thumb always finds
   them in the same place. */
.pen-toolbar-actions {
  display: flex;
  flex: none;
  align-items: center;
  gap: 0.2rem;
  border-left: 1px solid var(--c-border-soft);
  margin-left: 0.2rem;
  padding-left: 0.2rem;
}

.pen-toolbar-pen {
  position: relative;
  flex: none;
  min-width: 2.5rem;
  font-size: 1.4rem;
  line-height: 1;
  opacity: 0.55;
  transition: opacity 0.15s ease;
}

.pen-toolbar-pen.active {
  opacity: 1;
}

.pen-toolbar-pen i {
  position: absolute;
  bottom: 0.35rem;
  width: 1.1rem;
  height: 2px;
  /* The erasers carry no color, so they fall back to the text color. */
  background: var(--fg);
  border-radius: 2px;
  opacity: 0;
}

.pen-toolbar-pen.active i {
  opacity: 1;
}

.pen-toolbar-action {
  flex: none;
  min-width: 2.5rem;
  font-size: 1.1rem;
}

.pen-toolbar-dot {
  display: block;
  border: 1px solid var(--c-border);
  border-radius: 50%;
}

/* The canvas is inverted in the dark theme, so the pens and their color marks
   are inverted with it and keep showing what a stroke looks like. */
html.dark .pen-toolbar-pen span,
html.dark .pen-toolbar-pen i,
html.dark .pen-toolbar-dot {
  filter: invert(1);
}

.pen-toolbar-settings {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  max-width: 100%;
}

.pen-toolbar-settings input[type='range'] {
  flex: 1;
  min-width: 8rem;
}

.pen-toolbar-settings input[type='color'] {
  flex: none;
  width: 2rem;
  height: 2rem;
  padding: 0;
  background: transparent;
  border: 0;
}

.pen-toolbar-hint {
  margin: 0;
  padding: 0.35rem 0.6rem;
  /* Text on text: the hint holds a little more ground than the bar. */
  background: color-mix(in srgb, var(--c-bg) 75%, transparent);
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  border: 1px dashed var(--c-border-soft);
  border-radius: 999px;
  color: var(--fg-muted);
  font-size: 0.75rem;
}
</style>
