<script setup lang="ts">
// The print of the front of the RIBON milk candy bag (HokkaidoMilkBag.vue),
// in face pixels: the logo, the stamp, the map with the title lettering,
// the three claims before their milk cans, and the cow before the farm.
import HokkaidoBadge from '~/components/suzuno/packages/HokkaidoBadge.vue'
import HokkaidoMap from '~/components/suzuno/packages/HokkaidoMap.vue'
import HokkaidoTitle from '~/components/suzuno/packages/HokkaidoTitle.vue'
import MilkStamp from '~/components/suzuno/packages/MilkStamp.vue'
import RibonLogo from '~/components/suzuno/packages/RibonLogo.vue'
import SkyGlow from '~/components/suzuno/packages/SkyGlow.vue'
import type { FaceLayout, HokkaidoMilkBagContent } from '~/lib/suzuno/packages/hokkaido-milk'
import { HOKKAIDO_MILK_FONTS, placePart } from '~/lib/suzuno/packages/hokkaido-milk'

const props = defineProps<{
  content: HokkaidoMilkBagContent
  layout: FaceLayout
}>()

// The images in their own units: 100 wide, with the aspect ratio of the default image
const IMAGE_WIDTH = 100
const COW_HEIGHT = 67.5
const FARM_HEIGHT = 26.1
const CAN_HEIGHT = 195
// The pale sky over the farm, above the horizon at the origin of its part
const SKY_HEIGHT = 20
// Tinos capitals are 0.66 em high, the kana of Noto Serif JP about 0.88 em
const TIMES_SIZE = 100 / 0.66
const MINCHO_SIZE = 100 / 0.88

const parts = computed(() => props.layout.parts)
const inks = computed(() => props.layout.inks)
const spacings = computed(() => props.layout.spacings ?? {})
const BADGES = ['badgeLeft', 'badgeMiddle', 'badgeRight'] as const
const CANS = ['canLeft', 'canMiddle', 'canRight'] as const
</script>

<template>
  <g>
    <HokkaidoMap :transform="placePart(parts.map)" :color="inks.map" :strokes="inks['map-strokes']" data-part="map" />
    <RibonLogo :transform="placePart(parts.logo)" :name="content.brand" :color="inks.logo" data-part="logo" />
    <MilkStamp
      :transform="placePart(parts.stamp)"
      :top="content.stamp.top"
      :middle="content.stamp.middle"
      :middle-suffix="content.stamp.middleSuffix"
      :bottom="content.stamp.bottom"
      :color="inks.stamp"
      :paper="inks.film"
      data-part="stamp"
    />
    <text
      :transform="placePart(parts.tagline)"
      text-anchor="middle"
      :font-family="HOKKAIDO_MILK_FONTS.times"
      font-weight="700"
      :font-size="TIMES_SIZE"
      :letter-spacing="spacings.tagline"
      :fill="inks.tagline"
      data-part="tagline"
    >
      {{ content.tagline }}
    </text>
    <HokkaidoTitle :transform="placePart(parts.title)" :text="content.title" :color="inks.title" :shine="inks['title-shine']" data-part="title" />
    <text
      :transform="placePart(parts.subtitle)"
      text-anchor="middle"
      :font-family="HOKKAIDO_MILK_FONTS.mincho"
      font-weight="900"
      :font-size="MINCHO_SIZE"
      :letter-spacing="spacings.subtitle"
      :fill="inks.subtitle"
      data-part="subtitle"
    >
      {{ content.subtitle }}
    </text>
    <image
      v-for="can in CANS"
      :key="can"
      :transform="placePart(parts[can])"
      :href="content.can"
      :x="-IMAGE_WIDTH / 2"
      :width="IMAGE_WIDTH"
      :height="CAN_HEIGHT"
      preserveAspectRatio="xMidYMin meet"
      :data-part="can"
    />
    <HokkaidoBadge
      v-for="(badge, index) in BADGES"
      :key="badge"
      :transform="placePart(parts[badge])"
      :lines="content.badges[index] ?? []"
      :color="inks[`${badge}:badge`]"
      :edge="inks['badge-edge']"
      :shadow="inks['badge-shadow']"
      :data-part="badge"
    />
    <SkyGlow :transform="placePart(parts.sky)" :width="IMAGE_WIDTH" :height="SKY_HEIGHT" :color="inks.sky" data-part="sky" />
    <image :transform="placePart(parts.farm)" :href="content.landscape" :width="IMAGE_WIDTH" :height="FARM_HEIGHT" preserveAspectRatio="xMidYMax meet" data-part="farm" />
    <image :transform="placePart(parts.cow)" :href="content.illustration" :width="IMAGE_WIDTH" :height="COW_HEIGHT" preserveAspectRatio="xMidYMax meet" data-part="cow" />
  </g>
</template>
