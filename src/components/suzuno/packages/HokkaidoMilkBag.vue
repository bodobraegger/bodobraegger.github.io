<script setup lang="ts">
// The RIBON bag 北海道 ミルクソフトキャンデー as one SVG in the pixel space of a
// face of the photos (front 526 x 733, back 518 x 712): the white film with
// its crimped seals and hang hole, and the print of the front or the back.
// The layout comes from the fit against the photos
// (src/lib/suzuno/packages/hokkaido-milk-layout.json).
import { useId } from 'vue'
import HokkaidoMilkBagBack from '~/components/suzuno/packages/HokkaidoMilkBagBack.vue'
import HokkaidoMilkBagFront from '~/components/suzuno/packages/HokkaidoMilkBagFront.vue'
import SealBand from '~/components/suzuno/packages/SealBand.vue'
import type { HokkaidoMilkBagTexts } from '~/lib/suzuno/packages/hokkaido-milk'
import { HOKKAIDO_MILK_FACES, HOKKAIDO_MILK_LAYOUT, placePart, sealRidges } from '~/lib/suzuno/packages/hokkaido-milk'

const props = defineProps<{
  face: 'front' | 'back'
  texts: HokkaidoMilkBagTexts
  /** Smaller copies of the cow and the farm of the front. */
  illustration?: string
  landscape?: string
}>()

// The ridges of the seals, and the depth of each seal and of the fin seal of the back
const SEALS = {
  front: { top: sealRidges(58, 7), bottom: sealRidges(50, 6) },
  back: { top: sealRidges(75, 9), bottom: sealRidges(37, 5), fin: sealRidges(34, 6) },
}
const FIN_LENGTH = 600
const HOLE_RADIUS = 10

const size = computed(() => HOKKAIDO_MILK_FACES[props.face])
const layout = computed(() => HOKKAIDO_MILK_LAYOUT[props.face])
const parts = computed(() => layout.value.parts)
const inks = computed(() => layout.value.inks)
const seals = computed(() => SEALS[props.face])

const titleId = `${useId()}-title`
</script>

<template>
  <svg class="block h-auto w-full" :viewBox="`0 0 ${size.width} ${size.height}`" role="img" :aria-labelledby="titleId">
    <title :id="titleId">{{ texts.brand }} {{ texts.title }} {{ texts.subtitle }}, {{ face }}</title>
    <rect :width="size.width" :height="size.height" :fill="inks.film" />
    <HokkaidoMilkBagFront v-if="face === 'front'" :texts="texts" :layout="layout" :illustration="illustration" :landscape="landscape" />
    <HokkaidoMilkBagBack v-else :texts="texts" :layout="layout" />
    <SealBand :transform="placePart(parts.topSeal)" :layout="seals.top" :width="size.width / parts.topSeal.scale" :fill="inks.film" :colors="inks" />
    <SealBand :transform="placePart(parts.bottomSeal)" :layout="seals.bottom" :width="size.width / parts.bottomSeal.scale" :fill="inks.film" :colors="inks" />
    <SealBand v-if="'fin' in seals" :transform="placePart(parts.finSeal)" :layout="seals.fin" :width="FIN_LENGTH / parts.finSeal.scale" :fill="inks.film" :colors="inks" />
    <circle :transform="placePart(parts.hole)" :r="HOLE_RADIUS" :fill="inks.hole" />
  </svg>
</template>
