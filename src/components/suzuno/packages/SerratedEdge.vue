<script setup lang="ts">
// The crimped end of a twist-free candy wrapper: a band of film with upright
// ridges and a serrated cut edge. In its own coordinates: the band runs from
// the origin `width` along x to the cut edge, and `height` along y. Mirror it
// with scale(-1 1) for the left end.
const props = withDefaults(defineProps<{
  width: number
  height: number
  /** The number of teeth along the cut edge. */
  teeth?: number
  /** The depth of a tooth. */
  depth?: number
  ridges?: number
  film?: string
  light?: string
  dark?: string
}>(), {
  teeth: 14,
  depth: 3,
  ridges: 3,
  film: '#f3f4f5',
  light: '#ffffff',
  dark: '#a6a9ad',
})

const outline = computed(() => {
  const step = props.height / props.teeth
  let d = `M0 0H${props.width - props.depth}`
  for (let index = 0; index < props.teeth; index++)
    d += `L${props.width} ${(index + 0.5) * step}L${props.width - props.depth} ${(index + 1) * step}`
  return `${d}H0Z`
})
// The ridges fill the inner two thirds of the band
const ridgeLines = computed(() => {
  const spacing = (props.width - props.depth) * 0.66 / props.ridges
  return Array.from({ length: props.ridges }, (_, index) => (index + 0.5) * spacing + (props.width - props.depth) * 0.12)
})
</script>

<template>
  <g>
    <path :d="outline" :fill="film" />
    <path :d="ridgeLines.map(x => `M${x} 0V${height}`).join('')" :stroke="dark" stroke-width="0.9" />
    <path :d="ridgeLines.map(x => `M${x + 1.1} 0V${height}`).join('')" :stroke="light" stroke-width="0.8" />
  </g>
</template>
