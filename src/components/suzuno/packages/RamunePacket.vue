<script setup lang="ts">
// A packet of あべっ子ラムネ as one SVG in the pixel space of one piece of
// the strip (300 x 370), front or back: the clear film of the seals, the
// band in the colour of the flavour, and the window with the tablets behind
// it. The front shows the character with the fruit, the brand lettering and
// the flavour label; the back shows the small print. The flavour sets the
// colours and the art, the pose the art, from src/lib/suzuno/packages/ramune.ts.
import { useId } from 'vue'
import RamuneLabel from '~/components/suzuno/packages/RamuneLabel.vue'
import RamuneLettering from '~/components/suzuno/packages/RamuneLettering.vue'
import RamuneSeals from '~/components/suzuno/packages/RamuneSeals.vue'
import RecyclingMark from '~/components/suzuno/packages/RecyclingMark.vue'
import type { Side } from '~/lib/suzuno/faces'
import type { PacketTexts, RamuneFlavour, RamunePose } from '~/lib/suzuno/packages/ramune'
import { BACK_LAYOUT, FRONT_LAYOUT, RAMUNE_COLOURS, RAMUNE_FACE, RAMUNE_FONTS, printOffsets, ramuneArt, textWidth, useRamuneFonts } from '~/lib/suzuno/packages/ramune'

const props = withDefaults(defineProps<{
  flavour: RamuneFlavour
  side?: Side
  pose?: RamunePose
  texts: PacketTexts
  /** An image in place of the character and the fruit. */
  art?: string
}>(), {
  side: 'front',
  pose: 1,
})

useRamuneFonts()

const id = useId()
const ids = { title: `${id}-title`, window: `${id}-window` }
const colours = computed(() => RAMUNE_COLOURS.flavours[props.flavour])
const isBack = computed(() => props.side === 'back')
const offsets = computed(() => printOffsets(props.flavour, props.side, props.pose))
const artBox = computed(() => ({ ...ramuneArt(props.flavour, props.pose), ...(props.art ? { href: props.art } : {}) }))
const { band, logo, label, juice, note, rim, tablets } = FRONT_LAYOUT
const back = BACK_LAYOUT
// The back of the film shows the window of the back print, which is the window of the front mirrored
const windowTransform = computed(() => isBack.value ? `translate(${RAMUNE_FACE.width} 0) scale(-1 1)` : undefined)
const BACK_LOGO_SPLIT = 4
const detailColumns = computed(() => {
  const { x, width, size } = back.details
  return props.texts.back.details.map((column, index) => ({ column, x: x + width - (index + 0.5) * size * 1.25 }))
})
</script>

