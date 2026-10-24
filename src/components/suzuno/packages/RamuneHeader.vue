<script setup lang="ts">
// The yellow header card at the top of the あべっ子ラムネ strip as one SVG in
// the pixel space of one piece of the strip (300 x 370). The front shows
// the brand lettering, the five characters in a row, the speech bubble and
// the box of the allergens that the tablets do not contain; the back shows
// the small print, the barcode and the best-before date.
import { useId } from 'vue'
import allergenDrawings from '~/assets/suzuno/packages/ramune-allergens.webp'
import characterRow from '~/assets/suzuno/packages/ramune-header-characters.webp'
import Ean13Barcode from '~/components/suzuno/packages/Ean13Barcode.vue'
import RamuneLettering from '~/components/suzuno/packages/RamuneLettering.vue'
import RamuneSeals from '~/components/suzuno/packages/RamuneSeals.vue'
import RecyclingMark from '~/components/suzuno/packages/RecyclingMark.vue'
import type { Side } from '~/lib/suzuno/faces'
import type { RamuneHeaderTexts } from '~/lib/suzuno/packages/ramune'
import { HEADER_BACK_LAYOUT, HEADER_LAYOUT, RAMUNE_COLOURS, RAMUNE_FACE, RAMUNE_FONTS, textWidth, useRamuneFonts } from '~/lib/suzuno/packages/ramune'

const props = withDefaults(defineProps<{
  side?: Side
  texts: RamuneHeaderTexts
}>(), {
  side: 'front',
})

useRamuneFonts()

const titleId = `${useId()}-title`
const isBack = computed(() => props.side === 'back')
const { card, logo, logoSecond, characters, bubble, slogan, allergens, icons, names, warning, warningSecond } = HEADER_LAYOUT
const back = HEADER_BACK_LAYOUT
const LOGO_SPLIT = 4
// The middle of the slogan is larger than its start and its end
const SLOGAN_SIZES = [0.78, 1, 0.85]
const sloganWidth = computed(() => props.texts.slogan.reduce((width, part, index) => width + textWidth(part) * slogan.size * SLOGAN_SIZES[index], 0))
const bubblePath = computed(() => {
  const { x, y, width, height, tail } = bubble
  const radius = height / 2
  return `M${x + radius} ${y}H${tail - 4}L${tail - 2} ${y - 7}L${tail + 6} ${y}H${x + width - radius}A${radius} ${radius} 0 0 1 ${x + width - radius} ${y + height}H${x + radius}A${radius} ${radius} 0 0 1 ${x + radius} ${y}Z`
})
const detailColumns = computed(() => {
  const { x, width, size } = back.details
  return props.texts.back.details.map((column, index) => ({ column, x: x + width - (index + 0.6) * size * 1.4 }))
})
// The barcode reads from the top down, with its digits on its left
const barcodeLayout = computed(() => ({ x: 8, y: 0, width: back.barcode.height - 8, height: back.barcode.width - back.barcode.size * 1.2, size: back.barcode.size }))
</script>

