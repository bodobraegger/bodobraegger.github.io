<script setup lang="ts">
// The light blue island of Hokkaido behind the title of the RIBON bag, with
// darker blue brush strokes in it (BrushStrokes.vue). The outline is from
// Natural Earth (public domain). In its own coordinates: the middle of the
// island at the origin, a height of 100.
import { useId } from 'vue'
import BrushStrokes from '~/components/suzuno/packages/BrushStrokes.vue'
import { MAP_PATH } from '~/lib/suzuno/packages/hokkaido-milk-paths'

withDefaults(defineProps<{
  color?: string
  strokes?: string
  /** The softness of the edge of the paint, in units of the part. */
  softness?: number
}>(), {
  color: '#9fd4f2',
  strokes: '#3aa6e0',
  softness: 0.6,
})

const filterId = `${useId()}-soft`
</script>

<template>
  <g :filter="softness ? `url(#${filterId})` : undefined">
    <filter :id="filterId" x="-5%" y="-5%" width="110%" height="110%">
      <feGaussianBlur :stdDeviation="softness" />
    </filter>
    <path :d="MAP_PATH" :fill="color" />
    <BrushStrokes :color="strokes" />
  </g>
</template>
