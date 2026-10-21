<script setup lang="ts">
// A ribbon banner: an arched band with text along its middle, and two tails
// with a swallowtail notch, which come out from behind the band ends. The
// part of each tail that turns under the band end is darker. In its own
// coordinates: the middle of the top edge of the band at the origin. Place it
// with placementTransform (src/lib/suzuno/packages/almond-caramel.ts).
import { useId } from 'vue'
import type { RibbonLayout } from '~/lib/suzuno/packages/almond-caramel'
import { ALMOND_CARAMEL_FONTS } from '~/lib/suzuno/packages/almond-caramel'
import { useWebFonts } from '~/lib/suzuno/packages/lettering'

const props = defineProps<{
  layout: RibbonLayout
  text: string
  color: string
  /** The colour of the folds under the band ends. */
  fold: string
  outline: string
  textColor: string
}>()

const font = ALMOND_CARAMEL_FONTS.rounded
useWebFonts(font)

const id = useId()
const textPathId = `${id}-text`

/** A curve parallel to the top edge of the band, dy lower. */
function arc(dy: number, reverse = false) {
  const { width, arch } = props.layout
  const [start, end] = reverse ? [width / 2, -width / 2] : [-width / 2, width / 2]
  return `${start} ${arch + dy}Q0 ${dy - arch} ${end} ${arch + dy}`
}

const band = computed(() => `M${arc(0)}L${arc(props.layout.height, true)}Z`)
const textPath = computed(() => `M${arc(props.layout.text.dy)}`)

// Each tail starts under the band end, at a third of its height, and runs out
// and down; side is -1 for the left tail and 1 for the right one
const tails = computed(() => [-1, 1].map((side) => {
  const { width, height, arch, reach, drop, tail, notch, fold } = props.layout
  const inner = side * (width / 2 - fold)
  const end = side * (width / 2)
  const outer = side * (width / 2 + reach)
  const top = arch + height / 3
  // The y of the top edge of the tail at a given x
  const topAt = (x: number) => top + (drop - top) * (x - inner) / (outer - inner)
  return {
    tail: `M${inner} ${top}L${outer} ${drop}L${outer - side * notch} ${drop + tail / 2}L${outer} ${drop + tail}L${inner} ${top + tail}Z`,
    fold: `M${inner} ${top}L${end} ${topAt(end)}L${end} ${topAt(end) + tail}L${inner} ${top + tail}Z`,
  }
}))
const textTransform = computed(() => {
  const { dy, slant } = props.layout.text
  return `translate(0 ${dy}) skewX(${slant}) translate(0 ${-dy})`
})
</script>

<template>
  <g :stroke="outline" :stroke-width="layout.outline" stroke-linejoin="round">
    <defs>
      <path :id="textPathId" :d="textPath" />
    </defs>
    <g v-for="(item, index) in tails" :key="index">
      <path :d="item.tail" :fill="color" />
      <path :d="item.fold" :fill="fold" />
    </g>
    <path :d="band" :fill="color" data-part="band" />
    <text
      :transform="textTransform"
      :font-family="font.family"
      :font-weight="font.weight"
      :font-size="layout.text.size / font.capHeight"
      :letter-spacing="layout.text.tracking"
      :fill="textColor"
      stroke="none"
      text-anchor="middle"
    >
      <textPath :href="`#${textPathId}`" startOffset="50%">
        {{ text }}
      </textPath>
    </text>
  </g>
</template>
