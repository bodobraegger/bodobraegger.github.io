<script setup lang="ts">
// The small white label at the bottom of the orange MARUKAWA export box: a
// heading with a dark badge after it, and centred lines below, in Helvetica
// (Arimo stands in). It fills the box x, y, width, height of its parent.
import { useWebFonts } from '~/lib/suzuno/packages/lettering'
import type { MarukawaLabelText } from '~/lib/suzuno/packages/marukawa'
import { MARUKAWA_FONTS, fontSizeForCapHeight, textWidth } from '~/lib/suzuno/packages/marukawa'

const props = defineProps<{
  text: MarukawaLabelText
  x: number
  y: number
  width: number
  height: number
  color: string
}>()

const { helvetica, helveticaBold } = MARUKAWA_FONTS
useWebFonts(helvetica, helveticaBold)

// The label in its own units, scaled to its box
const BOX = { width: 100, height: 60 }
const MARGIN = 6
const HEADING = { baseline: 17, capHeight: 10 }
const LINES = { first: 37, spacing: 15, capHeight: 8 }
const BADGE_GAP = 4
const PAPER = '#ffffff'

const headingSize = fontSizeForCapHeight(HEADING.capHeight, helveticaBold.metrics)
const lineSize = fontSizeForCapHeight(LINES.capHeight, helvetica.metrics)
const badgeX = computed(() => MARGIN + textWidth(props.text.heading, helveticaBold.metrics) * headingSize + BADGE_GAP)
const badge = computed(() => ({
  x: badgeX.value,
  y: HEADING.baseline - HEADING.capHeight - 3,
  width: BOX.width - MARGIN - badgeX.value,
  height: HEADING.capHeight + 6,
}))
// A line that is longer than the label is narrowed to its width
const LINE_WIDTH = BOX.width - 2 * MARGIN
const lineLength = (line: string) => textWidth(line, helvetica.metrics) * lineSize > LINE_WIDTH ? LINE_WIDTH : undefined
</script>

<template>
  <g :transform="`translate(${x} ${y}) scale(${width / BOX.width} ${height / BOX.height})`" :font-family="helvetica.family">
    <rect :width="BOX.width" :height="BOX.height" :fill="PAPER" data-ink="label-paper" />
    <text :x="MARGIN" :y="HEADING.baseline" font-weight="700" :font-size="headingSize" :fill="color" data-ink="label">
      {{ text.heading }}
    </text>
    <rect v-bind="badge" :rx="badge.height / 2" :fill="color" data-ink="label" />
    <text
      :x="badge.x + badge.width / 2"
      :y="HEADING.baseline"
      text-anchor="middle"
      font-weight="700"
      :font-size="headingSize"
      :fill="PAPER"
      :textLength="badge.width - 2 * BADGE_GAP"
      lengthAdjust="spacingAndGlyphs"
    >
      {{ text.badge }}
    </text>
    <text
      v-for="(line, index) in text.lines"
      :key="index"
      :x="BOX.width / 2"
      text-anchor="middle"
      :y="LINES.first + index * LINES.spacing"
      :font-size="lineSize"
      :fill="color"
      :textLength="lineLength(line)"
      lengthAdjust="spacingAndGlyphs"
      data-ink="label"
    >
      {{ line }}
    </text>
  </g>
</template>
