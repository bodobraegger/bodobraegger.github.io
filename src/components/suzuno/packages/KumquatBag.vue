<script setup lang="ts">
// The front of the bag of preserved kumquats 旬の味 甘草金桔 as one SVG in the
// pixel space of its face (1000 x 690): the photo of what shows through the
// clear film, the kumquats and the table under the bag, the yellow label with the brush title, the dots and
// the two orange lines, the green brush strokes, the round badge with the
// name and the weight, the zip at the right edge, the opening line at the
// left edge and the price sticker of the shop.
import { useId } from 'vue'
import kumquatContents from '~/assets/suzuno/packages/kumquat-contents.webp'
import type { KumquatTexts } from '~/lib/suzuno/packages/kumquat'
import { KUMQUAT_FRONT, KUMQUAT_TITLE, KUMQUAT_COLORS as colors, KUMQUAT_FONTS as fonts, KUMQUAT_LAYOUT as layout, letteringAttributes, useKumquatFonts } from '~/lib/suzuno/packages/kumquat'
import { BADGE_FIELD_PATH, BADGE_PATH, LABEL_PATH, STROKES_PATH, TITLE_PATH } from '~/lib/suzuno/packages/kumquat-paths'

const props = withDefaults(defineProps<{
  texts: KumquatTexts
  /** The photo of what shows through the film, as large as the face. */
  contents?: string
}>(), {
  contents: kumquatContents,
})

useKumquatFonts()

const id = useId()
const ids = { title: `${id}-title`, label: `${id}-label`, badge: `${id}-badge`, rim: `${id}-rim` }
// The light of the photo falls unevenly, so the label and the badge have gradients
const gradients = [
  { id: ids.label, ...colors.label },
  { id: ids.badge, ...colors.badge },
  { id: ids.rim, ...colors.rim },
]
const points = (line: number[][]) => line.map(point => point.join(',')).join(' ')
const { title: titleBox, arrow, sticker } = layout

// Another title is set in the brush font, as large as the box of the traced title allows
const titleSize = computed(() => Math.min(titleBox.height, titleBox.width / Math.max(1, [...props.texts.title].length)))

// The arrow points down along the edge, to the end of the opening line
const arrowPath = `M${arrow.x - arrow.shaft / 2} ${arrow.y}h${arrow.shaft}v${arrow.length - arrow.headLength}h${(arrow.head - arrow.shaft) / 2}l${-arrow.head / 2} ${arrow.headLength}l${-arrow.head / 2} ${-arrow.headLength}h${(arrow.head - arrow.shaft) / 2}Z`
const dotColors: Record<string, string> = { orange: colors.orange, green: colors.green }
</script>

<template>
  <svg class="block h-auto w-full" :viewBox="`0 0 ${KUMQUAT_FRONT.width} ${KUMQUAT_FRONT.height}`" role="img" :aria-labelledby="ids.title">
    <title :id="ids.title">{{ texts.title }} {{ texts.badge.name }}</title>
    <defs>
      <linearGradient v-for="gradient in gradients" :id="gradient.id" :key="gradient.id" gradientUnits="userSpaceOnUse" :x1="gradient.from.x" :y1="gradient.from.y" :x2="gradient.to.x" :y2="gradient.to.y">
        <stop offset="0" :stop-color="gradient.from.color" />
        <stop offset="1" :stop-color="gradient.to.color" />
      </linearGradient>
    </defs>
    <image :href="contents" :width="KUMQUAT_FRONT.width" :height="KUMQUAT_FRONT.height" preserveAspectRatio="none" />

    <rect :x="layout.openingLine.x" :y="layout.openingLine.y" :width="layout.openingLine.width" :height="layout.openingLine.height" :fill="colors.openingLine" />
    <path :d="arrowPath" :fill="colors.openingInk" />
    <text v-bind="letteringAttributes(layout.opening, fonts.gothic)" :fill="colors.openingInk">{{ texts.opening }}</text>
    <polyline :points="points(layout.zip.points)" fill="none" :stroke="colors.zip" :stroke-width="layout.zip.width" />
    <polyline :points="points(layout.zipLine.points)" fill="none" :stroke="colors.zipLine" :stroke-width="layout.zipLine.width" />

    <g :transform="`translate(${sticker.x} ${sticker.y}) rotate(${sticker.rotate})`">
      <rect :x="-sticker.width / 2" :y="-sticker.height / 2" :width="sticker.width" :height="sticker.height" :rx="sticker.radius" :fill="colors.sticker" />
      <text v-bind="letteringAttributes(sticker.shop, fonts.narrow)" font-weight="700" text-anchor="middle" :fill="colors.stickerRed">{{ texts.sticker.shop }}</text>
      <text v-bind="letteringAttributes(sticker.price, fonts.brush)" text-anchor="middle" :fill="colors.stickerInk">{{ texts.sticker.price }}</text>
    </g>

    <path :d="STROKES_PATH" :fill="colors.stroke" :stroke="colors.strokeOutline" :stroke-width="layout.strokeOutline" stroke-linejoin="round" paint-order="stroke" />
    <path :d="LABEL_PATH" :fill="`url(#${ids.label})`" />
    <circle v-for="(dot, index) in layout.dots" :key="index" :cx="dot.x" :cy="dot.y" :r="dot.r" :fill="dotColors[dot.color]" />
    <path v-if="texts.title === KUMQUAT_TITLE" :d="TITLE_PATH" :fill="colors.title" fill-rule="evenodd" />
    <text
      v-else
      :x="titleBox.x + titleBox.width / 2"
      :y="titleBox.y + titleBox.height / 2"
      text-anchor="middle"
      dominant-baseline="central"
      :font-family="fonts.brush.family"
      :font-size="titleSize"
      :fill="colors.title"
    >
      {{ texts.title }}
    </text>
    <g :fill="colors.ink">
      <text v-for="(line, index) in texts.lines.slice(0, layout.lines.length)" :key="index" v-bind="letteringAttributes(layout.lines[index], fonts.brush)">{{ line }}</text>
    </g>

    <path :d="BADGE_PATH" :fill="`url(#${ids.rim})`" />
    <path :d="BADGE_FIELD_PATH" :fill="`url(#${ids.badge})`" />
    <g :fill="colors.badgeInk" text-anchor="middle">
      <text v-bind="letteringAttributes(layout.badge.name, fonts.gothicBold)">{{ texts.badge.name }}</text>
      <text v-for="(line, index) in texts.badge.english.slice(0, layout.badge.english.length)" :key="index" v-bind="letteringAttributes(layout.badge.english[index], fonts.narrowBold)">{{ line }}</text>
      <text v-bind="letteringAttributes(layout.badge.weightLabel, fonts.narrow)">{{ texts.badge.weightLabel }}</text>
      <text v-bind="letteringAttributes(layout.badge.weight, fonts.narrow)">{{ texts.badge.weight }}</text>
    </g>
  </svg>
</template>
