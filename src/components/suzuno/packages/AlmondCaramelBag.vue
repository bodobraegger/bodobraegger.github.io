<script setup lang="ts">
// A side of the Almond Caramel bag (筑豊製菓, 80 g) as one SVG in the pixel
// space of its face (558 x 777): the seal bands with a dark and a green line,
// the yellow panel with the damask pattern, the oval label, the ribbon, the
// almonds, and the window that shows the caramels. The front has the stamp
// and the printed date; the back has the greeting, the food label, the
// nutrition table, the recycling marks and the barcode, under a smaller copy
// of the label. Each text, colour and image is a prop. The slot "window"
// replaces the photo of the caramels, in face pixels; the print covers all
// of the face except the windows. The prop `pattern` replaces the damask of
// the panel with other layers of patterns (src/lib/suzuno/patterns/).
import { useId } from 'vue'
import almondsPhoto from '~/assets/suzuno/almond-caramel-almonds.webp'
import windowFront from '~/assets/suzuno/almond-caramel-window-front.webp'
import windowBack from '~/assets/suzuno/almond-caramel-window-back.webp'
import AlmondCaramelLabel from '~/components/suzuno/packages/AlmondCaramelLabel.vue'
import DamaskPattern from '~/components/suzuno/packages/DamaskPattern.vue'
import Ean13Barcode from '~/components/suzuno/packages/Ean13Barcode.vue'
import PatternFill from '~/components/suzuno/PatternFill.vue'
import LabelTable from '~/components/suzuno/packages/LabelTable.vue'
import RecyclingMark from '~/components/suzuno/packages/RecyclingMark.vue'
import RibbonBanner from '~/components/suzuno/packages/RibbonBanner.vue'
import SealBand from '~/components/suzuno/packages/SealBand.vue'
import VerticalStamp from '~/components/suzuno/packages/VerticalStamp.vue'
import type { AlmondCaramelBagLayout, AlmondCaramelColors, AlmondCaramelSide, AlmondCaramelTexts, ImagePlace } from '~/lib/suzuno/packages/almond-caramel'
import { ALMOND_CARAMEL_BAG, ALMOND_CARAMEL_BAG_DESIGNS, ALMOND_CARAMEL_FONTS, ALMOND_CARAMEL_TEXTS, blockLines, placementTransform, textAttributes } from '~/lib/suzuno/packages/almond-caramel'
import { useWebFonts } from '~/lib/suzuno/packages/lettering'
import type { PatternFillValue } from '~/lib/suzuno/patterns'

const props = withDefaults(defineProps<{
  side?: AlmondCaramelSide
  /** Texts that replace the texts of the bag of the photos. */
  texts?: Partial<AlmondCaramelTexts>
  /** Colours that replace the fitted colours of the side. */
  colors?: Partial<AlmondCaramelColors>
  /** The places of all parts; by default the fitted layout of the side. */
  layout?: AlmondCaramelBagLayout
  /** The image of the almonds with their leaves, with a transparent ground. */
  almonds?: string
  /** The image in the windows, placed at layout.window. */
  windowImage?: string
  /** The pattern on the ground of the panel; by default the damask. */
  pattern?: PatternFillValue
  /** A detail of the face, for example '0 0 279 400'. */
  viewBox?: string
}>(), {
  side: 'front',
  almonds: almondsPhoto,
})

const WINDOW_IMAGES: Record<AlmondCaramelSide, string> = { front: windowFront, back: windowBack }

const design = computed(() => ALMOND_CARAMEL_BAG_DESIGNS[props.side])
const layout = computed(() => props.layout ?? design.value.layout)
const colors = computed(() => ({ ...design.value.colors, ...props.colors }))
const texts = computed(() => ({ ...ALMOND_CARAMEL_TEXTS, ...props.texts }))

const fonts = ALMOND_CARAMEL_FONTS
useWebFonts(() => [fonts.gothic])

const id = useId()
const ids = { title: `${id}-title`, damask: `${id}-damask`, panel: `${id}-panel`, pattern: `${id}-pattern` }
const FACE_BOX = { x: 0, y: 0, ...ALMOND_CARAMEL_BAG }

/** The panel with its windows cut out. */
const panelPath = computed(() => {
  const { top, bottom } = layout.value.panel
  const outline = `M0 ${top}H${ALMOND_CARAMEL_BAG.width}V${bottom}H0Z`
  return outline + layout.value.windows.map(box => `M${box.x} ${box.y}h${box.width}v${box.height}h${-box.width}Z`).join('')
})

function imageTransform(place: ImagePlace) {
  return `rotate(${place.rotate} ${place.x + place.width / 2} ${place.y + place.height / 2})`
}

const dateLines = computed(() => layout.value.dates && blockLines(layout.value.dates, 2))
const greetingLines = computed(() => layout.value.greeting && blockLines(layout.value.greeting, texts.value.greeting.length))
const recyclingLines = computed(() => layout.value.recycling && blockLines(layout.value.recycling.lines, texts.value.recycling.length))
const sortingLines = computed(() => layout.value.recycling && blockLines(layout.value.recycling.sorting, texts.value.sorting.length))
const footnoteLines = computed(() => layout.value.footnote && blockLines(layout.value.footnote, texts.value.footnote.length))
const homepageLines = computed(() => layout.value.homepage && blockLines(layout.value.homepage, texts.value.homepage.length))
</script>

