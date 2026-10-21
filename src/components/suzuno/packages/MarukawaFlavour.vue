<script setup lang="ts">
// The flavour lettering of the MARUKAWA boxes ("melon", "Strawberry",
// "orange" in a fat Clarendon), with an optional dark edge and an optional
// box behind it, like the yellow box of "melon". In its own coordinates: the
// middle of the baseline at the origin, a cap height of CAP_HEIGHT. Place it
// with placeLettering (src/lib/suzuno/packages/lettering.ts).
import type { LetteringFont } from '~/lib/suzuno/packages/lettering'
import { CAP_HEIGHT, fontSizeForCapHeight, useWebFonts } from '~/lib/suzuno/packages/lettering'
import { MARUKAWA_FONTS, letteringWidth } from '~/lib/suzuno/packages/marukawa'

const props = withDefaults(defineProps<{
  text: string
  color: string
  font?: LetteringFont
  /** The colour of the dark edge, or null for none. */
  outline?: string | null
  /** The width of the edge, in cap heights. */
  outlineWidth?: number
  /** The colour of the box behind the letters, or null for none. */
  highlight?: string | null
  /** The margins of the box around the letters, in cap heights: sides, top, bottom. */
  highlightMargins?: [number, number, number]
  /** Longer words are narrowed to this width, in cap heights. */
  maxWidth?: number
}>(), {
  font: () => MARUKAWA_FONTS.clarendon,
  outline: null,
  outlineWidth: 0.07,
  highlight: null,
  highlightMargins: () => [0.18, 0.3, 0.26],
  maxWidth: Number.POSITIVE_INFINITY,
})

useWebFonts(() => [props.font])

const fontSize = computed(() => fontSizeForCapHeight(CAP_HEIGHT, props.font.metrics))
const naturalWidth = computed(() => letteringWidth(props.text, props.font))
const narrowing = computed(() => Math.min(1, props.maxWidth * CAP_HEIGHT / naturalWidth.value))
const width = computed(() => naturalWidth.value * narrowing.value)
const box = computed(() => {
  const [side, top, bottom] = props.highlightMargins.map(margin => margin * CAP_HEIGHT)
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
      :stroke-width="outline ? 2 * outlineWidth * CAP_HEIGHT : undefined"
      stroke-linejoin="round"
      paint-order="stroke"
      data-ink="flavour"
    >
      {{ text }}
    </text>
  </g>
</template>
