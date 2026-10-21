<script setup lang="ts">
// The title lettering 北海道 of the RIBON milk candy: a heavy brush mincho
// with cut stroke ends and a metallic shine, probably custom lettering for
// the bag. The default text is the outline traced from the photo
// (tools/packages/hokkaido_milk_trace.py); another text is set in Noto
// Serif JP Black. In its own coordinates: the middle of the base at the
// origin, a height of 100.
import { useId } from 'vue'
import { TITLE_PATH } from '~/lib/suzuno/packages/hokkaido-milk-paths'
import { HOKKAIDO_MILK_FONTS, HOKKAIDO_TITLE, useHokkaidoMilkFonts } from '~/lib/suzuno/packages/hokkaido-milk'

defineProps<{
  text: string
  /** The ink at the top and the bottom of the letters, and the shine between them. */
  color: string
  shine: string
}>()

useHokkaidoMilkFonts()

const HEIGHT = 100
// The ideographs of Noto Serif JP fill about 0.9 em, 0.1 em of it below the baseline
const FONT_SIZE = HEIGHT / 0.9
const gradientId = `${useId()}-ink`
</script>

<template>
  <g>
    <linearGradient :id="gradientId" x1="0" y1="-100" x2="0" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" :stop-color="color" />
      <stop offset="0.45" :stop-color="shine" />
      <stop offset="1" :stop-color="color" />
    </linearGradient>
    <path v-if="text === HOKKAIDO_TITLE" :d="TITLE_PATH" :fill="`url(#${gradientId})`" fill-rule="evenodd" />
    <text
      v-else
      :y="-0.1 * FONT_SIZE"
      text-anchor="middle"
      :font-family="HOKKAIDO_MILK_FONTS.mincho"
      font-weight="900"
      :font-size="FONT_SIZE"
      :fill="`url(#${gradientId})`"
    >
      {{ text }}
    </text>
  </g>
</template>
