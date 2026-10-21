<script setup lang="ts">
// The crimped end of a twist-free candy wrapper: a band of film with upright
// ridges and a serrated cut edge. In its own coordinates: the band runs from
// the origin `width` along x to the cut edge, and `height` along y. Mirror it
// with scale(-1 1) for the left end.
const props = defineProps<{
  width: number
  height: number
  film: string
  light: string
  dark: string
}>()

// The number of teeth along the cut edge, the depth of a tooth, and the ridges of the band
const TEETH = 14
const DEPTH = 3
const RIDGES = 3

const outline = computed(() => {
  const step = props.height / TEETH
  let d = `M0 0H${props.width - DEPTH}`
  for (let index = 0; index < TEETH; index++)
    d += `L${props.width} ${(index + 0.5) * step}L${props.width - DEPTH} ${(index + 1) * step}`
  return `${d}H0Z`
})
// The ridges fill the inner two thirds of the band
const ridgeLines = computed(() => {
  const spacing = (props.width - DEPTH) * 0.66 / RIDGES
  return Array.from({ length: RIDGES }, (_, index) => (index + 0.5) * spacing + (props.width - DEPTH) * 0.12)
})
</script>

<template>
  <g>
    <path :d="outline" :fill="film" />
    <path :d="ridgeLines.map(x => `M${x} 0V${height}`).join('')" :stroke="dark" stroke-width="0.9" />
    <path :d="ridgeLines.map(x => `M${x + 1.1} 0V${height}`).join('')" :stroke="light" stroke-width="0.8" />
  </g>
</template>
