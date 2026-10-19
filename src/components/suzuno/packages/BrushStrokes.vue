<script setup lang="ts">
// Darker blue brush strokes of watercolour paint, as inside the Hokkaido map
// of the RIBON bag, from the brush strokes generator
// (src/lib/suzuno/patterns/brush-strokes.ts). Seed 0 draws the strokes traced from
// the photo in the coordinates of HokkaidoMap: the middle of the map at the
// origin, a map height of 100. Each other prop replaces a parameter.
import { useId } from 'vue'
import type { BrushStrokesParameters } from '~/lib/suzuno/patterns/brush-strokes'
import { BRUSH_STROKES, TRACED_STROKES_BOX } from '~/lib/suzuno/patterns/brush-strokes'
import { defaults } from '~/lib/suzuno/patterns/pattern'

const props = defineProps<{ seed?: number } & Partial<BrushStrokesParameters>>()

const id = useId()
const markup = computed(() => {
  const given = Object.fromEntries(Object.entries(props).filter(([name, value]) => name !== 'seed' && value !== undefined))
  return BRUSH_STROKES.render(props.seed ?? 0, { ...defaults(BRUSH_STROKES.parameters), ...given }, TRACED_STROKES_BOX, id)
})
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -- an SVG <g>, not a component -->
  <g v-html="markup" />
</template>
