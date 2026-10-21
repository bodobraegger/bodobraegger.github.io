<script setup lang="ts">
// The light blue island of Hokkaido behind the title of the RIBON bag, with
// darker blue brush strokes in it (BrushStrokes.vue). The outline is from
// Natural Earth (public domain). In its own coordinates: the middle of the
// island at the origin, a height of 100.
import { useId } from 'vue'
import BrushStrokes from '~/components/suzuno/packages/BrushStrokes.vue'
import { MAP_PATH } from '~/lib/suzuno/packages/hokkaido-milk-paths'

defineProps<{
  color: string
  strokes: string
}>()

// The softness of the edge of the paint, in units of the part
const SOFTNESS = 0.6
const filterId = `${useId()}-soft`
</script>

<template>
  <g :filter="`url(#${filterId})`">
    <filter :id="filterId" x="-5%" y="-5%" width="110%" height="110%">
      <feGaussianBlur :stdDeviation="SOFTNESS" />
    </filter>
    <path :d="MAP_PATH" :fill="color" />
    <BrushStrokes :color="strokes" />
  </g>
</template>
