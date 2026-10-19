<script setup lang="ts">
// The front of the salt lemon candy bag as one SVG in the pixel space of the
// flat print artwork of the maker (677 x 891): the lemon photograph inside the clear seams,
// the title panel, the logo of the maker, the salt and citric acid badges, the
// banner line, the tagline and the small print, with the hang hole and the
// tear notches cut out. Each prop replaces one part; the parts are also
// components of their own. `logoName` and `acidBadge` pass texts on to the
// logo and the citric acid badge.
import { useId } from 'vue'
import lemonPhoto from '~/assets/suzuno/salt-lemon-photo.webp'
import PatternFill from '~/components/suzuno/PatternFill.vue'
import CitricAcidBadge from '~/components/suzuno/packages/CitricAcidBadge.vue'
import KatoLogo from '~/components/suzuno/packages/KatoLogo.vue'
import SaltBadge from '~/components/suzuno/packages/SaltBadge.vue'
import SaltLemonBanner from '~/components/suzuno/packages/SaltLemonBanner.vue'
import SaltLemonTitle from '~/components/suzuno/packages/SaltLemonTitle.vue'
import type { AcidBadgeTexts, BadgeSphere, Box, FrontColors, FrontLayout, FrontParts, FrontTexts, SaltLemonTitleTexts } from '~/lib/suzuno/packages/salt-lemon'
import { FRONT_COLORS, FRONT_LAYOUT, FRONT_PARTS, FRONT_PART_TEXTS, FRONT_TEXTS, SALT_LEMON_FONTS, SALT_LEMON_FRONT, SALT_LEMON_TITLE, placePart, useSaltLemonFonts } from '~/lib/suzuno/packages/salt-lemon'
import type { PatternFillValue } from '~/lib/suzuno/patterns'

const props = withDefaults(defineProps<{
  /** The photograph behind the print, for example an imported WebP. */
  photo?: string
  /** The place of the photograph in face pixels; by default the printed area. It fills the box and is cut to it. */
  photoBox?: Box
  /** Layers of patterns (src/lib/suzuno/patterns/) in the printed area, in place of the photograph. */
  pattern?: PatternFillValue
  title?: SaltLemonTitleTexts
  texts?: FrontTexts
  /** A name in place of the drawn letters of the logo. */
  logoName?: string
  logoTagline?: string
  saltLines?: string[]
  citricAcidMg?: number
  acidBadge?: Partial<AcidBadgeTexts> & { spheres?: [BadgeSphere, BadgeSphere] }
  colors?: FrontColors
  layout?: FrontLayout
  /** The layouts inside the parts. */
  parts?: FrontParts
  /** A detail of the face, for example '0 0 338 445'. */
  viewBox?: string
}>(), {
  photo: lemonPhoto,
  title: () => SALT_LEMON_TITLE,
  texts: () => FRONT_TEXTS,
  logoTagline: FRONT_PART_TEXTS.logoTagline,
  saltLines: () => FRONT_PART_TEXTS.saltLines,
  citricAcidMg: FRONT_PART_TEXTS.citricAcidMg,
  colors: () => FRONT_COLORS,
  layout: () => FRONT_LAYOUT,
  parts: () => FRONT_PARTS,
})

useSaltLemonFonts()

const id = useId()
const ids = { label: `${id}-label`, cut: `${id}-cut` }
const FACE = SALT_LEMON_FRONT

const photoPlace = computed(() => props.photoBox ?? props.layout.print)
const notchPaths = computed(() => {
  const { y, depth, height } = props.layout.notches
  return [
    `M0 ${y - height / 2} L${depth} ${y} L0 ${y + height / 2}Z`,
    `M${FACE.width} ${y - height / 2} L${FACE.width - depth} ${y} L${FACE.width} ${y + height / 2}Z`,
  ]
})
const fullName = computed(() => `${props.title.kanji}${props.title.name}${props.title.kind}`)
</script>

<template>
  <svg class="block h-auto w-full" :viewBox="viewBox ?? `0 0 ${FACE.width} ${FACE.height}`" role="img" :aria-labelledby="ids.label">
    <title :id="ids.label">{{ fullName }}</title>
    <defs>
      <mask :id="ids.cut" maskUnits="userSpaceOnUse" x="0" y="0" :width="FACE.width" :height="FACE.height">
        <rect :width="FACE.width" :height="FACE.height" fill="white" />
        <circle :cx="layout.hangHole.x" :cy="layout.hangHole.y" :r="layout.hangHole.radius" fill="black" />
        <path v-for="notch in notchPaths" :key="notch" :d="notch" fill="black" />
      </mask>
    </defs>
    <g :mask="`url(#${ids.cut})`">
      <rect :width="FACE.width" :height="FACE.height" :fill="colors.film" data-ink="film" />
      <svg v-bind="layout.print" :viewBox="`${layout.print.x} ${layout.print.y} ${layout.print.width} ${layout.print.height}`">
        <PatternFill v-if="pattern" inline :pattern="pattern" :box="layout.print" data-part="photo" />
        <image v-else :href="photo" v-bind="photoPlace" preserveAspectRatio="xMidYMid slice" data-part="photo" />
      </svg>
      <SaltLemonTitle v-bind="layout.title" :texts="title" :panel="colors.panel" :ink="colors.ink" :ruby-outline="colors.edge" :layout="parts.title" data-part="title" />
      <KatoLogo :transform="placePart(layout.logo)" :name="logoName" :tagline="logoTagline" :red="colors.logoRed" :tagline-color="colors.logoRed" :layout="parts.logo" data-part="logo" />
      <CitricAcidBadge v-bind="acidBadge" :transform="placePart(layout.acidBadge)" :citric-acid-mg="citricAcidMg" :disc="colors.acidDisc" :glow="colors.edge" :layout="parts.acidBadge" data-part="acid-badge" />
      <SaltBadge :transform="placePart(layout.saltBadge)" :lines="saltLines" :disc="colors.saltDisc" :waves="colors.saltWaves" :layout="parts.saltBadge" data-part="salt-badge" />
      <SaltLemonBanner :transform="placePart(layout.banner)" :text="texts.banner" :ink="colors.ink" :edge="colors.edge" :layout="parts.banner" data-part="banner" />
      <text
        :x="layout.tagline.x"
        :y="layout.tagline.y"
        text-anchor="middle"
        dominant-baseline="central"
        :font-family="SALT_LEMON_FONTS.rounded.family"
        :font-weight="SALT_LEMON_FONTS.rounded.weight"
        :font-size="layout.tagline.size"
        :fill="colors.ink"
        :stroke="colors.edge"
        :stroke-width="layout.tagline.edge"
        stroke-linejoin="round"
        paint-order="stroke"
        data-part="tagline"
      >
        {{ texts.tagline }}
      </text>
      <g :font-family="SALT_LEMON_FONTS.gothic.family" :fill="colors.notes" dominant-baseline="central" data-part="notes">
        <text :x="layout.notes.left.x" :y="layout.notes.left.y" :font-size="layout.notes.left.size">{{ texts.notes[0] }}</text>
        <text :x="layout.notes.right.x" :y="layout.notes.right.y" :font-size="layout.notes.right.size" text-anchor="end">{{ texts.notes[1] }}</text>
      </g>
    </g>
  </svg>
</template>
