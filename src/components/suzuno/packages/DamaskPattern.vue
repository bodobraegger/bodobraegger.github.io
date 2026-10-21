<script setup lang="ts">
// The damask of the Almond Caramel bag as an SVG <pattern>: a symmetric motif
// of a crown, fronds, a drop and curls, repeated in a half-drop, so that each
// row is moved by half a tile against the row above. The tile has one motif
// at its corners and one in its middle. Put the component into <defs> and
// fill a shape with url(#id).
import type { DamaskLayout } from '~/lib/suzuno/packages/almond-caramel'

defineProps<DamaskLayout & {
  id: string
  color: string
}>()

const TILE = { width: 176, height: 140 }
// The motif is drawn a little smaller than the print
const MOTIF_SCALE = 1.2
// Copies of the motif that reach into the tile: the corners, the middle, and
// the middles of the rows above and below and of the columns at the sides
const COPIES = [
  [0, 0],
  [TILE.width, 0],
  [0, TILE.height],
  [TILE.width, TILE.height],
  [TILE.width / 2, TILE.height / 2],
  [TILE.width / 2, -TILE.height / 2],
  [TILE.width / 2, 1.5 * TILE.height],
  [-TILE.width / 2, TILE.height / 2],
  [1.5 * TILE.width, TILE.height / 2],
]

// The motif around its middle. The axis parts are symmetric; the side parts
// are drawn for the right half and mirrored.
const AXIS_FILLS = [
  // The middle petal of the crown, the drop and the bud
  'M0 -33C1.6 -30 1.6 -27 0 -24C-1.6 -27 -1.6 -30 0 -33Z',
  'M0 4C3.5 10 3.5 16 0 26C-3.5 16 -3.5 10 0 4Z',
  'M0 34C1.8 37 1.8 40 0 43C-1.8 40 -1.8 37 0 34Z',
]
const AXIS_DOTS = [
  { cx: 0, cy: -15, r: 1.2 },
]
const AXIS_STROKES = [
  // The ring, and the stems between the crown, the ring, the drop and the bud
  'M0 -18.5A3.5 3.5 0 1 1 0 -11.5A3.5 3.5 0 1 1 0 -18.5',
  'M0 -24V-18.5M0 -11.5V4M0 26V34',
]
const SIDE_STROKES = [
  // The curl below the frond, the inner and the outer curl beside the drop,
  // the small curl at the foot, the curl at the tip of the frond, and the
  // curl that reaches towards the next motif
  'M3 -4C8 -8 14 -8 19 -6C25 -4 27 2 24 5C21 8 17 6 17 3C17 1 19 0 21 1',
  'M2.5 12C8 14 13 16 16 19C19 23 17 27 14 27C11 27 10 24 12 22C13 21 15 22 15 23',
  'M10 10C18 8 28 10 34 14C38 17 38 23 34 24C31 25 29 22 31 20C32 19 34 20 34 21',
  'M4 32C10 32 18 30 23 32C27 34 27 39 24 40C21 41 20 38 22 37',
  'M24 -28C30 -32 37 -32 40 -28C43 -24 41 -19 37 -19C34 -19 33 -22 35 -23',
  'M36 24C42 30 50 32 55 28C59 25 57 19 53 20C50 21 51 25 54 25',
]
const SIDE_FILLS = [
  // The side petal of the crown, the frond and the side leaf
  'M0.5 -25C1.5 -28 3 -30.5 5 -31C4.5 -28 3 -26 0.5 -25Z',
  'M2 -9C6 -17 14 -24 24 -28C19 -21 13 -14 8 -7C5 -6 3 -7 2 -9Z',
  'M29 5C35 6 41 10 45 17C39 15 33 11 29 5Z',
]
const SIDE_DOTS = [
  { cx: 7.5, cy: -21, r: 1.2 },
  { cx: 9, cy: -27, r: 1 },
  { cx: 12, cy: 31, r: 1 },
  { cx: 40, cy: 2, r: 1 },
]
const MIRRORS = [1, -1]
</script>

<template>
  <pattern :id="id" patternUnits="userSpaceOnUse" :width="TILE.width" :height="TILE.height" :patternTransform="`translate(${x} ${y}) scale(${scaleX} ${scaleY})`">
    <g v-for="([copyX, copyY], index) in COPIES" :key="index" :transform="`translate(${copyX} ${copyY}) scale(${MOTIF_SCALE})`" :fill="color" :stroke="color">
      <path v-for="d in AXIS_FILLS" :key="d" :d="d" stroke="none" />
      <circle v-for="dot in AXIS_DOTS" :key="dot.cy" v-bind="dot" stroke="none" />
      <path v-for="d in AXIS_STROKES" :key="d" :d="d" fill="none" :stroke-width="stroke / MOTIF_SCALE" />
      <g v-for="mirror in MIRRORS" :key="mirror" :transform="`scale(${mirror} 1)`">
        <path v-for="d in SIDE_STROKES" :key="d" :d="d" fill="none" :stroke-width="stroke / MOTIF_SCALE" stroke-linecap="round" />
        <path v-for="d in SIDE_FILLS" :key="d" :d="d" stroke="none" />
        <circle v-for="dot in SIDE_DOTS" :key="dot.cx" v-bind="dot" stroke="none" />
      </g>
    </g>
  </pattern>
</template>
