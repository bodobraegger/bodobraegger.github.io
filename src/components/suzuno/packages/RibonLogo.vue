<script setup lang="ts">
// The RIBON logo: red flared capitals, with a red disc in place of the O.
// The upper right quarter of the disc has white stripes. In its own
// coordinates: the middle of the baseline at the origin, a cap height of 100.
import { useId } from 'vue'
import { HOKKAIDO_MILK_FONTS, useHokkaidoMilkFonts } from '~/lib/suzuno/packages/hokkaido-milk'

const props = defineProps<{
  name: string
  color: string
}>()

useHokkaidoMilkFonts()

const CAP_HEIGHT = 100
// Marcellus has a cap height of 0.7 em
const FONT_SIZE = CAP_HEIGHT / 0.7
const RADIUS = 0.56 * CAP_HEIGHT
const GAP = 0.06 * CAP_HEIGHT
const STRIPES = 5
// The letter that the disc replaces
const DISC_LETTER = 'O'

const parts = computed(() => {
  const index = props.name.indexOf(DISC_LETTER)
  return index < 0 ? null : { before: props.name.slice(0, index), after: props.name.slice(index + 1) }
})
const stripes = Array.from({ length: STRIPES }, (_, index) => {
  const height = RADIUS / (2 * STRIPES - 1)
  return { y: -CAP_HEIGHT / 2 - RADIUS + 2 * index * height + height, height }
})

const clipId = `${useId()}-disc`
</script>

<template>
  <g :font-family="HOKKAIDO_MILK_FONTS.logo" :font-size="FONT_SIZE" :fill="color">
    <template v-if="parts">
      <text :x="-RADIUS - GAP" text-anchor="end">
        {{ parts.before }}
      </text>
      <clipPath :id="clipId">
        <circle :cy="-CAP_HEIGHT / 2" :r="RADIUS" />
      </clipPath>
      <circle :cy="-CAP_HEIGHT / 2" :r="RADIUS" />
      <g :clip-path="`url(#${clipId})`" fill="#fff">
        <rect v-for="stripe in stripes" :key="stripe.y" :x="-0.04 * RADIUS" :y="stripe.y" :width="RADIUS * 1.1" :height="stripe.height" />
      </g>
      <text :x="RADIUS + GAP">
        {{ parts.after }}
      </text>
    </template>
    <text v-else text-anchor="middle">
      {{ name }}
    </text>
  </g>
</template>
