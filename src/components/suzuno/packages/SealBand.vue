<script setup lang="ts">
// A heat seal band across a bag: a strip of the seal colour from top to
// bottom, with straight lines across it, such as the dark and the green line
// of the Almond Caramel bag. Lines name their colour in colors. The stripes
// generator (src/lib/suzuno/patterns/stripes.ts) draws it.
import type { BandLayout } from '~/lib/suzuno/packages/almond-caramel'
import { STRIPES } from '~/lib/suzuno/patterns/stripes'

defineProps<{
  layout: BandLayout<string>
  /** The width of the bag. */
  width: number
  fill: string
  colors: Record<string, string>
}>()

function band({ top, bottom, lines }: BandLayout, width: number, fill: string, colors: Record<string, string>) {
  const stripes = lines.map(line => ({ offset: line.y - top, width: line.width, color: colors[line.color] }))
  return STRIPES.render(0, { ground: fill, groundOpacity: 1, stripes, period: 0 }, { x: 0, y: top, width, height: bottom - top }, '')
}
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -- an SVG <g>, not a component -->
  <g v-html="band(layout, width, fill, colors)" />
</template>
