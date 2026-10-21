<script setup lang="ts">
// The citric acid badge of the salt lemon candy bag: a light blue oval with a
// white rim, クエン酸 (citric acid), the amount per bag, and two spheres for
// sodium (Na) and citric acid (C6H8O7) with a plus between them. In its own
// coordinates the oval has its centre at the origin and a horizontal radius of
// 100. Place it with placePart (src/lib/suzuno/packages/salt-lemon.ts).
import { useId } from 'vue'
import type { SaltLemonTexts } from '~/lib/suzuno/packages/salt-lemon'
import { FRONT_COLORS, FRONT_PARTS, SALT_LEMON_FONTS, SALT_LEMON_TEXTS, useSaltLemonFonts } from '~/lib/suzuno/packages/salt-lemon'

const props = defineProps<{
  texts: SaltLemonTexts['acidBadge']
}>()

useSaltLemonFonts()

// The colours of each sphere (the light middle and the dark edge), and the
// width that narrows a long formula. A sphere that the texts leave out keeps
// the texts of the print.
const SPHERES = [
  { colors: ['#3aa6dc', '#0d5c97'] },
  { colors: ['#e868a6', '#a91d63'], width: 34 },
]
const RIM = '#eef6f8'
const INK = '#ffffff'
// The oval: the colours of its middle and its edge, and the blue glow round the white lettering
const { acidDisc: disc, edge: glow } = FRONT_COLORS
const { mincho: font, rounded: captionFont } = SALT_LEMON_FONTS
const layout = FRONT_PARTS.acidBadge

const id = useId()
const discId = `${id}-disc`
const sphereIds = [`${id}-sphere-0`, `${id}-sphere-1`]
const amount = computed(() => props.texts.amount.replace('{mg}', String(props.texts.mg)))
const spheres = computed(() => SPHERES.map((sphere, index) => ({ ...sphere, ...SALT_LEMON_TEXTS.acidBadge.spheres[index], ...props.texts.spheres[index] })))
const sphereXs = [-layout.spheres.spacing, layout.spheres.spacing]

/** A chemical formula with its digits as subscripts, for example C6H8O7. */
function formulaParts(formula: string) {
  return [...formula.matchAll(/(\D+)|(\d+)/g)].map(([text, letters]) => ({ text, subscript: !letters }))
}
</script>

<template>
  <g :font-family="font.family" :font-weight="font.weight">
    <defs>
      <radialGradient :id="discId" cx="0.5" cy="0.4" r="0.6">
        <stop offset="0" :stop-color="disc[0]" />
        <stop offset="1" :stop-color="disc[1]" />
      </radialGradient>
      <radialGradient v-for="(sphere, index) in spheres" :id="sphereIds[index]" :key="index" cx="0.4" cy="0.35" r="0.7">
        <stop offset="0" :stop-color="sphere.colors[0]" />
        <stop offset="1" :stop-color="sphere.colors[1]" />
      </radialGradient>
    </defs>
    <ellipse rx="100" :ry="layout.radiusY" :fill="`url(#${discId})`" :stroke="RIM" :stroke-width="layout.rimWidth" />
    <g :fill="INK" :stroke="glow" :stroke-width="layout.glow" stroke-linejoin="round" paint-order="stroke" text-anchor="middle" dominant-baseline="central">
      <text :y="layout.label.y" :font-size="layout.label.size" :textLength="layout.label.width" lengthAdjust="spacingAndGlyphs">
        {{ texts.label }}
      </text>
      <text :y="layout.amount.y" :font-size="layout.amount.size" :textLength="layout.amount.width" lengthAdjust="spacingAndGlyphs">
        {{ amount }}
      </text>
    </g>
    <g v-for="(sphere, index) in spheres" :key="index" :transform="`translate(${sphereXs[index]} ${layout.spheres.y})`">
      <circle :r="layout.spheres.radius" :fill="`url(#${sphereIds[index]})`" :stroke="RIM" :stroke-width="layout.rimWidth / 2" />
      <text
        :y="layout.spheres.captionY"
        :font-size="layout.spheres.captionSize"
        :font-family="captionFont.family"
        :font-weight="captionFont.weight"
        text-anchor="middle"
        dominant-baseline="central"
        :fill="INK"
      >
        {{ sphere.caption }}
      </text>
      <text
        y="3"
        :font-size="layout.spheres.size"
        text-anchor="middle"
        dominant-baseline="central"
        :fill="INK"
        :textLength="sphere.width"
        lengthAdjust="spacingAndGlyphs"
      >
        <tspan
          v-for="(part, partIndex) in formulaParts(sphere.symbol)"
          :key="partIndex"
          :font-size="part.subscript ? '55%' : undefined"
          :baseline-shift="part.subscript ? '-25%' : undefined"
        >
          {{ part.text }}
        </tspan>
      </text>
    </g>
    <text :y="layout.spheres.y" text-anchor="middle" dominant-baseline="central" :font-size="layout.spheres.size * 0.8" :fill="INK">
      +
    </text>
  </g>
</template>
