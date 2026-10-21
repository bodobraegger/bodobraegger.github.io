<script setup lang="ts">
// An EAN-13 barcode with its digits. The bars fill the box x, y, width,
// height of the parent; the guard bars reach down between the digits, and the
// first digit stands left of the box, in the quiet zone.
import type { BarcodeLayout } from '~/lib/suzuno/packages/almond-caramel'
import { ALMOND_CARAMEL_FONTS } from '~/lib/suzuno/packages/almond-caramel'
import { EAN13_MODULES, ean13Bars } from '~/lib/suzuno/packages/ean13'
import { useWebFonts } from '~/lib/suzuno/packages/lettering'

const props = defineProps<{
  layout: BarcodeLayout
  digits: string
  color: string
}>()

const font = ALMOND_CARAMEL_FONTS.gothic
useWebFonts(font)

// The digit groups, in modules: the first digit left of the start guard, and the two halves
const GROUPS = [
  { from: 0, to: 1, center: -6 },
  { from: 1, to: 7, center: 24 },
  { from: 7, to: 13, center: 71 },
]
const HALF_WIDTH = 42

const module = computed(() => props.layout.width / EAN13_MODULES)
const bars = computed(() => ean13Bars(props.digits))
// The normal bars end above the digits; the guard bars reach half a digit lower
const barBottom = computed(() => props.layout.y + props.layout.height - props.layout.size * 0.6)
const groups = computed(() => GROUPS.map(group => ({
  text: props.digits.slice(group.from, group.to),
  x: props.layout.x + group.center * module.value,
  width: group.to - group.from > 1 ? HALF_WIDTH * module.value : undefined,
})))
</script>

<template>
  <g :fill="color">
    <rect
      v-for="bar in bars"
      :key="bar.start"
      :x="layout.x + bar.start * module"
      :y="layout.y"
      :width="bar.width * module"
      :height="(bar.guard ? layout.y + layout.height : barBottom) - layout.y"
    />
    <text
      v-for="group in groups"
      :key="group.x"
      :x="group.x"
      :y="layout.y + layout.height + layout.size * 0.35"
      text-anchor="middle"
      :font-family="font.family"
      :font-size="layout.size"
      :textLength="group.width"
      :lengthAdjust="group.width ? 'spacing' : undefined"
    >
      {{ group.text }}
    </text>
  </g>
</template>
