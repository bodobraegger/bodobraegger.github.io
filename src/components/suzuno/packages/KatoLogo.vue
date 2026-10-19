<script setup lang="ts">
// The logo of 加藤製菓 (Kato Seika) on its candy bags: the red oval with a
// white ring and the name カトウ in white block letters, and the line
// 一粒の小さな友達 ("a small friend in each piece") below it. The letters are
// redrawn as one polygon after the logo of the maker. In its own coordinates
// the oval has its centre at the origin and a horizontal radius of 100. Place
// it with placePart (src/lib/suzuno/packages/salt-lemon.ts).
import type { LogoLayout, SaltLemonFont } from '~/lib/suzuno/packages/salt-lemon'
import { FRONT_COLORS, FRONT_PARTS, SALT_LEMON_FONTS, useSaltLemonFonts } from '~/lib/suzuno/packages/salt-lemon'

withDefaults(defineProps<{
  /** A name in place of the drawn letters, for another maker. */
  name?: string
  tagline?: string
  red?: string
  /** The letters and the ring. */
  white?: string
  taglineColor?: string
  /** The white edge round the tagline. */
  taglineHalo?: string
  font?: SaltLemonFont
  nameFont?: SaltLemonFont
  layout?: LogoLayout
}>(), {
  tagline: '一粒の小さな友達',
  red: FRONT_COLORS.logoRed,
  white: '#ffffff',
  taglineColor: FRONT_COLORS.logoRed,
  taglineHalo: '#ffffff',
  font: () => SALT_LEMON_FONTS.rounded,
  nameFont: () => SALT_LEMON_FONTS.roundedBold,
  layout: () => FRONT_PARTS.logo,
})

useSaltLemonFonts()

const OVAL = { rx: 100, ry: 59 }
// カトウ: カ with its long stroke, ト joined to the bar ー, and ウ
const LETTERS = 'M92.8 -11.1 L91.3 -15.3 L87.5 -17.9 L64.9 -17.9 L64.5 -23.6 L62.6 -25.1 L51.7 -24.7 L50.2 -17.9 L26.8 -17.5 L24.2 -14.9 L23.8 -8.5 L-2.6 -9.2 L-10.2 -14.9 L-10.2 -22.8 L-12.1 -24.3 L-24.5 -23.6 L-25.3 -17.5 L-52.8 -17.5 L-54 -24.3 L-65.3 -24.7 L-67.2 -22.8 L-67.5 -17.5 L-90.6 -16.8 L-90.9 -8.5 L-89.4 -6.6 L-67.5 -6.6 L-67.2 -5.1 L-69.8 2.5 L-74 7.7 L-80.8 11.5 L-88.7 11.9 L-90.6 13 L-90.9 21.3 L-89.4 22.8 L-80.4 22.8 L-74.7 21.7 L-66.4 17.5 L-57.7 8.1 L-54.7 1.7 L-52.8 -6.6 L-36.6 -6.6 L-36.2 4 L-37.7 8.1 L-41.5 11.1 L-54.3 12.3 L-54 22.1 L-36.2 22.1 L-30.9 19.8 L-25.3 14.9 L-24.2 22.1 L-11.7 22.5 L-10.2 21.3 L-9.8 0.6 L2.6 4.7 L35.5 4.7 L36.6 3.6 L37 -7 L79.2 -7 L79.6 4 L77.7 7.7 L73.6 11.1 L29.4 11.5 L27.5 13.4 L27.5 20.6 L29.1 22.5 L73.6 22.5 L83 19.4 L89.4 13 L92.5 3.6Z'
// A name in a font is slanted and as wide as the drawn letters
const NAME = { width: 184, size: 52, slant: -12 }
</script>

<template>
  <g>
    <ellipse :rx="OVAL.rx" :ry="OVAL.ry" :fill="red" :stroke="white" :stroke-width="layout.ring" data-ink="logo" />
    <path v-if="name === undefined" :d="LETTERS" :fill="white" data-ink="logo-letters" />
    <text
      v-else
      :transform="`skewX(${NAME.slant})`"
      y="0"
      text-anchor="middle"
      dominant-baseline="central"
      :font-family="nameFont.family"
      :font-weight="nameFont.weight"
      :font-size="NAME.size"
      :textLength="NAME.width"
      lengthAdjust="spacingAndGlyphs"
      :fill="white"
      data-ink="logo-letters"
    >
      {{ name }}
    </text>
    <text
      :y="layout.tagline.y"
      text-anchor="middle"
      dominant-baseline="central"
      :font-family="font.family"
      :font-weight="font.weight"
      :font-size="layout.tagline.size"
      :textLength="layout.tagline.width"
      lengthAdjust="spacing"
      :fill="taglineColor"
      :stroke="taglineHalo"
      :stroke-width="layout.tagline.halo"
      stroke-linejoin="round"
      paint-order="stroke"
      data-ink="logo-tagline"
    >
      {{ tagline }}
    </text>
  </g>
</template>
