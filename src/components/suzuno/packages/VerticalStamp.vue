<script setup lang="ts">
// A square stamp with vertical text, like 地釜炊き on the Almond Caramel bag:
// a frame with rounded corners and columns of characters, read from top to
// bottom and from the right column to the left one. It fills the box x, y,
// width, height of its parent.
import type { PrintFont, StampLayout } from '~/lib/suzuno/packages/almond-caramel'
import { ALMOND_CARAMEL_FONTS } from '~/lib/suzuno/packages/almond-caramel'
import { useWebFonts } from '~/lib/suzuno/packages/lettering'

const props = withDefaults(defineProps<{
  layout: StampLayout
  /** The columns from right to left. */
  columns: string[]
  color: string
  font?: PrintFont
}>(), {
  font: () => ALMOND_CARAMEL_FONTS.marker,
})

useWebFonts(() => [props.font])

// The characters fill the frame in equal cells; each sits in the middle of its cell
const characters = computed(() => {
  const { x, y, width, height } = props.layout
  const columnWidth = width / props.columns.length
  return props.columns.flatMap((column, columnIndex) => {
    const cells = [...column]
    const cellHeight = height / cells.length
    return cells.map((character, rowIndex) => ({
      character,
      x: x + width - (columnIndex + 0.5) * columnWidth,
      y: y + (rowIndex + 0.5) * cellHeight,
    }))
  })
})
</script>

<template>
  <g :fill="color">
    <rect
      :x="layout.x + layout.stroke / 2"
      :y="layout.y + layout.stroke / 2"
      :width="layout.width - layout.stroke"
      :height="layout.height - layout.stroke"
      :rx="layout.radius"
      fill="none"
      :stroke="color"
      :stroke-width="layout.stroke"
    />
    <text
      v-for="(item, index) in characters"
      :key="index"
      :x="item.x"
      :y="item.y"
      text-anchor="middle"
      dominant-baseline="central"
      :font-family="font.family"
      :font-weight="font.weight"
      :font-size="layout.size"
    >
      {{ item.character }}
    </text>
  </g>
</template>
