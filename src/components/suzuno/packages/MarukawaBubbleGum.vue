<script setup lang="ts">
// The "BUBBLE GUM" lettering of the MARUKAWA boxes: on the export boxes
// "BUBBLE" in a condensed Helvetica Bold and "GUM" larger in the fat Clarendon
// of the flavour, with an optional dark edge; on the domestic boxes フーセン in
// green and ガム in the colour of the flavour, both in brush lettering. In its
// own coordinates: the start of the baseline at the origin, a cap height of
// CAP_HEIGHT for the first word. Place it with placeLettering (src/lib/suzuno/packages/lettering.ts).
import type { LetteringFont } from '~/lib/suzuno/packages/lettering'
import { CAP_HEIGHT, fontSizeForCapHeight, useWebFonts } from '~/lib/suzuno/packages/lettering'
import { MARUKAWA_FONTS, letteringWidth } from '~/lib/suzuno/packages/marukawa'

const props = withDefaults(defineProps<{
  bubble?: string
  gum?: string
  bubbleColor?: string
  gumColor?: string
  bubbleFont?: LetteringFont
  gumFont?: LetteringFont
  /** The colour of the edge of the second word, or null for none. */
  gumOutline?: string | null
  /** The width of the edge, in cap heights of the first word. */
  gumOutlineWidth?: number
  /** The cap height of the second word relative to the first. */
  gumScale?: number
  /** The space before the second word, in cap heights of the first. */
  gumGap?: number
}>(), {
  bubble: 'BUBBLE',
  gum: 'GUM',
  bubbleColor: '#2e2a28',
  gumColor: '#d42630',
  bubbleFont: () => MARUKAWA_FONTS.helveticaBold,
  gumFont: () => MARUKAWA_FONTS.clarendon,
  gumOutline: null,
  gumOutlineWidth: 0.08,
  gumScale: 1.1,
  gumGap: 0.3,
})

useWebFonts(() => [props.bubbleFont, props.gumFont])

const bubbleSize = computed(() => fontSizeForCapHeight(CAP_HEIGHT, props.bubbleFont.metrics))
const gumSize = computed(() => fontSizeForCapHeight(CAP_HEIGHT * props.gumScale, props.gumFont.metrics))
const gumX = computed(() => letteringWidth(props.bubble, props.bubbleFont) + props.gumGap * CAP_HEIGHT)
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
      :stroke-width="gumOutline ? 2 * gumOutlineWidth * CAP_HEIGHT : undefined"
      stroke-linejoin="round"
      paint-order="stroke"
      data-ink="gum"
    >
      {{ gum }}
    </text>
  </g>
</template>