<template>
  <svg class="block h-auto w-full" :viewBox="`0 0 ${RAMUNE_FACE.width} ${RAMUNE_FACE.height}`" role="img" :aria-labelledby="ids.title">
    <title :id="ids.title">{{ texts.logo }} {{ texts.flavour }}{{ texts.suffix }}</title>
    <defs>
      <clipPath :id="ids.window">
        <path :d="FRONT_LAYOUT.window" />
      </clipPath>
    </defs>
    <RamuneSeals :mirrored="isBack" />
    <g :transform="`translate(${offsets.window[0]} ${offsets.window[1]})`">
      <g :transform="windowTransform">
        <rect :x="-RAMUNE_FACE.width" :y="band.top" :width="3 * RAMUNE_FACE.width" :height="band.bottom - band.top" :fill="colours.band" />
        <g :clip-path="`url(#${ids.window})`">
          <path :d="FRONT_LAYOUT.window" :fill="RAMUNE_COLOURS.window" />
          <ellipse v-for="([cx, cy, rx, ry], index) in tablets" :key="index" :cx="cx" :cy="cy" :rx="rx" :ry="ry" :fill="colours.tablet" />
          <path :d="FRONT_LAYOUT.window" fill="none" :stroke="RAMUNE_COLOURS.rim" :stroke-width="2 * rim" />
        </g>
      </g>
    </g>
    <image v-if="!isBack" :href="artBox.href" :x="artBox.x" :y="artBox.y" :width="artBox.width" :height="artBox.height" preserveAspectRatio="none" />
    <g v-if="!isBack" :transform="`translate(${offsets.print[0]} ${offsets.print[1]})`">
      <RamuneLettering :text="texts.logo" v-bind="logo" :colours="RAMUNE_COLOURS.logo" />
      <RamuneLabel :flavour="texts.flavour" :suffix="texts.suffix" :colour="colours.label" :layout="label" />
      <RamuneLettering :text="texts.juice" v-bind="juice" :colours="RAMUNE_COLOURS.juice" font="gothicBold" anchor="end" />
      <text :font-family="RAMUNE_FONTS.gothicBold.family" :font-weight="RAMUNE_FONTS.gothicBold.weight" :font-size="note.size" :fill="RAMUNE_COLOURS.juice">
        <tspan v-for="(line, index) in texts.note" :key="index" :x="note.x" :y="note.y + index * note.leading">{{ line }}</tspan>
      </text>
    </g>
    <g v-else :transform="`translate(${offsets.print[0]} ${offsets.print[1]})`">
      <RamuneLettering :text="texts.back.logo[0]" v-bind="back.logo" :colours="RAMUNE_COLOURS.logo" />
      <RamuneLettering :text="texts.back.logo[1]" v-bind="{ ...back.logo, ...back.logoSecond }" :colours="RAMUNE_COLOURS.logo.slice(BACK_LOGO_SPLIT)" />
      <RamuneLabel :flavour="texts.flavour" :suffix="texts.suffix" :colour="colours.label" :layout="back.label" />
      <RamuneLettering :text="texts.back.kind" v-bind="back.kind" :colours="colours.band" font="gothicBold" />
      <g :font-family="RAMUNE_FONTS.gothic.family" :font-weight="RAMUNE_FONTS.gothic.weight" :fill="RAMUNE_COLOURS.ink">
        <g :font-size="back.nutrition.size">
          <text :x="back.nutrition.x" :y="back.nutrition.y">{{ texts.back.nutritionTitle }}</text>
          <rect
            :x="back.nutrition.x"
            :y="back.nutrition.y + back.nutrition.leading / 2"
            :width="back.nutrition.width"
            :height="(texts.back.nutrition.length + 0.5) * back.nutrition.leading"
            fill="none"
            :stroke="RAMUNE_COLOURS.ink"
            stroke-width="0.8"
          />
          <template v-for="(row, index) in texts.back.nutrition" :key="row.heading">
            <text :x="back.nutrition.x + 3" :y="back.nutrition.y + (index + 1.6) * back.nutrition.leading">{{ row.heading }}</text>
            <text :x="back.nutrition.x + back.nutrition.width - 3" :y="back.nutrition.y + (index + 1.6) * back.nutrition.leading" text-anchor="end">{{ row.value }}</text>
          </template>
        </g>
        <g :font-size="back.details.size">
          <rect :x="back.details.x" :y="back.details.y" :width="back.details.width" :height="back.details.height" fill="none" :stroke="RAMUNE_COLOURS.ink" stroke-width="0.8" />
          <text
            v-for="{ column, x } in detailColumns"
            :key="x"
            :x="x"
            :y="back.details.y + 4"
            writing-mode="vertical-rl"
            :textLength="Math.min(textWidth(column) * back.details.size, back.details.height - 8)"
            lengthAdjust="spacingAndGlyphs"
          >
            {{ column }}
          </text>
        </g>
        <text :font-size="back.notice.size">
          <tspan v-for="(line, index) in texts.back.notice" :key="index" :x="back.notice.x" :y="back.notice.y + index * back.notice.leading">{{ line }}</tspan>
        </text>
      </g>
      <RecyclingMark :box="back.recycling" :color="RAMUNE_COLOURS.ink" />
    </g>
  </svg>
</template>
