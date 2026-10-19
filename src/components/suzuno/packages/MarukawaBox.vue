<script setup lang="ts">
// The face of a MARUKAWA bubble gum box as one SVG in the pixel space of the
// faces of the photos (144 x 136). A version (domestic or export) and a preset
// (melon, strawberry, orange) give a box; each other prop replaces one part
// of it. The front and the back of a box carry the same print. The green band
// across the boxes of the photos is an elastic, not print, so the face leaves it out.
import { useId } from 'vue'
import MarukawaBubbleGum from '~/components/suzuno/packages/MarukawaBubbleGum.vue'
import MarukawaFlavour from '~/components/suzuno/packages/MarukawaFlavour.vue'
import MarukawaLabel from '~/components/suzuno/packages/MarukawaLabel.vue'
import MarukawaLogo from '~/components/suzuno/packages/MarukawaLogo.vue'
import { CAP_HEIGHT, fontSizeForCapHeight, placeLettering, useWebFonts } from '~/lib/suzuno/packages/lettering'
import type { MarukawaLabelText, MarukawaPreset, MarukawaVersion } from '~/lib/suzuno/packages/marukawa'
import { MARUKAWA_FACE, MARUKAWA_PRESETS } from '~/lib/suzuno/packages/marukawa'

const props = withDefaults(defineProps<{
  /** The Japanese box (domestic) or the box with English text of the photos (export). */
  version?: MarukawaVersion
  preset?: MarukawaPreset
  flavour?: string
  flavourColor?: string
  /** The dark edge of the flavour letters; null for none. */
  flavourOutline?: string | null
  /** The box behind the flavour; null for none. */
  highlight?: string | null
  /** The fruit: an image with transparent paper, for example an imported WebP. */
  illustration?: string
  /** The place of the image in face pixels: x, y, width, height. By default it fills the face. */
  illustrationBox?: [number, number, number, number]
  brand?: string
  tagline?: string
  /** The first word of "BUBBLE GUM" (フーセン on the domestic boxes). */
  bubble?: string
  /** The second word of "BUBBLE GUM" (ガム on the domestic boxes). */
  gum?: string
  bubbleColor?: string
  gumColor?: string
  gumOutline?: string | null
  /** The ink of the logo line, the tagline and the ® mark. */
  ink?: string
  paper?: string
  /** The small label; null for none. */
  label?: MarukawaLabelText | null
  /** A detail of the face, for example '0 0 72 68'. */
  viewBox?: string
}>(), {
  version: 'domestic',
  preset: 'melon',
  // undefined keeps the value of the preset; null removes the part
  flavourOutline: undefined,
  highlight: undefined,
  gumOutline: undefined,
  label: undefined,
})

/** The prop when it is given, also when it is null, else the value of the preset. */
function choose<T>(value: T | undefined, fallback: T) {
  return value === undefined ? fallback : value
}

const design = computed(() => {
  const preset = MARUKAWA_PRESETS[props.version][props.preset]
  return {
    ...preset,
    texts: {
      brand: props.brand ?? preset.texts.brand,
      flavour: props.flavour ?? preset.texts.flavour,
      tagline: props.tagline ?? preset.texts.tagline,
      bubble: props.bubble ?? preset.texts.bubble,
      gum: props.gum ?? preset.texts.gum,
    },
    flavourColor: props.flavourColor ?? preset.flavourColor,
    flavourOutline: choose(props.flavourOutline, preset.flavourOutline),
    highlight: choose(props.highlight, preset.highlight),
    bubbleColor: props.bubbleColor ?? preset.bubbleColor,
    gumColor: props.gumColor ?? preset.gumColor,
    gumOutline: choose(props.gumOutline, preset.gumOutline),
    ink: props.ink ?? preset.ink,
    paper: props.paper ?? preset.paper,
    label: choose(props.label, preset.label),
  }
})
const layout = computed(() => design.value.layout)
const fonts = computed(() => design.value.fonts)
const texts = computed(() => design.value.texts)
useWebFonts(() => [fonts.value.tagline])

const illustrationPlace = computed(() => {
  const [x, y, width, height] = props.illustrationBox ?? [0, 0, MARUKAWA_FACE.width, MARUKAWA_FACE.height]
  return { x, y, width, height }
})
/** The widest flavour, in cap heights of the flavour lettering. */
const flavourMaxWidth = computed(() => {
  const { maxWidth, size, squeeze } = layout.value.flavour
  return maxWidth / (size * squeeze)
})
const taglineSize = computed(() => fontSizeForCapHeight(CAP_HEIGHT, fonts.value.tagline.metrics))

const id = useId()
const titleId = `${id}-title`
</script>

<template>
  <svg class="block h-auto w-full" :viewBox="viewBox ?? `0 0 ${MARUKAWA_FACE.width} ${MARUKAWA_FACE.height}`" role="img" :aria-labelledby="titleId">
    <title :id="titleId">{{ texts.brand }} {{ texts.flavour }} {{ texts.bubble }} {{ texts.gum }}</title>
    <rect :width="MARUKAWA_FACE.width" :height="MARUKAWA_FACE.height" :fill="design.paper" data-ink="paper" />
    <image :href="illustration ?? design.illustration" v-bind="illustrationPlace" preserveAspectRatio="xMidYMid meet" data-part="illustration" />
    <MarukawaLogo :transform="placeLettering(layout.logo)" :name="texts.brand" :font="fonts.brand" :color="design.ink" :gap="layout.logo.gap" :mark-scale="layout.logo.markScale" data-part="logo" />
    <MarukawaFlavour
      :transform="placeLettering(layout.flavour)"
      :text="texts.flavour"
      :font="fonts.flavour"
      :color="design.flavourColor"
      :outline="design.flavourOutline"
      :highlight="design.highlight"
      :max-width="flavourMaxWidth"
      data-part="flavour"
    />
    <text
      :transform="placeLettering(layout.tagline)"
      :font-family="fonts.tagline.family"
      :font-weight="fonts.tagline.weight"
      :font-size="taglineSize"
      :fill="design.ink"
      data-part="tagline"
      data-ink="tagline"
    >
      {{ texts.tagline }}
    </text>
    <MarukawaBubbleGum
      :transform="placeLettering(layout.bubbleGum)"
      :bubble="texts.bubble"
      :gum="texts.gum"
      :bubble-font="fonts.bubble"
      :gum-font="fonts.gum"
      :bubble-color="design.bubbleColor"
      :gum-color="design.gumColor"
      :gum-outline="design.gumOutline"
      :gum-scale="layout.bubbleGum.gumScale"
      :gum-gap="layout.bubbleGum.gumGap"
      data-part="bubble-gum"
    />
    <MarukawaLabel v-if="design.label && layout.label" :text="design.label" v-bind="layout.label" :color="design.ink" data-part="label" />
    <g v-if="layout.registered" :transform="`translate(${layout.registered.x} ${layout.registered.y})`" :fill="design.ink" data-part="registered" data-ink="registered">
      <circle :r="layout.registered.radius * 0.9" fill="none" :stroke="design.ink" data-ink="registered" :stroke-width="layout.registered.radius * 0.14" />
      <text :y="layout.registered.radius * 0.45" text-anchor="middle" :font-family="fonts.tagline.family" :font-size="layout.registered.radius * 1.3">
        R
      </text>
    </g>
  </svg>
</template>
