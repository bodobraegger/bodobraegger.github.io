<script setup lang="ts">
// The banner line of the salt lemon candy bag, ― 気軽に塩分補給 ― ("an easy
// way to take in salt"): white lettering with a blue edge between two dashes.
// In its own coordinates the middle of the line is at the origin and the font
// size is 100. Place it with placePart (src/lib/suzuno/packages/salt-lemon.ts).
import { FRONT_COLORS, FRONT_PARTS, SALT_LEMON_FONTS, useSaltLemonFonts } from '~/lib/suzuno/packages/salt-lemon'

const props = defineProps<{
  text: string
}>()

useSaltLemonFonts()

const FONT_SIZE = 100
const { ink, edge } = FRONT_COLORS
const font = SALT_LEMON_FONTS.rounded
const layout = FRONT_PARTS.banner

// The characters are full-width, so the line is one font size long for each, plus the spacing between them
const halfWidth = computed(() => ([...props.text].length * (1 + layout.tracking) - layout.tracking) * FONT_SIZE / 2)
const dashBoxes = computed(() => {
  const { length, gap, thickness } = layout.dashes
  const start = halfWidth.value + gap * FONT_SIZE
  const box = { y: -thickness * FONT_SIZE / 2, width: length * FONT_SIZE, height: thickness * FONT_SIZE }
  return [{ ...box, x: -start - box.width }, { ...box, x: start }]
})
</script>

<template>
  <g :fill="ink" :stroke="edge" :stroke-width="layout.edgeWidth * FONT_SIZE" stroke-linejoin="round" paint-order="stroke" data-ink="banner">
    <rect v-for="(dash, index) in dashBoxes" :key="index" v-bind="dash" />
    <!-- The spacing after the last character would move the line off the middle -->
    <text
      :x="layout.tracking * FONT_SIZE / 2"
      text-anchor="middle"
      dominant-baseline="central"
      :font-family="font.family"
      :font-weight="font.weight"
      :font-size="FONT_SIZE"
      :letter-spacing="layout.tracking * FONT_SIZE"
    >
      {{ text }}
    </text>
  </g>
</template>
