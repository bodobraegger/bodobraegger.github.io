<script setup lang="ts">
// The oval label of the Almond Caramel bag: an oval with a heavy outer line
// and a thin inner line, two English lines, "ALMOND", the spaced
// C-A-R-A-M-E-L with dots, a rule and the English sentence. In its own
// coordinates: the middle of the oval at the origin, in face pixels at a
// scale of 1. Place it with placementTransform (src/lib/suzuno/packages/almond-caramel.ts).
import type { LabelLayout, PrintFont } from '~/lib/suzuno/packages/almond-caramel'
import { ALMOND_CARAMEL_FONTS, blockLines, textAttributes } from '~/lib/suzuno/packages/almond-caramel'
import { useWebFonts } from '~/lib/suzuno/packages/lettering'

const props = withDefaults(defineProps<{
  layout: LabelLayout
  intro: string[]
  name: string
  /** The letters of the spaced word, with a dot between each two. */
  spaced: string
  sentence: string[]
  fill: string
  ink: string
  /** The colour of the spaced word. */
  green: string
  nameFont?: PrintFont
  spacedFont?: PrintFont
  lineFont?: PrintFont
}>(), {
  nameFont: () => ALMOND_CARAMEL_FONTS.condensed,
  spacedFont: () => ALMOND_CARAMEL_FONTS.extended,
  lineFont: () => ALMOND_CARAMEL_FONTS.serif,
})

useWebFonts(() => [props.nameFont, props.spacedFont, props.lineFont])

const innerOval = computed(() => {
  const { rx, ry, outline, gap, inner } = props.layout
  const inset = outline / 2 + gap + inner / 2
  return { rx: rx - inset, ry: ry - inset }
})
const introLines = computed(() => blockLines(props.layout.intro, props.intro.length))
const sentenceLines = computed(() => blockLines(props.layout.sentence, props.sentence.length))
const spacedLetters = computed(() => {
  const { x, pitch } = props.layout.spaced
  return [...props.spaced].map((letter, index) => ({ letter, x: x + index * pitch }))
})
// The dots sit halfway between the letters, at half the cap height
const spacedDots = computed(() => {
  const { x, y, pitch, size } = props.layout.spaced
  return spacedLetters.value.slice(1).map((_, index) => ({ cx: x + (index + 0.5) * pitch, cy: y - size / 2 }))
})
</script>

<template>
  <g>
    <ellipse :rx="layout.rx" :ry="layout.ry" :fill="fill" :stroke="ink" :stroke-width="layout.outline" data-ink="label" />
    <ellipse v-bind="innerOval" fill="none" :stroke="ink" :stroke-width="layout.inner" />
    <g text-anchor="middle" :fill="ink">
      <text v-for="(line, index) in intro" :key="`intro-${index}`" v-bind="textAttributes(introLines[index], lineFont)">
        {{ line }}
      </text>
      <text v-bind="textAttributes(layout.name, nameFont)" data-part="name">
        {{ name }}
      </text>
      <text v-for="(line, index) in sentence" :key="`sentence-${index}`" v-bind="textAttributes(sentenceLines[index], lineFont)">
        {{ line }}
      </text>
    </g>
    <g :fill="green" text-anchor="middle" data-part="spaced">
      <text v-for="(item, index) in spacedLetters" :key="index" v-bind="textAttributes({ ...layout.spaced, x: item.x }, spacedFont)">
        {{ item.letter }}
      </text>
      <circle v-for="dot in spacedDots" :key="dot.cx" v-bind="dot" :r="layout.spaced.dot" />
    </g>
    <line :x1="layout.rule.left" :x2="layout.rule.right" :y1="layout.rule.y" :y2="layout.rule.y" :stroke="ink" :stroke-width="layout.rule.width" />
  </g>
</template>
