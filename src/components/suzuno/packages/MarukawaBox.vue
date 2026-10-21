<script setup lang="ts">
// The face of a MARUKAWA bubble gum box as one SVG in the pixel space of the
// faces of the photos (144 x 136). The front and the back of a box carry the
// same print. The green band across the boxes of the photos is an elastic,
// not print, so the face leaves it out.
import { useId } from 'vue'
import MarukawaBubbleGum from '~/components/suzuno/packages/MarukawaBubbleGum.vue'
import MarukawaFlavour from '~/components/suzuno/packages/MarukawaFlavour.vue'
import MarukawaLabel from '~/components/suzuno/packages/MarukawaLabel.vue'
import MarukawaLogo from '~/components/suzuno/packages/MarukawaLogo.vue'
import { CAP_HEIGHT, fontSizeForCapHeight, placeLettering, useWebFonts } from '~/lib/suzuno/packages/lettering'
import type { MarukawaPreset, MarukawaTexts } from '~/lib/suzuno/packages/marukawa'
import { MARUKAWA_DESIGNS, MARUKAWA_FACE, MARUKAWA_FONTS, MARUKAWA_ILLUSTRATIONS } from '~/lib/suzuno/packages/marukawa'

const props = defineProps<{
  preset: MarukawaPreset
  texts: MarukawaTexts
  /** A smaller copy of the fruit. */
  illustration?: string
}>()

const layout = computed(() => MARUKAWA_DESIGNS[props.preset].layout)
const colours = computed(() => MARUKAWA_DESIGNS[props.preset].colours)
const taglineFont = MARUKAWA_FONTS.helvetica
useWebFonts(() => [taglineFont])

/** The widest flavour, in cap heights of the flavour lettering. */
const flavourMaxWidth = computed(() => {
  const { maxWidth, size, squeeze } = layout.value.flavour
  return maxWidth / (size * squeeze)
})
const taglineSize = fontSizeForCapHeight(CAP_HEIGHT, taglineFont.metrics)

const titleId = `${useId()}-title`
</script>

<template>
  <svg class="block h-auto w-full" :viewBox="`0 0 ${MARUKAWA_FACE.width} ${MARUKAWA_FACE.height}`" role="img" :aria-labelledby="titleId">
    <title :id="titleId">{{ texts.brand }} {{ texts.flavour }} {{ texts.bubble }} {{ texts.gum }}</title>
    <rect :width="MARUKAWA_FACE.width" :height="MARUKAWA_FACE.height" :fill="colours.paper" data-ink="paper" />
    <image :href="illustration ?? MARUKAWA_ILLUSTRATIONS[preset]" x="0" y="0" :width="MARUKAWA_FACE.width" :height="MARUKAWA_FACE.height" preserveAspectRatio="xMidYMid meet" data-part="illustration" />
    <MarukawaLogo :transform="placeLettering(layout.logo)" :name="texts.brand" :color="colours.ink" :gap="layout.logo.gap" :mark-scale="layout.logo.markScale" data-part="logo" />
    <MarukawaFlavour
      :transform="placeLettering(layout.flavour)"
      :text="texts.flavour"
      :color="colours.flavourColor"
      :outline="colours.flavourOutline"
      :highlight="colours.highlight"
      :max-width="flavourMaxWidth"
      data-part="flavour"
    />
    <text
      :transform="placeLettering(layout.tagline)"
      :font-family="taglineFont.family"
      :font-weight="taglineFont.weight"
      :font-size="taglineSize"
      :fill="colours.ink"
      data-part="tagline"
      data-ink="tagline"
    >
      {{ texts.tagline }}
    </text>
    <MarukawaBubbleGum
      :transform="placeLettering(layout.bubbleGum)"
      :bubble="texts.bubble"
      :gum="texts.gum"
      :bubble-color="colours.bubbleColor"
      :gum-color="colours.gumColor"
      :gum-outline="colours.gumOutline"
      :gum-scale="layout.bubbleGum.gumScale"
      :gum-gap="layout.bubbleGum.gumGap"
      data-part="bubble-gum"
    />
    <MarukawaLabel v-if="texts.label && layout.label" :text="texts.label" v-bind="layout.label" :color="colours.ink" data-part="label" />
  </svg>
</template>
