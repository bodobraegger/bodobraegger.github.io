<script setup lang="ts">
// A line of the lettering of あべっ子ラムネ: letters with a thin dark edge in a
// white halo, one colour for each letter or one for all. x and y are the
// start of the baseline (or its middle or end, with `anchor`). `stretch`
// widens or narrows the letters, and a text wider than `width` is narrowed
// to it.
import { RAMUNE_COLOURS, RAMUNE_FONTS, textWidth, useRamuneFonts } from '~/lib/suzuno/packages/ramune'

const props = withDefaults(defineProps<{
  text: string
  x: number
  y: number
  size: number
  width: number
  stretch?: number
  /** One colour, or a colour for each letter; the last colour goes on to the letters after it. */
  colours: string | string[]
  halo?: number
  edge?: number
  font?: keyof typeof RAMUNE_FONTS
  anchor?: 'start' | 'middle' | 'end'
}>(), {
  stretch: 1,
  halo: 0,
  edge: 0,
  font: 'display',
  anchor: 'start',
})

useRamuneFonts()

const textLength = computed(() => Math.min(props.width, textWidth(props.text) * props.size * props.stretch))
const letters = computed(() => [...props.text].map((letter, index) => ({
  letter,
  colour: typeof props.colours === 'string' ? props.colours : props.colours[Math.min(index, props.colours.length - 1)],
})))
const attributes = computed(() => ({
  'x': props.x,
  'y': props.y,
  'font-family': RAMUNE_FONTS[props.font].family,
  'font-weight': RAMUNE_FONTS[props.font].weight,
  'font-size': props.size,
  'text-anchor': props.anchor,
  'textLength': textLength.value,
  'lengthAdjust': 'spacingAndGlyphs',
  'stroke-linejoin': 'round',
}))
</script>

<template>
  <g>
    <text v-if="halo" v-bind="attributes" :fill="RAMUNE_COLOURS.halo" :stroke="RAMUNE_COLOURS.halo" :stroke-width="2 * halo">
      {{ text }}
    </text>
    <text v-bind="attributes" :stroke="edge ? RAMUNE_COLOURS.ink : undefined" :stroke-width="edge ? 2 * edge : undefined" paint-order="stroke">
      <tspan v-for="({ letter, colour }, index) in letters" :key="index" :fill="colour">
        {{ letter }}
      </tspan>
    </text>
  </g>
</template>
