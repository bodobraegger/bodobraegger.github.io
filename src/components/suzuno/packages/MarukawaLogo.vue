<script setup lang="ts">
// The logo line of the MARUKAWA boxes: the mark, 川 (kawa, river) in a circle
// (maru), then the name MARUKAWA in Helvetica Bold. In its own coordinates:
// the baseline at y 0, the mark from x 0, a cap height of CAP_HEIGHT. Place
// it with placeLettering (src/lib/suzuno/packages/lettering.ts).
import type { LetteringFont } from '~/lib/suzuno/packages/lettering'
import { CAP_HEIGHT, fontSizeForCapHeight, useWebFonts } from '~/lib/suzuno/packages/lettering'
import { MARK_RADIUS, MARUKAWA_FONTS, logoNameX } from '~/lib/suzuno/packages/marukawa'

const props = withDefaults(defineProps<{
  name?: string
  color?: string
  /** The space between the mark and the name, in cap heights. */
  gap?: number
  /** The size of the mark relative to the capitals of the export boxes. */
  markScale?: number
  font?: LetteringFont
}>(), {
  name: 'MARUKAWA',
  color: '#2e2a28',
  gap: 0.4,
  markScale: 1,
  font: () => MARUKAWA_FONTS.helveticaBold,
})

useWebFonts(() => [props.font])

const MARK_RING = 0.09 * CAP_HEIGHT
const STROKE = 0.13 * CAP_HEIGHT
// The three strokes of 川, in units of the mark radius: the left one bends outwards
const STROKES = [
  'M-0.4 -0.42 Q-0.36 0.08 -0.5 0.42',
  'M-0.02 -0.3 L-0.02 0.32',
  'M0.36 -0.5 L0.36 0.5',
]
const fontSize = computed(() => fontSizeForCapHeight(CAP_HEIGHT, props.font.metrics))
const nameX = computed(() => logoNameX(props.gap, props.markScale))
</script>

<template>
  <g>
    <!-- The mark is centred on the capitals -->
    <g :transform="`translate(${MARK_RADIUS * markScale} ${-CAP_HEIGHT / 2}) scale(${markScale})`" :stroke="color" fill="none" data-ink="logo">
      <circle :r="MARK_RADIUS - MARK_RING / 2" :stroke-width="MARK_RING" />
      <path
        v-for="stroke in STROKES"
        :key="stroke"
        :d="stroke"
        :transform="`scale(${MARK_RADIUS})`"
        :stroke-width="STROKE / MARK_RADIUS"
        stroke-linecap="round"
      />
    </g>
    <text :x="nameX" :font-family="font.family" :font-weight="font.weight" :font-size="fontSize" :fill="color" data-ink="logo">
      {{ name }}
    </text>
  </g>
</template>
