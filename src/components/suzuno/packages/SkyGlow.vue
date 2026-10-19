<script setup lang="ts">
// A pale glow of sky over a horizon, as behind the farm of the RIBON bag,
// from the sky glow generator (src/lib/suzuno/patterns/sky-glow.ts). In its own
// coordinates: the horizon runs from the origin `width` along x, and the glow
// rises `height` above it.
import { useId } from 'vue'
import { SKY_GLOW } from '~/lib/suzuno/patterns/sky-glow'

withDefaults(defineProps<{
  width: number
  height: number
  color?: string
}>(), {
  color: SKY_GLOW.parameters.color.default,
})

const gradientId = `${useId()}-sky`

function glow(width: number, height: number, color: string) {
  return SKY_GLOW.render(0, { color, strength: 1, horizon: 1 }, { x: 0, y: -height, width, height }, gradientId)
}
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -- an SVG <g>, not a component -->
  <g v-html="glow(width, height, color)" />
</template>
