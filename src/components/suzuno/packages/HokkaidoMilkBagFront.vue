<script setup lang="ts">
// The print of the front of the RIBON milk candy bag (HokkaidoMilkBag.vue),
// in face pixels: the logo, the stamp, the map with the title lettering,
// the three claims before their milk cans, and the cow before the farm.
import { useId } from 'vue'
import milkCan from '~/assets/suzuno/packages/hokkaido-milk-can.webp'
import cow from '~/assets/suzuno/packages/hokkaido-milk-cow.webp'
import farm from '~/assets/suzuno/packages/hokkaido-milk-farm.webp'
import HokkaidoBadge from '~/components/suzuno/packages/HokkaidoBadge.vue'
import HokkaidoMap from '~/components/suzuno/packages/HokkaidoMap.vue'
import HokkaidoTitle from '~/components/suzuno/packages/HokkaidoTitle.vue'
import MilkStamp from '~/components/suzuno/packages/MilkStamp.vue'
import RibonLogo from '~/components/suzuno/packages/RibonLogo.vue'
import type { FaceLayout, HokkaidoMilkBagTexts } from '~/lib/suzuno/packages/hokkaido-milk'
import { HOKKAIDO_MILK_FONTS, placePart } from '~/lib/suzuno/packages/hokkaido-milk'

const props = withDefaults(defineProps<{
  texts: HokkaidoMilkBagTexts
  layout: FaceLayout
  /** The cow, and the farm behind it. */
  illustration?: string
  landscape?: string
}>(), {
  illustration: cow,
  landscape: farm,
})

// The images in their own units: 100 wide, with the aspect ratio of the default image
const IMAGE_WIDTH = 100
const COW_HEIGHT = 67.5
const FARM_HEIGHT = 26.1
const CAN_HEIGHT = 195
// The pale sky over the farm: a glow that fades out from the middle of the
// horizon at the origin of its part
const SKY_HEIGHT = 20
// Tinos capitals are 0.66 em high, the kana of Noto Serif JP about 0.88 em
const TIMES_SIZE = 100 / 0.66
const MINCHO_SIZE = 100 / 0.88

const parts = computed(() => props.layout.parts)
const inks = computed(() => props.layout.inks)
const spacings = computed(() => props.layout.spacings ?? {})
const BADGES = ['badgeLeft', 'badgeMiddle', 'badgeRight'] as const
const CANS = ['canLeft', 'canMiddle', 'canRight'] as const
const skyId = `${useId()}-sky`
</script>

<template>
  <g>
    <HokkaidoMap :transform="placePart(parts.map)" :color="inks.map" :strokes="inks['map-strokes']" />
    <RibonLogo :transform="placePart(parts.logo)" :name="texts.brand" :color="inks.logo" />
    <MilkStamp
      :transform="placePart(parts.stamp)"
      :top="texts.stamp.top"
      :middle="texts.stamp.middle"
      :middle-suffix="texts.stamp.middleSuffix"
      :bottom="texts.stamp.bottom"
      :color="inks.stamp"
      :paper="inks.film"
    />
    <text
      :transform="placePart(parts.tagline)"
      text-anchor="middle"
      :font-family="HOKKAIDO_MILK_FONTS.times"
      font-weight="700"
      :font-size="TIMES_SIZE"
      :letter-spacing="spacings.tagline"
      :fill="inks.tagline"
    >
      {{ texts.tagline }}
    </text>
    <HokkaidoTitle :transform="placePart(parts.title)" :text="texts.title" :color="inks.title" :shine="inks['title-shine']" />
    <text
      :transform="placePart(parts.subtitle)"
      text-anchor="middle"
      :font-family="HOKKAIDO_MILK_FONTS.mincho"
      font-weight="900"
      :font-size="MINCHO_SIZE"
      :letter-spacing="spacings.subtitle"
      :fill="inks.subtitle"
    >
      {{ texts.subtitle }}
    </text>
    <image
      v-for="can in CANS"
      :key="can"
      :transform="placePart(parts[can])"
      :href="milkCan"
      :x="-IMAGE_WIDTH / 2"
      :width="IMAGE_WIDTH"
      :height="CAN_HEIGHT"
      preserveAspectRatio="xMidYMin meet"
    />
    <HokkaidoBadge
      v-for="(badge, index) in BADGES"
      :key="badge"
      :transform="placePart(parts[badge])"
      :lines="texts.badges[index] ?? []"
      :color="inks[`${badge}:badge`]"
      :edge="inks['badge-edge']"
      :shadow="inks['badge-shadow']"
    />
    <g :transform="placePart(parts.sky)">
      <radialGradient :id="skyId">
        <stop offset="0" :stop-color="inks.sky" />
        <stop offset="1" :stop-color="inks.sky" stop-opacity="0" />
      </radialGradient>
      <ellipse :cx="IMAGE_WIDTH / 2" cy="0" :rx="IMAGE_WIDTH / 2" :ry="SKY_HEIGHT" :fill="`url(#${skyId})`" />
    </g>
    <image :transform="placePart(parts.farm)" :href="landscape" :width="IMAGE_WIDTH" :height="FARM_HEIGHT" preserveAspectRatio="xMidYMax meet" />
    <image :transform="placePart(parts.cow)" :href="illustration" :width="IMAGE_WIDTH" :height="COW_HEIGHT" preserveAspectRatio="xMidYMax meet" />
  </g>
</template>
