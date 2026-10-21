<script setup lang='ts'>
import type { Seed } from '~/lib/mistyrose'
import { growMistyRose, roseTitles } from '~/lib/mistyrose'
import { useBackgroundCanvas } from '~/composables/useBackgroundCanvas'

// Without `edges`, only the titles of MistyRoseTitle grow vines
const { edges = true } = defineProps<{ edges?: boolean }>()

// As Plum, the vines start at the edges and grow inwards: one vine for each
// SEED_SPACING CSS pixels of edge, each at a random place in its part of the
// edge, and at most MAX_EDGE_SEEDS. As in the game, there are TIPS_PER_SEED
// times as many tips as seeds at the edges.
const SEED_SPACING = 300
const MAX_EDGE_SEEDS = 20
const TIPS_PER_SEED = 1.5
const SEED_SPREAD = 0.5
// The game plants TITLE_SEEDS seeds in random directions behind a chapter
// title, with TITLE_TIPS tips
const TITLE_SEEDS = 4
const TITLE_TIPS = 6
// The game draws at one CSS pixel per game unit
const SCALE = 1
// As Orchid, the canvas and the drawing behind it stay at twice the window pixels at most
const PIXEL_RATIO_LIMIT = 2

const canvas = useBackgroundCanvas((context, width, height, animated) => {
  const { random } = Math
  const [right, bottom] = [width / SCALE, height / SCALE]

  // The titles come first, as the game grows only the first 30 tips
  const titleSeeds: Seed[] = [...roseTitles].flatMap((title) => {
    const rect = title.getBoundingClientRect()
    const [x, y] = [(rect.left + rect.width / 2) / SCALE, (rect.top + rect.height / 2) / SCALE]
    return Array.from({ length: TITLE_SEEDS }, () => ({ x, y, angle: (2 * random() - 1) * Math.PI }))
  })

  const sides = [
    { length: right, at: (along: number) => ({ x: along, y: 0 }), angle: Math.PI / 2 },
    { length: right, at: (along: number) => ({ x: along, y: bottom }), angle: -Math.PI / 2 },
    { length: bottom, at: (along: number) => ({ x: 0, y: along }), angle: 0 },
    { length: bottom, at: (along: number) => ({ x: right, y: along }), angle: Math.PI },
  ]
  const perimeter = 2 * (right + bottom)
  const count = Math.min(MAX_EDGE_SEEDS, Math.max(sides.length, Math.round(perimeter * SCALE / SEED_SPACING)))
  const edgeSeeds: Seed[] = !edges
    ? []
    : sides.flatMap(({ length, at, angle }) => {
        const parts = Math.max(1, Math.round(count * length / perimeter))
        return Array.from({ length: parts }, (_, part) => ({
          ...at((part + random()) * length / parts),
          angle: angle + (random() - 0.5) * SEED_SPREAD,
        }))
      })

  const seeds = [...titleSeeds, ...edgeSeeds]
  const maxTips = roseTitles.size * TITLE_TIPS + Math.ceil(edgeSeeds.length * TIPS_PER_SEED)
  return growMistyRose(context, { seeds, maxTips, bounds: [0, 0, right, bottom] }, SCALE, animated)
}, PIXEL_RATIO_LIMIT)
</script>

<template>
  <div class="background-layer op-60">
    <canvas ref="canvas" class="w-screen h-full" />
  </div>
</template>
