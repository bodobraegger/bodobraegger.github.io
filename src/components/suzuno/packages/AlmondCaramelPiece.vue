<script setup lang="ts">
// A side of the wrapped Almond Caramel as one SVG in the pixel space of its
// face (front 184 x 122, back 104 x 99). The caramel lies in an inner paper
// with a brown grid, in a printed film with clear parts. The front shows
// "ALMOND" and the spaced C-A-R-A-M-E-L over a clear oval; the back shows
// columns of small print in a frame beside a clear part. The faces of the
// photo show only the middle of the wrapper, without its twisted ends. The
// grid comes from src/lib/suzuno/patterns/grid.ts, and `pattern` replaces it with
// other layers of patterns.
import { useId } from 'vue'
import PatternFill from '~/components/suzuno/PatternFill.vue'
import type { AlmondCaramelPieceColors, AlmondCaramelPieceLayout, AlmondCaramelPieceTexts, AlmondCaramelSide } from '~/lib/suzuno/packages/almond-caramel'
import { ALMOND_CARAMEL_FONTS, ALMOND_CARAMEL_PIECE, ALMOND_CARAMEL_PIECE_DESIGNS, ALMOND_CARAMEL_PIECE_TEXTS, blockLines, textAttributes } from '~/lib/suzuno/packages/almond-caramel'
import { useWebFonts } from '~/lib/suzuno/packages/lettering'
import type { PatternFillValue } from '~/lib/suzuno/patterns'
import { GRID } from '~/lib/suzuno/patterns/grid'
import { patternElement } from '~/lib/suzuno/patterns/pattern'

const props = withDefaults(defineProps<{
  side?: AlmondCaramelSide
  texts?: Partial<AlmondCaramelPieceTexts>
  colors?: Partial<AlmondCaramelPieceColors>
  /** The places of the parts of both sides; by default the fitted layout. */
  layout?: Partial<AlmondCaramelPieceLayout>
  /** The inner paper in the clear parts; by default its grid. */
  pattern?: PatternFillValue
  viewBox?: string
}>(), {
  side: 'front',
})

const fonts = ALMOND_CARAMEL_FONTS
useWebFonts(() => [fonts.condensed, fonts.extended, fonts.serif, fonts.gothic])

const size = computed(() => ALMOND_CARAMEL_PIECE[props.side])
const design = computed(() => ALMOND_CARAMEL_PIECE_DESIGNS[props.side])
const colors = computed(() => ({ ...design.value.colors, ...props.colors }))
const texts = computed(() => ({ ...ALMOND_CARAMEL_PIECE_TEXTS, ...props.texts }))
const front = computed(() => props.layout?.front ?? ALMOND_CARAMEL_PIECE_DESIGNS.front.layout)
const back = computed(() => props.layout?.back ?? ALMOND_CARAMEL_PIECE_DESIGNS.back.layout)
const grid = computed(() => (props.side === 'front' ? front.value.grid : back.value.grid))

const id = useId()
const ids = { title: `${id}-title`, grid: `${id}-grid`, paper: `${id}-paper` }
const gridDefinition = computed(() => patternElement(ids.grid, GRID.tile(0, { ...grid.value, paper: colors.value.window, color: colors.value.grid })))
const paperFill = computed(() => `url(#${props.pattern ? ids.paper : ids.grid})`)

const lines = computed(() => blockLines(front.value.lines, texts.value.lines.length))
const spacedLetters = computed(() => {
  const { x, pitch } = front.value.spaced
  return [...texts.value.spaced].map((letter, index) => ({ letter, x: x + index * pitch }))
})
const spacedDots = computed(() => {
  const { x, y, pitch, size: capHeight } = front.value.spaced
  return spacedLetters.value.slice(1).map((_, index) => ({ cx: x + (index + 0.5) * pitch, cy: y - capHeight / 2 }))
})
const columns = computed(() => {
  const { x, y, pitch } = back.value.columns
  return texts.value.columns.map((text, index) => ({ text, x: x - index * pitch, y }))
})
</script>

<template>
  <svg class="block h-auto w-full" :viewBox="viewBox ?? `0 0 ${size.width} ${size.height}`" role="img" :aria-labelledby="ids.title">
    <title :id="ids.title">{{ texts.name }} {{ texts.spaced }} wrapper, {{ side }}</title>
    <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -- SVG <defs>, not a component -->
    <defs v-html="gridDefinition" />
    <pattern v-if="pattern" :id="ids.paper" patternUnits="userSpaceOnUse" :width="size.width" :height="size.height">
      <PatternFill inline :pattern="pattern" :box="{ x: 0, y: 0, ...size }" />
    </pattern>
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
        data-part="window"
      />
      <text v-bind="textAttributes(front.name, fonts.condensed)" text-anchor="middle" data-part="name">
        {{ texts.name }}
      </text>
      <g data-part="spaced" text-anchor="middle">
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
      <rect v-bind="back.window" :fill="paperFill" data-part="window" />
      <rect
        :x="back.frame.x"
        :y="back.frame.y"
        :width="back.frame.width"
        :height="back.frame.height"
        fill="none"
        :stroke="colors.ink"
        :stroke-width="back.frame.stroke"
        data-part="frame"
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
