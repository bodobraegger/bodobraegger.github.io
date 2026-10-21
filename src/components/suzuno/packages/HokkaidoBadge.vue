<script setup lang="ts">
// A claim of the RIBON bag, like "カルシウム強化! 1袋あたり 120mg": centred
// lines of heavy coloured text with a white edge and a soft grey shadow edge.
// In its own coordinates: the middle of the first baseline at the origin, a
// cap height of 100 for a line of size 1.
import type { BadgeLine } from '~/lib/suzuno/packages/hokkaido-milk'
import { HOKKAIDO_MILK_FONTS, useHokkaidoMilkFonts } from '~/lib/suzuno/packages/hokkaido-milk'

const props = defineProps<{
  lines: BadgeLine[]
  color: string
  edge: string
  shadow: string
}>()

useHokkaidoMilkFonts()

const CAP_HEIGHT = 100
// The distance between baselines, in cap heights of the lower line
const LINE_HEIGHT = 1.12
// The kana and kanji of Noto Serif JP fill about 0.88 em above the baseline; Tinos capitals 0.66 em
const EM = { mincho: CAP_HEIGHT / 0.88, times: CAP_HEIGHT / 0.66 }
const EDGE = 0.2 * CAP_HEIGHT
const SHADOW = 0.34 * CAP_HEIGHT

const placed = computed(() => {
  let y = 0
  return props.lines.map((line, index) => {
    const size = line.size ?? 1
    if (index > 0)
      y += size * LINE_HEIGHT * CAP_HEIGHT
    const font = line.font ?? 'mincho'
    return { ...line, y, fontSize: EM[font] * size, family: HOKKAIDO_MILK_FONTS[font], weight: font === 'times' ? 700 : 900, size }
  })
})
</script>

<template>
  <g text-anchor="middle" stroke-linejoin="round">
    <g v-for="(line, index) in placed" :key="index" :font-family="line.family" :font-weight="line.weight" :font-size="line.fontSize">
      <text :y="line.y" :fill="shadow" :stroke="shadow" :stroke-width="SHADOW * line.size">
        {{ line.text }}
      </text>
      <text :y="line.y" :fill="color" :stroke="edge" :stroke-width="EDGE * line.size" paint-order="stroke">
        {{ line.text }}
      </text>
    </g>
  </g>
</template>
