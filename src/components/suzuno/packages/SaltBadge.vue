<script setup lang="ts">
// The round sea salt badge of the salt lemon candy bag: a navy disc with gold
// waves at the top and two lines of lettering, 鳴門の塩 (salt from Naruto) and
// 使用 (used). In its own coordinates the disc has its centre at the origin and
// a radius of 50. Place it with placePart (src/lib/suzuno/packages/salt-lemon.ts).
import { useId } from 'vue'
import type { SaltBadgeLayout, SaltLemonFont } from '~/lib/suzuno/packages/salt-lemon'
import { FRONT_COLORS, FRONT_PARTS, SALT_LEMON_FONTS, useSaltLemonFonts } from '~/lib/suzuno/packages/salt-lemon'

withDefaults(defineProps<{
  lines?: string[]
  disc?: string
  waves?: string
  ink?: string
  font?: SaltLemonFont
  layout?: SaltBadgeLayout
}>(), {
  lines: () => ['鳴門の塩', '使用'],
  disc: FRONT_COLORS.saltDisc,
  waves: FRONT_COLORS.saltWaves,
  ink: '#f5e7ae',
  font: () => SALT_LEMON_FONTS.roundedBold,
  layout: () => FRONT_PARTS.saltBadge,
})

useSaltLemonFonts()

const RADIUS = 50
// Two crests that curl to the right, as crescents on a band, with spray and two stars
const CRESTS = [
  { x: -21, y: -24, radius: 12, hollow: { x: -16, y: -21, radius: 8.5 } },
  { x: 7, y: -28, radius: 16, hollow: { x: 13, y: -24, radius: 11.5 } },
]
const SPRAY = [{ x: 22, y: -26, radius: 3.2 }, { x: -7, y: -21, radius: 2.4 }]
const STARS = [{ x: 24, y: -40, radius: 1.6 }, { x: 36, y: -27, radius: 1.4 }]
const BAND = { top: -16, bottom: -11 }

const clipId = `${useId()}-disc`

/** A circle with a round hole, for the even-odd rule. */
function crescent(crest: typeof CRESTS[number]) {
  const circle = (x: number, y: number, radius: number) => `M${x - radius} ${y}a${radius} ${radius} 0 1 0 ${2 * radius} 0a${radius} ${radius} 0 1 0 ${-2 * radius} 0Z`
  return circle(crest.x, crest.y, crest.radius) + circle(crest.hollow.x, crest.hollow.y, crest.hollow.radius)
}
</script>

<template>
  <g>
    <defs>
      <clipPath :id="clipId">
        <circle :r="RADIUS" />
      </clipPath>
    </defs>
    <circle :r="RADIUS" :fill="disc" data-ink="salt-badge" />
    <g :clip-path="`url(#${clipId})`" :fill="waves" data-ink="salt-badge-waves">
      <rect :x="-RADIUS" :y="BAND.top" :width="2 * RADIUS" :height="BAND.bottom - BAND.top" />
      <path v-for="(crest, index) in CRESTS" :key="index" :d="crescent(crest)" fill-rule="evenodd" />
      <circle v-for="(dot, index) in [...SPRAY, ...STARS]" :key="`dot-${index}`" :cx="dot.x" :cy="dot.y" :r="dot.radius" />
    </g>
    <text
      v-for="(line, index) in lines.slice(0, layout.length)"
      :key="index"
      :y="layout[index].y"
      text-anchor="middle"
      dominant-baseline="central"
      :font-family="font.family"
      :font-weight="font.weight"
      :font-size="layout[index].size"
      :textLength="layout[index].width"
      lengthAdjust="spacing"
      :fill="ink"
      data-ink="salt-badge-lettering"
    >
      {{ line }}
    </text>
  </g>
</template>