<template>
  <svg class="block h-auto w-full" :viewBox="`0 0 ${RAMUNE_FACE.width} ${RAMUNE_FACE.height}`" role="img" :aria-labelledby="titleId">
    <title :id="titleId">{{ texts.logo.join('') }}</title>
    <RamuneSeals :mirrored="isBack" />
    <rect x="0" :y="card.top" :width="RAMUNE_FACE.width" :height="card.bottom - card.top" :fill="RAMUNE_COLOURS.yellow" />
    <template v-if="!isBack">
      <RamuneLettering :text="texts.logo[0]" v-bind="logo" :colours="RAMUNE_COLOURS.logo" />
      <RamuneLettering :text="texts.logo[1]" v-bind="logoSecond" :colours="RAMUNE_COLOURS.logo.slice(LOGO_SPLIT)" />
      <image :href="characterRow" v-bind="characters" preserveAspectRatio="none" />
      <path :d="bubblePath" :fill="RAMUNE_COLOURS.halo" :stroke="RAMUNE_COLOURS.ink" :stroke-width="bubble.border" stroke-linejoin="round" />
      <text
        :x="slogan.x"
        :y="slogan.y"
        text-anchor="middle"
        :font-family="RAMUNE_FONTS.gothicBold.family"
        :font-weight="RAMUNE_FONTS.gothicBold.weight"
        :fill="RAMUNE_COLOURS.ink"
        :textLength="Math.min(sloganWidth, slogan.width)"
        lengthAdjust="spacingAndGlyphs"
      >
        <tspan v-for="(part, index) in texts.slogan" :key="index" :font-size="slogan.size * SLOGAN_SIZES[index]">{{ part }}</tspan>
      </text>
      <rect v-bind="{ x: allergens.x, y: allergens.y, width: allergens.width, height: allergens.height }" :rx="allergens.radius" :fill="RAMUNE_COLOURS.halo" :stroke="RAMUNE_COLOURS.allergenBorder" :stroke-width="allergens.border" />
      <image :href="allergenDrawings" v-bind="icons" preserveAspectRatio="none" />
      <g :font-family="RAMUNE_FONTS.gothicBold.family" :font-weight="RAMUNE_FONTS.gothicBold.weight" :font-size="names.size" :fill="RAMUNE_COLOURS.ink" text-anchor="middle">
        <text v-for="(name, index) in texts.allergens" :key="index" :x="names.centres[index]" :y="names.y">{{ name }}</text>
      </g>
      <RamuneLettering :text="texts.warning[0]" v-bind="warning" :colours="RAMUNE_COLOURS.warning" />
      <RamuneLettering :text="texts.warning[1]" v-bind="{ ...warning, ...warningSecond }" :colours="RAMUNE_COLOURS.warningSecond" />
    </template>
    <g v-else :font-family="RAMUNE_FONTS.gothic.family" :font-weight="RAMUNE_FONTS.gothic.weight" :fill="RAMUNE_COLOURS.ink">
      <text :font-size="back.caution.size">
        <tspan v-for="(line, index) in texts.back.caution" :key="index" :x="back.caution.x" :y="back.caution.y + index * back.caution.leading">{{ line }}</tspan>
      </text>
      <rect :x="back.caution.x - 2" :y="back.caution.y - back.caution.size - 1" :width="back.caution.width" :height="back.caution.size + 4" fill="none" :stroke="RAMUNE_COLOURS.ink" stroke-width="0.8" />
      <RecyclingMark :box="back.recycling" :color="RAMUNE_COLOURS.ink" />
      <text :font-size="back.recyclingNote.size">
        <tspan v-for="(line, index) in texts.back.recycling" :key="index" :x="back.recyclingNote.x" :y="back.recyclingNote.y + index * back.recyclingNote.leading">{{ line }}</tspan>
      </text>
      <rect v-bind="{ x: back.details.x, y: back.details.y, width: back.details.width, height: back.details.height }" fill="none" :stroke="RAMUNE_COLOURS.ink" stroke-width="0.8" />
      <text
        v-for="{ column, x } in detailColumns"
        :key="x"
        :x="x"
        :y="back.details.y + 4"
        writing-mode="vertical-rl"
        :font-size="back.details.size"
        :textLength="Math.min(textWidth(column) * back.details.size, back.details.height - 8)"
        lengthAdjust="spacingAndGlyphs"
      >
        {{ column }}
      </text>
      <rect :x="back.barcode.x - 6" :y="back.barcode.y - 8" :width="back.barcode.width + 12" :height="back.barcode.height + 14" :fill="RAMUNE_COLOURS.halo" />
      <g :transform="`translate(${back.barcode.x + back.barcode.width} ${back.barcode.y}) rotate(90)`">
        <Ean13Barcode :layout="barcodeLayout" :digits="texts.back.barcode" :color="RAMUNE_COLOURS.ink" />
      </g>
      <text :font-size="back.notice.size">
        <tspan v-for="(line, index) in texts.back.notice" :key="index" :x="back.notice.x" :y="back.notice.y + index * back.notice.leading">{{ line }}</tspan>
      </text>
      <text
        :x="back.date.x"
        :y="back.date.y"
        :font-family="RAMUNE_FONTS.gothicBold.family"
        :font-weight="RAMUNE_FONTS.gothicBold.weight"
        :font-size="back.date.size"
        :textLength="Math.min(textWidth(texts.back.date) * back.date.size, back.date.width)"
        lengthAdjust="spacingAndGlyphs"
      >
        {{ texts.back.date }}
      </text>
    </g>
  </svg>
</template>
