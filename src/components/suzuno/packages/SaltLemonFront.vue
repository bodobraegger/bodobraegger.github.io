<script setup lang="ts">
// The front of the salt lemon candy bag as one SVG in the pixel space of the
// flat print artwork of the maker (677 x 891): the lemon photograph inside the clear seams,
// the title panel, the logo of the maker, the salt and citric acid badges, the
// banner line, the tagline and the small print, with the hang hole and the
// tear notches cut out.
import { useId } from 'vue'
import lemonPhoto from '~/assets/suzuno/salt-lemon-photo.webp'
import CitricAcidBadge from '~/components/suzuno/packages/CitricAcidBadge.vue'
import KatoLogo from '~/components/suzuno/packages/KatoLogo.vue'
import SaltBadge from '~/components/suzuno/packages/SaltBadge.vue'
import SaltLemonBanner from '~/components/suzuno/packages/SaltLemonBanner.vue'
import SaltLemonTitle from '~/components/suzuno/packages/SaltLemonTitle.vue'
import type { SaltLemonTexts } from '~/lib/suzuno/packages/salt-lemon'
import { SALT_LEMON_FONTS, SALT_LEMON_FRONT, FRONT_COLORS as colors, FRONT_LAYOUT as layout, placePart, useSaltLemonFonts } from '~/lib/suzuno/packages/salt-lemon'

withDefaults(defineProps<{
  texts: SaltLemonTexts
  /** The photograph behind the print. */
  photo?: string
}>(), {
  photo: lemonPhoto,
})

useSaltLemonFonts()

const id = useId()
const ids = { label: `${id}-label`, cut: `${id}-cut` }
const FACE = SALT_LEMON_FRONT

const { y: notchY, depth: notchDepth, height: notchHeight } = layout.notches
const notchPaths = [
  `M0 ${notchY - notchHeight / 2} L${notchDepth} ${notchY} L0 ${notchY + notchHeight / 2}Z`,
  `M${FACE.width} ${notchY - notchHeight / 2} L${FACE.width - notchDepth} ${notchY} L${FACE.width} ${notchY + notchHeight / 2}Z`,
]
</script>

<template>
  <svg class="block h-auto w-full" :viewBox="`0 0 ${FACE.width} ${FACE.height}`" role="img" :aria-labelledby="ids.label">
    <title :id="ids.label">{{ texts.kanji }}{{ texts.name }}{{ texts.kind }}</title>
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
        <image :href="photo" v-bind="layout.print" preserveAspectRatio="xMidYMid slice" data-part="photo" />
      </svg>
      <SaltLemonTitle v-bind="layout.title" :texts="texts" data-part="title" />
      <KatoLogo :transform="placePart(layout.logo)" :name="texts.logo.name" :tagline="texts.logo.tagline" data-part="logo" />
      <CitricAcidBadge :transform="placePart(layout.acidBadge)" :texts="texts.acidBadge" data-part="acid-badge" />
      <SaltBadge :transform="placePart(layout.saltBadge)" :lines="texts.saltBadge" data-part="salt-badge" />
      <SaltLemonBanner :transform="placePart(layout.banner)" :text="texts.banner" data-part="banner" />
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
