<script setup lang="ts">
// The flavour lettering of the MARUKAWA boxes ("melon", "Strawberry",
// "orange" in a fat Clarendon), with an optional dark edge and an optional
// box behind it, like the yellow box of "melon". In its own coordinates: the
// middle of the baseline at the origin, a cap height of CAP_HEIGHT. Place it
// with placeLettering (src/lib/suzuno/packages/marukawa.ts).
import { useWebFonts } from '~/lib/suzuno/packages/lettering'
import { CAP_HEIGHT, MARUKAWA_FONTS, fontSizeForCapHeight, letteringWidth } from '~/lib/suzuno/packages/marukawa'

const props = defineProps<{
  text: string
  color: string
  /** The colour of the dark edge, or null for none. */
  outline: string | null
  /** The colour of the box behind the letters, or null for none. */
  highlight: string | null
  /** Longer words are narrowed to this width, in cap heights. */
  maxWidth: number
}>()

const font = MARUKAWA_FONTS.clarendon
useWebFonts(font)

// The width of the edge, and the margins of the box around the letters (sides, top, bottom), in cap heights
const OUTLINE_WIDTH = 0.07
const HIGHLIGHT_MARGINS = [0.18, 0.3, 0.26]

const fontSize = fontSizeForCapHeight(CAP_HEIGHT, font.metrics)
const naturalWidth = computed(() => letteringWidth(props.text, font))
const narrowing = computed(() => Math.min(1, props.maxWidth * CAP_HEIGHT / naturalWidth.value))
const width = computed(() => naturalWidth.value * narrowing.value)
const box = computed(() => {
  const [side, top, bottom] = HIGHLIGHT_MARGINS.map(margin => margin * CAP_HEIGHT)
  return { x: -width.value / 2 - side, y: -CAP_HEIGHT - top, width: width.value + 2 * side, height: CAP_HEIGHT + top + bottom }
})
</script>

<template>
  <g>
    <rect v-if="highlight" v-bind="box" :fill="highlight" data-ink="highlight" />
    <text
      :transform="`scale(${narrowing} 1)`"
      text-anchor="middle"
      :font-family="font.family"
      :font-weight="font.weight"
      :font-size="fontSize"
      :fill="color"
      :stroke="outline ?? undefined"
      :stroke-width="outline ? 2 * OUTLINE_WIDTH * CAP_HEIGHT : undefined"
      stroke-linejoin="round"
      paint-order="stroke"
      data-ink="flavour"
    >
      {{ text }}
    </text>
  </g>
</template>
