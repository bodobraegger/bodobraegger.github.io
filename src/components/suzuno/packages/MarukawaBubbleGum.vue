<script setup lang="ts">
// The "BUBBLE GUM" lettering of the MARUKAWA boxes: "BUBBLE" in a condensed
// Helvetica Bold and "GUM" larger in the fat Clarendon of the flavour, with an
// optional dark edge. In its own coordinates: the start of the baseline at
// the origin, a cap height of CAP_HEIGHT for the first word. Place it with
// placeLettering (src/lib/suzuno/packages/marukawa.ts).
import { useWebFonts } from '~/lib/suzuno/packages/lettering'
import { CAP_HEIGHT, MARUKAWA_FONTS, fontSizeForCapHeight, letteringWidth } from '~/lib/suzuno/packages/marukawa'

const props = defineProps<{
  bubble: string
  gum: string
  bubbleColor: string
  gumColor: string
  /** The colour of the edge of the second word, or null for none. */
  gumOutline: string | null
  /** The cap height of the second word relative to the first. */
  gumScale: number
  /** The space before the second word, in cap heights of the first. */
  gumGap: number
}>()

const { helveticaBold: bubbleFont, clarendon: gumFont } = MARUKAWA_FONTS
useWebFonts(bubbleFont, gumFont)

// The width of the edge of the second word, in cap heights of the first
const GUM_OUTLINE_WIDTH = 0.08

const bubbleSize = fontSizeForCapHeight(CAP_HEIGHT, bubbleFont.metrics)
const gumSize = computed(() => fontSizeForCapHeight(CAP_HEIGHT * props.gumScale, gumFont.metrics))
const gumX = computed(() => letteringWidth(props.bubble, bubbleFont) + props.gumGap * CAP_HEIGHT)
</script>

<template>
  <g>
    <text :font-family="bubbleFont.family" :font-weight="bubbleFont.weight" :font-size="bubbleSize" :fill="bubbleColor" data-ink="bubble">
      {{ bubble }}
    </text>
    <text
      :x="gumX"
      :font-family="gumFont.family"
      :font-weight="gumFont.weight"
      :font-size="gumSize"
      :fill="gumColor"
      :stroke="gumOutline ?? undefined"
      :stroke-width="gumOutline ? 2 * GUM_OUTLINE_WIDTH * CAP_HEIGHT : undefined"
      stroke-linejoin="round"
      paint-order="stroke"
      data-ink="gum"
    >
      {{ gum }}
    </text>
  </g>
</template>
