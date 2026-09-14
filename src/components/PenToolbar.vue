<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import type { PenEntry } from '../logics/pens'
import { usesPenGlyph } from '../logics/pens'
import PenGlyph from './PenGlyph.vue'

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

// The swatch previews the stroke, but stays inside the button.
const swatchSize = computed(() => `${Math.min(Math.max(activePen.value?.width ?? 3, 5), 22)}px`)

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
  // The toolbar takes the corner of the chat, so the chat steps aside while
  // the pens are out (see the iframe rule in styles/main.css).
  document.documentElement.classList.toggle('pens-open', open)
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

onUnmounted(() => {
  window.removeEventListener('resize', measure)
  document.documentElement.classList.remove('pens-open')
})
</script>

<template>
  <div class="pen-toolbar font-mono">
    <button
      v-if="!open"
      class="pen-panel pen-toolbar-fab"
      aria-label="Open drawing tools"
      @click="emit('update:open', true)"
    >
      <PenGlyph v-if="pens[0] && usesPenGlyph(pens[0].emoji)" :style="{ color: pens[0].color }" />
      <template v-else>
        {{ pens[0]?.emoji }}
      </template>
    </button>

    <template v-else>
      <p v-if="hint" class="pen-panel pen-toolbar-hint">
        one finger draws · two fingers scroll
      </p>

      <div v-if="settingsOpen && activePen" class="pen-panel pen-toolbar-settings">
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

      <div class="pen-panel pen-toolbar-bar">
        <div ref="penRow" class="pen-toolbar-pens" :class="{ scrollable }">
          <button
            v-for="pen in drawingPens"
            :key="pen.id"
            class="pen-toolbar-pen"
            :class="{ active: pen.id === activeId }"
            :aria-pressed="pen.id === activeId"
            :aria-label="`Pen ${pen.emoji}`"
            @click="select(pen)"
          >
            <PenGlyph v-if="usesPenGlyph(pen.emoji)" :style="{ color: pen.color }" />
            <template v-else>
              {{ pen.emoji }}
            </template>
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
            {{ pen.emoji }}
          </button>

          <button
            v-if="activePen"
            class="pen-toolbar-action"
            aria-label="Stroke settings"
            :aria-expanded="settingsOpen"
            @click="settingsOpen = !settingsOpen"
          >
            <i
              class="pen-toolbar-swatch"
              :style="{ width: swatchSize, height: swatchSize, background: activePen.eraser ? 'transparent' : activePen.color }"
            />
          </button>
          <button class="pen-toolbar-action" aria-label="Undo last stroke" @click="emit('undo')">
            ↶
          </button>
          <button class="pen-toolbar-action" aria-label="Put the pen down" @click="emit('putDown')">
            <svg class="pen-toolbar-cross" viewBox="0 0 10 10" aria-hidden="true" focusable="false">
              <path d="M1 1 L9 9 M9 1 L1 9" fill="none" stroke="currentColor" stroke-width="1" />
            </svg>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.pen-toolbar {
  position: fixed;
  /* The margins of the chat, to the pixel (see the iframe rule in
     styles/main.css), and a place above it, so the toolbar unfolds over the
     chat instead of behind it. */
  left: 1.75rem;
  right: 1.75rem;
  bottom: calc(1.75rem - 2px);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4rem;
  font-size: 0.85rem;
  pointer-events: none;
}

.pen-toolbar > * {
  pointer-events: auto;
}

/* Same surface as the chat: the page reads on through it. The button rule
   below clears borders, so the panel is named twice to stay ahead of it. */
.pen-toolbar .pen-panel {
  backdrop-filter: blur(2px);
  border: 1px dashed var(--fg);
}

/* Every part of the toolbar stands 21px tall, exactly as the chat does, so the
   buttons take their height from the bar and the line height of the page is
   kept out of it. */
.pen-toolbar button {
  padding: 0;
  line-height: 1;
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

.pen-toolbar-fab {
  height: 21px;
  min-width: 21px;
  font-size: 1.05rem;
}

/* The rows stretch, so the pen in hand is boxed over the full height of the
   bar and its border falls on the border of the bar. */
.pen-toolbar-bar {
  display: flex;
  align-items: stretch;
  height: 21px;
  max-width: 100%;
}

/* One line, whatever number of pens a page carries: the row scrolls sideways
   and fades out at the edge while there is more to reach. */
.pen-toolbar-pens {
  display: flex;
  flex: 1 1 auto;
  align-items: stretch;
  min-width: 0;
  overflow-x: auto;
  overscroll-behavior-x: contain;
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
  align-items: stretch;
  border-left: 1px dashed var(--fg);
}

.pen-toolbar-pen {
  flex: none;
  min-width: 1.7rem;
  font-size: 1.05rem;
  line-height: 1;
  opacity: 0.5;
}

/* The pen in hand is boxed, as the current page is in the navigation. The
   negative margin lays its border over the border of the bar. */
.pen-toolbar-pen.active {
  opacity: 1;
  border: 1px dashed var(--fg);
  margin-block: -1px;
}

.pen-toolbar-action {
  flex: none;
  min-width: 1.6rem;
  font-size: 0.95rem;
}

.pen-toolbar-swatch {
  display: block;
  border: 1px dashed var(--fg);
}

/* A drawn cross on a square box, so the mark that puts the pen down keeps its
   shape on every system instead of taking whatever a font has. */
.pen-toolbar-cross {
  display: block;
  width: 11px;
  height: 11px;
}

/* The canvas is inverted in the dark theme, so the pens are inverted with it
   and keep showing what a stroke looks like. */
html.dark .pen-toolbar-pen > *,
html.dark .pen-toolbar-swatch {
  filter: invert(1);
}

.pen-toolbar-settings {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 21px;
  padding: 0 0.4rem;
  max-width: 100%;
}

.pen-toolbar-settings input[type='range'] {
  flex: 1;
  min-width: 7rem;
  height: 15px;
}

.pen-toolbar-settings input[type='color'] {
  flex: none;
  width: 15px;
  height: 15px;
  padding: 0;
  background: transparent;
  border: 0;
}

.pen-toolbar-hint {
  display: flex;
  align-items: center;
  height: 21px;
  margin: 0;
  padding: 0 0.4rem;
  color: var(--fg-muted);
  font-size: 0.75rem;
}
</style>
