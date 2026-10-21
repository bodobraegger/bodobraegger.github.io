<script setup lang="ts">
// A heat seal band across a bag: a strip of the seal colour from top to
// bottom, with straight lines across it, such as the dark and the green line
// of the Almond Caramel bag. Lines name their colour in colors.
import type { BandLayout } from '~/lib/suzuno/packages/almond-caramel'

defineProps<{
  layout: BandLayout<string>
  /** The width of the bag. */
  width: number
  fill: string
  colors: Record<string, string>
}>()
</script>

<template>
  <g>
    <rect x="0" :y="layout.top" :width="width" :height="layout.bottom - layout.top" :fill="fill" />
    <rect v-for="line in layout.lines" :key="line.y" x="0" :y="line.y - line.width / 2" :width="width" :height="line.width" :fill="colors[line.color]" />
  </g>
</template>
