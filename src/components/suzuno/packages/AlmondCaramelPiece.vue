<script setup lang="ts">
// A side of the wrapped Almond Caramel as one SVG in the pixel space of its
// face (front 184 x 122, back 104 x 99). The caramel lies in an inner paper
// with a brown grid, in a printed film with clear parts. The front shows
// "ALMOND" and the spaced C-A-R-A-M-E-L over a clear oval; the back shows
// columns of small print in a frame beside a clear part. The faces of the
// photo show only the middle of the wrapper, without its twisted ends.
import { useId } from 'vue'
import type { AlmondCaramelPieceTexts, AlmondCaramelSide } from '~/lib/suzuno/packages/almond-caramel'
import { ALMOND_CARAMEL_FONTS, ALMOND_CARAMEL_PIECE, ALMOND_CARAMEL_PIECE_DESIGNS, blockLines, textAttributes } from '~/lib/suzuno/packages/almond-caramel'
import { useWebFonts } from '~/lib/suzuno/packages/lettering'

const props = defineProps<{
  side: AlmondCaramelSide
  texts: AlmondCaramelPieceTexts
}>()

const fonts = ALMOND_CARAMEL_FONTS
useWebFonts(fonts.condensed, fonts.extended, fonts.serif, fonts.gothic)

const size = computed(() => ALMOND_CARAMEL_PIECE[props.side])
const colors = computed(() => ALMOND_CARAMEL_PIECE_DESIGNS[props.side].colors)
const front = ALMOND_CARAMEL_PIECE_DESIGNS.front.layout
const back = ALMOND_CARAMEL_PIECE_DESIGNS.back.layout
const grid = computed(() => (props.side === 'front' ? front.grid : back.grid))

const id = useId()
const ids = { title: `${id}-title`, grid: `${id}-grid` }
const paperFill = `url(#${ids.grid})`

const lines = computed(() => blockLines(front.lines, props.texts.lines.length))
const spacedLetters = computed(() => {
  const { x, pitch } = front.spaced
  return [...props.texts.spaced].map((letter, index) => ({ letter, x: x + index * pitch }))
})
const spacedDots = computed(() => {
  const { x, y, pitch, size: capHeight } = front.spaced
  return spacedLetters.value.slice(1).map((_, index) => ({ cx: x + (index + 0.5) * pitch, cy: y - capHeight / 2 }))
})
const columns = computed(() => {
  const { x, y, pitch } = back.columns
  return props.texts.columns.map((text, index) => ({ text, x: x - index * pitch, y }))
})
</script>

<template>
  <svg class="block h-auto w-full" :viewBox="`0 0 ${size.width} ${size.height}`" role="img" :aria-labelledby="ids.title">
    <title :id="ids.title">{{ texts.name }} {{ texts.spaced }} wrapper, {{ side }}</title>
    <defs>
      <!-- The inner paper with its grid, which shows through the clear parts -->
      <pattern :id="ids.grid" patternUnits="userSpaceOnUse" :x="grid.x" :y="grid.y" :width="grid.cell" :height="grid.cell">
        <rect :width="grid.cell" :height="grid.cell" :fill="colors.window" />
        <path :d="`M0 0H${grid.cell}M0 0V${grid.cell}`" :stroke="colors.grid" :stroke-width="grid.line" fill="none" />
      </pattern>
    </defs>
    <rect :width="size.width" :height="size.height" :fill="colors.film" />

    <g v-if="side === 'front'" :fill="colors.ink">
      <ellipse
        :cx="front.window.x"
        :cy="front.window.y"
        :rx="front.window.rx"
        :ry="front.window.ry"
        :fill="paperFill"
        :stroke="colors.ink"
        :stroke-width="front.window.outline"
      />
      <text v-bind="textAttributes(front.name, fonts.condensed)" text-anchor="middle">
        {{ texts.name }}
      </text>
      <g text-anchor="middle">
        <text v-for="(item, index) in spacedLetters" :key="index" v-bind="textAttributes({ ...front.spaced, x: item.x }, fonts.extended)">
          {{ item.letter }}
        </text>
        <circle v-for="dot in spacedDots" :key="dot.cx" v-bind="dot" :r="front.spaced.dot" />
      </g>
      <text v-for="(line, index) in texts.lines" :key="line" v-bind="textAttributes(lines[index], fonts.serif)" text-anchor="middle">
        {{ line }}
      </text>
    </g>

    <g v-else :fill="colors.ink">
      <rect v-bind="back.window" :fill="paperFill" />
      <rect
        :x="back.frame.x"
        :y="back.frame.y"
        :width="back.frame.width"
        :height="back.frame.height"
        fill="none"
        :stroke="colors.ink"
        :stroke-width="back.frame.stroke"
      />
      <text
        v-for="column in columns"
        :key="column.text"
        :x="column.x"
        :y="column.y"
        style="writing-mode: vertical-rl"
        :font-family="fonts.gothic.family"
        :font-size="back.columns.size"
      >
        {{ column.text }}
      </text>
    </g>
  </svg>
</template>
