<script setup lang="ts">
// The RIBON bag 北海道 ミルクソフトキャンデー as one SVG in the pixel space of a
// face of the photos (front 526 x 733, back 518 x 712): the white film with
// its crimped seals and hang hole, and the print of the front or the back.
// Each prop replaces one part of the content; the layout comes from the fit
// against the photos (src/lib/suzuno/packages/hokkaido-milk-layout.json).
import { useId } from 'vue'
import HokkaidoMilkBagBack from '~/components/suzuno/packages/HokkaidoMilkBagBack.vue'
import HokkaidoMilkBagFront from '~/components/suzuno/packages/HokkaidoMilkBagFront.vue'
import SealBand from '~/components/suzuno/packages/SealBand.vue'
import PatternFill from '~/components/suzuno/PatternFill.vue'
import type { HokkaidoMilkBagContent } from '~/lib/suzuno/packages/hokkaido-milk'
import { HOKKAIDO_MILK_CONTENT, HOKKAIDO_MILK_FACES, HOKKAIDO_MILK_LAYOUT, placePart, sealRidges } from '~/lib/suzuno/packages/hokkaido-milk'
import type { PatternFillValue } from '~/lib/suzuno/patterns'

const props = withDefaults(defineProps<Partial<HokkaidoMilkBagContent> & {
  face?: 'front' | 'back'
  /** Layers of patterns (src/lib/suzuno/patterns/) on the film, under the print; by default the plain film. */
  pattern?: PatternFillValue
  /** A detail of the face, for example '0 0 263 366'. */
  viewBox?: string
}>(), {
  face: 'front',
})

// The ridges of the seals, and the depth of each seal and of the fin seal of the back
const SEALS = {
  front: { top: sealRidges(58, 7), bottom: sealRidges(50, 6) },
  back: { top: sealRidges(75, 9), bottom: sealRidges(37, 5), fin: sealRidges(34, 6) },
}
const FIN_LENGTH = 600
const HOLE_RADIUS = 10

const content = computed<HokkaidoMilkBagContent>(() => {
  const given = Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined))
  return { ...HOKKAIDO_MILK_CONTENT, ...given }
})
const size = computed(() => HOKKAIDO_MILK_FACES[props.face])
const layout = computed(() => HOKKAIDO_MILK_LAYOUT[props.face])
const parts = computed(() => layout.value.parts)
const inks = computed(() => layout.value.inks)
const seals = computed(() => SEALS[props.face])

const titleId = `${useId()}-title`
</script>

<template>
  <svg class="block h-auto w-full" :viewBox="viewBox ?? `0 0 ${size.width} ${size.height}`" role="img" :aria-labelledby="titleId">
    <title :id="titleId">{{ content.brand }} {{ content.title }} {{ content.subtitle }}, {{ face }}</title>
    <rect :width="size.width" :height="size.height" :fill="inks.film" />
    <PatternFill v-if="pattern" inline :pattern="pattern" :box="{ x: 0, y: 0, ...size }" />
    <HokkaidoMilkBagFront v-if="face === 'front'" :content="content" :layout="layout" />
    <HokkaidoMilkBagBack v-else :content="content" :layout="layout" />
    <SealBand :transform="placePart(parts.topSeal)" :layout="seals.top" :width="size.width / parts.topSeal.scale" :fill="inks.film" :colors="inks" data-part="topSeal" />
    <SealBand :transform="placePart(parts.bottomSeal)" :layout="seals.bottom" :width="size.width / parts.bottomSeal.scale" :fill="inks.film" :colors="inks" data-part="bottomSeal" />
    <SealBand v-if="'fin' in seals" :transform="placePart(parts.finSeal)" :layout="seals.fin" :width="FIN_LENGTH / parts.finSeal.scale" :fill="inks.film" :colors="inks" data-part="finSeal" />
    <circle :transform="placePart(parts.hole)" :r="HOLE_RADIUS" :fill="inks.hole" data-part="hole" />
  </svg>
</template>