<template>
  <svg class="block h-auto w-full" :viewBox="viewBox ?? `0 0 ${ALMOND_CARAMEL_BAG.width} ${ALMOND_CARAMEL_BAG.height}`" role="img" :aria-labelledby="ids.title">
    <title :id="ids.title">{{ texts.name }} {{ texts.spaced }}, {{ texts.ribbon }}, {{ side }}</title>
    <defs>
      <DamaskPattern :id="ids.damask" :color="colors.damask" v-bind="layout.damask" />
      <pattern v-if="pattern" :id="ids.pattern" patternUnits="userSpaceOnUse" v-bind="FACE_BOX">
        <PatternFill inline :pattern="pattern" :box="FACE_BOX" />
      </pattern>
      <clipPath :id="ids.panel">
        <path :d="panelPath" clip-rule="evenodd" />
      </clipPath>
    </defs>
    <g data-part="window">
      <slot name="window">
        <image :href="windowImage ?? WINDOW_IMAGES[side]" v-bind="layout.window" preserveAspectRatio="none" />
      </slot>
    </g>
    <g :clip-path="`url(#${ids.panel})`" data-part="panel">
      <path :d="panelPath" fill-rule="evenodd" :fill="colors.ground" />
      <path :d="panelPath" fill-rule="evenodd" :fill="`url(#${pattern ? ids.pattern : ids.damask})`" data-part="damask" />
      <rect v-for="(box, index) in layout.plain" :key="index" v-bind="box" :fill="colors.ground" />
    </g>
    <SealBand :layout="layout.topBand" :width="ALMOND_CARAMEL_BAG.width" :fill="colors.seal" :colors="colors" data-part="top-band" />
    <SealBand :layout="layout.bottomBand" :width="ALMOND_CARAMEL_BAG.width" :fill="colors.seal" :colors="colors" data-part="bottom-band" />
    <circle :cx="layout.hole.x" :cy="layout.hole.y" :r="layout.hole.radius" :fill="colors.hole" />

    <AlmondCaramelLabel
      :transform="placementTransform(layout.label)"
      :layout="layout.label"
      :intro="texts.intro"
      :name="texts.name"
      :spaced="texts.spaced"
      :sentence="texts.sentence"
      :fill="colors.label"
      :ink="colors.ink"
      :green="colors.green"
      data-part="label"
    />
    <RibbonBanner
      :transform="placementTransform(layout.ribbon)"
      :layout="layout.ribbon"
      :text="texts.ribbon"
      :color="colors.ribbon"
      :fold="colors.ribbonFold"
      :outline="colors.ink"
      :text-color="colors.ribbonText"
      data-part="ribbon"
    />
    <image :href="almonds" v-bind="layout.almonds" :transform="imageTransform(layout.almonds)" preserveAspectRatio="none" data-part="almonds" />

    <template v-if="side === 'front'">
      <VerticalStamp v-if="layout.stamp" :layout="layout.stamp" :columns="texts.stamp" :color="colors.stamp" data-part="stamp" />
      <g v-if="dateLines" :fill="colors.date" data-part="dates">
        <text v-bind="textAttributes(dateLines[0], fonts.gothic)">{{ texts.bestBefore }}</text>
        <text v-bind="textAttributes(dateLines[1], fonts.gothic)">{{ texts.weight }}</text>
      </g>
    </template>

    <g v-else :fill="colors.ink">
      <g v-if="greetingLines" data-part="greeting">
        <text v-for="(line, index) in texts.greeting" :key="index" v-bind="textAttributes(greetingLines[index], fonts.gothic)">{{ line }}</text>
      </g>
      <LabelTable v-if="layout.ingredients" :layout="layout.ingredients" :title="texts.ingredientsTitle" :rows="texts.ingredients" :color="colors.ink" data-part="ingredients" />
      <template v-if="layout.nutrition">
        <LabelTable :layout="layout.nutrition" :title="texts.nutritionTitle" :rows="texts.nutrition" :color="colors.ink" data-part="nutrition" />
        <text v-bind="textAttributes(layout.nutrition.note, fonts.gothic)">{{ texts.nutritionNote }}</text>
      </template>
      <g v-if="layout.recycling && recyclingLines && sortingLines" data-part="recycling">
        <RecyclingMark :box="layout.recycling.mark" :color="colors.ink" />
        <text v-for="(line, index) in texts.recycling" :key="`r${index}`" v-bind="textAttributes(recyclingLines[index], fonts.gothic)">{{ line }}</text>
        <text v-for="(line, index) in texts.sorting" :key="`s${index}`" v-bind="textAttributes(sortingLines[index], fonts.gothic)">{{ line }}</text>
      </g>
      <Ean13Barcode v-if="layout.barcode" :layout="layout.barcode" :digits="texts.barcode" :color="colors.ink" data-part="barcode" />
      <g v-if="footnoteLines" data-part="footnote">
        <text v-for="(line, index) in texts.footnote" :key="index" v-bind="textAttributes(footnoteLines[index], fonts.gothic)">{{ line }}</text>
      </g>
      <g v-if="homepageLines" data-part="homepage">
        <text v-for="(line, index) in texts.homepage" :key="index" v-bind="textAttributes(homepageLines[index], fonts.gothic)">{{ line }}</text>
      </g>
    </g>
  </svg>
</template>
