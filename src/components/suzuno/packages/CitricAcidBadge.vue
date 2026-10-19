<script setup lang="ts">
// The citric acid badge of the salt lemon candy bag: a light blue oval with a
// white rim, クエン酸 (citric acid), the amount per bag, and two spheres for
// sodium (Na) and citric acid (C6H8O7) with a plus between them. In its own
// coordinates the oval has its centre at the origin and a horizontal radius of
// 100. Place it with placePart (src/lib/suzuno/packages/salt-lemon.ts).
import { useId } from 'vue'
import type { AcidBadgeLayout, BadgeSphere, SaltLemonFont } from '~/lib/suzuno/packages/salt-lemon'
import { FRONT_COLORS, FRONT_PARTS, SALT_LEMON_FONTS, formulaParts, useSaltLemonFonts } from '~/lib/suzuno/packages/salt-lemon'

const props = withDefaults(defineProps<{
  label?: string
  /** The citric acid in one bag, in mg. */
  citricAcidMg?: number
  /** The line of the amount; {mg} stands for citricAcidMg. */
  amountTemplate?: string
  spheres?: [BadgeSphere, BadgeSphere]
  /** The oval: the colours of its middle and its edge, and its rim. */
  disc?: [string, string]
  rim?: string
  ink?: string
  /** The blue glow round the white lettering. */
  glow?: string
  font?: SaltLemonFont
  captionFont?: SaltLemonFont
  layout?: AcidBadgeLayout
}>(), {
  label: 'クエン酸',
  citricAcidMg: 830,
  amountTemplate: '(1袋あたり{mg}mg)',
  spheres: () => [
    { symbol: 'Na', caption: 'ナトリウム', colors: ['#3aa6dc', '#0d5c97'] },
    { symbol: 'C6H8O7', caption: 'クエン酸', colors: ['#e868a6', '#a91d63'], width: 34 },
  ],
  disc: () => FRONT_COLORS.acidDisc,
  rim: '#eef6f8',
  ink: '#ffffff',
  glow: FRONT_COLORS.edge,
  font: () => SALT_LEMON_FONTS.mincho,
  captionFont: () => SALT_LEMON_FONTS.rounded,
  layout: () => FRONT_PARTS.acidBadge,
})

useSaltLemonFonts()

const id = useId()
const discId = `${id}-disc`
const sphereIds = [`${id}-sphere-0`, `${id}-sphere-1`]
const amount = computed(() => props.amountTemplate.replace('{mg}', String(props.citricAcidMg)))
const sphereXs = computed(() => [-props.layout.spheres.spacing, props.layout.spheres.spacing])
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
    <ellipse rx="100" :ry="layout.radiusY" :fill="`url(#${discId})`" :stroke="rim" :stroke-width="layout.rimWidth" data-ink="acid-badge" />
    <g :fill="ink" :stroke="glow" :stroke-width="layout.glow" stroke-linejoin="round" paint-order="stroke" text-anchor="middle" dominant-baseline="central" data-ink="acid-badge-lettering">
      <text :y="layout.label.y" :font-size="layout.label.size" :textLength="layout.label.width" lengthAdjust="spacingAndGlyphs">
        {{ label }}
      </text>
      <text :y="layout.amount.y" :font-size="layout.amount.size" :textLength="layout.amount.width" lengthAdjust="spacingAndGlyphs">
        {{ amount }}
      </text>
    </g>
    <g v-for="(sphere, index) in spheres" :key="index" :transform="`translate(${sphereXs[index]} ${layout.spheres.y})`" data-ink="acid-badge-sphere">
      <circle :r="layout.spheres.radius" :fill="`url(#${sphereIds[index]})`" :stroke="rim" :stroke-width="layout.rimWidth / 2" />
      <text
        :y="layout.spheres.captionY"
        :font-size="layout.spheres.captionSize"
        :font-family="captionFont.family"
        :font-weight="captionFont.weight"
        text-anchor="middle"
        dominant-baseline="central"
        :fill="ink"
      >
        {{ sphere.caption }}
      </text>
      <text
        y="3"
        :font-size="layout.spheres.size"
        text-anchor="middle"
        dominant-baseline="central"
        :fill="ink"
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
    <text :y="layout.spheres.y" text-anchor="middle" dominant-baseline="central" :font-size="layout.spheres.size * 0.8" :fill="ink" data-ink="acid-badge-lettering">
      +
    </text>
  </g>
</template>
