<script setup lang="ts">
// A round postmark seal like "Rich Milk / 濃厚ミルク味 / flavor" of the RIBON
// bag: two rings, a line of text along the top and one along the bottom, a
// band across the middle with the main text, and wavy cancellation lines to
// the right. In its own coordinates: the centre at the origin, an outer
// radius of 100.
import { useId } from 'vue'
import { HOKKAIDO_MILK_FONTS, useHokkaidoMilkFonts } from '~/lib/suzuno/packages/hokkaido-milk'

defineProps<{
  top: string
  bottom: string
  middle: string
  /** Smaller text after the main text, like 味. */
  middleSuffix: string
  color: string
  /** The ground of the band. */
  paper: string
}>()

useHokkaidoMilkFonts()

const RADIUS = 100
const RING = 7
const INNER_RADIUS = 80
const INNER_RING = 4
// The text along the rings sits between them
const TEXT_RADIUS = 66
const RING_TEXT_SIZE = 30
// The band across the middle, turned against the seal
const BAND = { height: 52, width: 230, angle: -12 }
const MIDDLE_SIZE = 38
const WAVE = { count: 4, start: 70, length: 130, spacing: 18, amplitude: 6, period: 32 }

const id = useId()
const topArc = `${id}-top`
const bottomArc = `${id}-bottom`

function wave(index: number) {
  const y = (index - 1) * WAVE.spacing - 20
  let d = `M${WAVE.start} ${y}`
  for (let x = 0; x < WAVE.length; x += WAVE.period / 2)
    d += ` q${WAVE.period / 4} ${(x / (WAVE.period / 2)) % 2 ? WAVE.amplitude : -WAVE.amplitude} ${WAVE.period / 2} 0`
  return d
}
</script>

<template>
  <g :fill="color" :stroke="color">
    <path :id="topArc" :d="`M${-TEXT_RADIUS} 0 A${TEXT_RADIUS} ${TEXT_RADIUS} 0 0 1 ${TEXT_RADIUS} 0`" fill="none" stroke="none" />
    <path :id="bottomArc" :d="`M${-TEXT_RADIUS - 10} 0 A${TEXT_RADIUS + 10} ${TEXT_RADIUS + 10} 0 0 0 ${TEXT_RADIUS + 10} 0`" fill="none" stroke="none" />
    <path v-for="index in WAVE.count" :key="index" :d="wave(index)" fill="none" stroke-width="4" stroke-linecap="round" />
    <circle :r="RADIUS - RING / 2" fill="none" :stroke-width="RING" />
    <circle :r="INNER_RADIUS" fill="none" :stroke-width="INNER_RING" />
    <g stroke="none" :font-family="HOKKAIDO_MILK_FONTS.times" font-weight="700" :font-size="RING_TEXT_SIZE" letter-spacing="2">
      <text text-anchor="middle">
        <textPath :href="`#${topArc}`" startOffset="50%">
          {{ top }}
        </textPath>
      </text>
      <text text-anchor="middle" dominant-baseline="hanging">
        <textPath :href="`#${bottomArc}`" startOffset="50%">
          {{ bottom }}
        </textPath>
      </text>
    </g>
    <g :transform="`rotate(${BAND.angle})`">
      <rect :x="-BAND.width / 2" :y="-BAND.height / 2" :width="BAND.width" :height="BAND.height" :fill="paper" :stroke-width="INNER_RING" />
      <text
        :y="MIDDLE_SIZE * 0.36"
        text-anchor="middle"
        stroke="none"
        :font-family="HOKKAIDO_MILK_FONTS.mincho"
        font-weight="900"
        :font-size="MIDDLE_SIZE"
        :textLength="BAND.width - 30"
        lengthAdjust="spacingAndGlyphs"
      >
        {{ middle }}<tspan :font-size="MIDDLE_SIZE * 0.7">
          {{ middleSuffix }}
        </tspan>
      </text>
    </g>
  </g>
</template>
