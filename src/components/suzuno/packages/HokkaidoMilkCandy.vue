<script setup lang="ts">
// One wrapped RIBON milk candy, as one SVG in the pixel space of a face of the
// photo (front 236 x 168, back 256 x 156): a white pillow of film between two
// crimped ends with serrated cut edges. The front shows the kana line, 北海道
// and a small cow; the back shows the same lines, the プラ recycling mark and
// the fin seal folded across its lower half. The ground around the candy is
// transparent.
import { useId } from 'vue'
import RecyclingMark from '~/components/suzuno/packages/RecyclingMark.vue'
import SealBand from '~/components/suzuno/packages/SealBand.vue'
import SerratedEdge from '~/components/suzuno/packages/SerratedEdge.vue'
import type { HokkaidoMilkCandyTexts } from '~/lib/suzuno/packages/hokkaido-milk'
import { HOKKAIDO_MILK_FACES, HOKKAIDO_MILK_FONTS, HOKKAIDO_MILK_LAYOUT, placePart, sealRidges, useHokkaidoMilkFonts } from '~/lib/suzuno/packages/hokkaido-milk'

const props = defineProps<{
  face: 'front' | 'back'
  texts: HokkaidoMilkCandyTexts
  /** The small picture of the front. */
  illustration?: string
}>()

useHokkaidoMilkFonts()

const key = computed(() => (props.face === 'front' ? 'candyFront' : 'candyBack'))
const size = computed(() => HOKKAIDO_MILK_FACES[key.value])
const layout = computed(() => HOKKAIDO_MILK_LAYOUT[key.value])
const parts = computed(() => layout.value.parts)
const inks = computed(() => layout.value.inks)

// The pillow between the ends: its corners and how far its long sides bow inwards
const BODY = {
  front: { left: 40, right: 198, top: 22, bottom: 150, bow: 5 },
  back: { left: 50, right: 205, top: 22, bottom: 140, bow: 5 },
}
// The ends: their width to the tips of the teeth and their height
const END = {
  front: { width: 33, height: 136 },
  back: { width: 36, height: 128 },
}
const MINCHO_SIZE = 100 / 0.88
const COW = { width: 100, height: 67.5 }
const FIN = { length: 155, ridges: sealRidges(22, 3) }
const RECYCLING_MARK = { x: -11, y: -9, width: 22, height: 19 }

const body = computed(() => BODY[props.face])
const end = computed(() => END[props.face])
const outline = computed(() => {
  const { left, right, top, bottom, bow } = body.value
  const middle = (left + right) / 2
  return `M${left} ${top}Q${middle} ${top + bow} ${right} ${top}L${right} ${bottom}Q${middle} ${bottom - bow} ${left} ${bottom}Z`
})

const id = useId()
const shadeId = `${id}-shade`
const titleId = `${id}-title`
</script>

<template>
  <svg class="block h-auto w-full" :viewBox="`0 0 ${size.width} ${size.height}`" role="img" :aria-labelledby="titleId">
    <title :id="titleId">{{ texts.subtitle }} {{ texts.title }}, wrapper {{ face }}</title>
    <linearGradient :id="shadeId" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" :stop-color="inks.shade" />
      <stop offset="0.3" :stop-color="inks.film" />
      <stop offset="0.85" :stop-color="inks.film" />
      <stop offset="1" :stop-color="inks.shade" />
    </linearGradient>
    <g :transform="placePart(parts.body)">
      <path :d="outline" :fill="`url(#${shadeId})`" />
    </g>
    <SerratedEdge
      :transform="placePart(parts.leftEnd)"
      :width="end.width"
      :height="end.height"
      :film="inks.film"
      :light="inks['seal-light']"
      :dark="inks['seal-dark']"
    />
    <SerratedEdge
      :transform="placePart(parts.rightEnd)"
      :width="end.width"
      :height="end.height"
      :film="inks.film"
      :light="inks['seal-light']"
      :dark="inks['seal-dark']"
    />
    <g :font-family="HOKKAIDO_MILK_FONTS.mincho" font-weight="900" text-anchor="middle" :font-size="MINCHO_SIZE" :fill="inks.text">
      <text :transform="placePart(parts.subtitle)">{{ texts.subtitle }}</text>
      <text :transform="placePart(parts.title)">{{ texts.title }}</text>
    </g>
    <image
      v-if="face === 'front' && illustration"
      :transform="placePart(parts.cow)"
      :href="illustration"
      :width="COW.width"
      :height="COW.height"
      style="filter: grayscale(1) contrast(1.6)"
    />
    <g v-if="face === 'back'" :transform="placePart(parts.recycling)">
      <RecyclingMark :box="RECYCLING_MARK" :material="texts.recycling" :color="inks.text" />
    </g>
    <SealBand v-if="face === 'back'" :transform="placePart(parts.fin)" :layout="FIN.ridges" :width="FIN.length" :fill="inks.film" :colors="inks" />
  </svg>
</template>
