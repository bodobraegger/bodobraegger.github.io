<script setup lang="ts">
// The flavour label of a packet of あべっ子ラムネ: a rounded box in the colour
// of the flavour with a white border, and white letters with a dark edge,
// the suffix 味 smaller. The box grows with the text from its right end
// (`right`) or from its left end (`left`).
import { RAMUNE_COLOURS, textWidth } from '~/lib/suzuno/packages/ramune'
import RamuneLettering from '~/components/suzuno/packages/RamuneLettering.vue'

const props = defineProps<{
  flavour: string
  suffix: string
  colour: string
  layout: {
    right?: number
    left?: number
    y: number
    height: number
    size: number
    /** The width of the letters, relative to their size. */
    stretch: number
    /** The size of the suffix, relative to the flavour. */
    suffix: number
    padding: number
    radius: number
    border: number
    edge: number
  }
}>()

const flavourWidth = computed(() => textWidth(props.flavour) * props.layout.size * props.layout.stretch)
const suffixWidth = computed(() => textWidth(props.suffix) * props.layout.size * props.layout.suffix * props.layout.stretch)
const box = computed(() => {
  const { left, right = 0, y, height, padding } = props.layout
  const width = flavourWidth.value + suffixWidth.value + 2 * padding
  return { x: left ?? right - width, y, width, height }
})
// The baseline of the letters, so that the em box sits in the middle of the label
const baseline = computed(() => box.value.y + box.value.height / 2 + props.layout.size * 0.36)
</script>

<template>
  <g>
    <rect v-bind="box" :rx="layout.radius" :fill="colour" :stroke="RAMUNE_COLOURS.halo" :stroke-width="layout.border" />
    <RamuneLettering
      v-if="flavour"
      :text="flavour"
      :x="box.x + layout.padding"
      :y="baseline"
      :size="layout.size"
      :width="flavourWidth"
      :stretch="layout.stretch"
      :colours="RAMUNE_COLOURS.halo"
      :edge="layout.edge"
      font="label"
    />
    <RamuneLettering
      v-if="suffix"
      :text="suffix"
      :x="box.x + layout.padding + flavourWidth"
      :y="baseline"
      :size="layout.size * layout.suffix"
      :width="suffixWidth"
      :stretch="layout.stretch"
      :colours="RAMUNE_COLOURS.halo"
      :edge="layout.edge * layout.suffix"
      font="label"
    />
  </g>
</template>
