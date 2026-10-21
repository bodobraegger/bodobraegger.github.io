<script setup lang="ts">
// The Japanese identification mark for recycling (識別表示マーク), such as
// プラ for plastic packaging: a loop of an arrow round the material name.
// It fills the box x, y, width, height of its parent.
import type { Box } from '~/lib/suzuno/packages/almond-caramel'
import { ALMOND_CARAMEL_FONTS } from '~/lib/suzuno/packages/almond-caramel'
import { useWebFonts } from '~/lib/suzuno/packages/lettering'

withDefaults(defineProps<{
  box: Box
  color: string
  material?: string
}>(), {
  material: 'プラ',
})

const font = ALMOND_CARAMEL_FONTS.gothicBold
useWebFonts(() => [font])

// The mark in a box of 100 x 86: the loop runs clockwise from the arrowhead
// at the top right round to a gap before it
const SIZE = { width: 100, height: 86 }
const LOOP = 'M70 9H22C14 9 9 14 9 22V64C9 72 14 77 22 77H78C86 77 91 72 91 64V36'
const ARROW = 'M64 0L80 9L64 18Z'
const STROKE = 9
</script>

<template>
  <g :transform="`translate(${box.x} ${box.y}) scale(${box.width / SIZE.width} ${box.height / SIZE.height})`" :fill="color">
    <path :d="LOOP" fill="none" :stroke="color" :stroke-width="STROKE" stroke-linecap="round" />
    <path :d="ARROW" />
    <text
      :x="SIZE.width / 2"
      :y="SIZE.height / 2 + 2"
      text-anchor="middle"
      dominant-baseline="central"
      :font-family="font.family"
      :font-weight="font.weight"
      font-size="40"
    >
      {{ material }}
    </text>
  </g>
</template>
