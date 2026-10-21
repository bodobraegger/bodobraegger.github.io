<script setup lang='ts'>
import type { Seed } from '~/lib/mistyrose'
import { growMistyRose } from '~/lib/mistyrose'
import { useBackgroundCanvas } from '~/composables/useBackgroundCanvas'

// As Plum, the vines start at the edges and grow inwards: one vine for each
// SEED_SPACING CSS pixels of edge, each at a random place in its part of the
// edge. The game grows at most 30 tips, so the seeds stop at MAX_SEEDS, and
// as in the game there are TIPS_PER_SEED times as many tips as seeds.
const SEED_SPACING = 300
const MAX_SEEDS = 20
const TIPS_PER_SEED = 1.5
const SEED_SPREAD = 0.5
// The game draws at one CSS pixel per game unit
const SCALE = 1
// As Orchid, the canvas and the drawing behind it stay at twice the window pixels at most
const PIXEL_RATIO_LIMIT = 2

const canvas = useBackgroundCanvas((context, width, height, animated) => {
  const { random } = Math
  const [right, bottom] = [width / SCALE, height / SCALE]
  const edges = [
    { length: right, at: (along: number) => ({ x: along, y: 0 }), angle: Math.PI / 2 },
    { length: right, at: (along: number) => ({ x: along, y: bottom }), angle: -Math.PI / 2 },
    { length: bottom, at: (along: number) => ({ x: 0, y: along }), angle: 0 },
    { length: bottom, at: (along: number) => ({ x: right, y: along }), angle: Math.PI },
  ]
  const perimeter = 2 * (right + bottom)
  const count = Math.min(MAX_SEEDS, Math.max(edges.length, Math.round(perimeter * SCALE / SEED_SPACING)))
  const seeds: Seed[] = edges.flatMap(({ length, at, angle }) => {
    const parts = Math.max(1, Math.round(count * length / perimeter))
    return Array.from({ length: parts }, (_, part) => ({
      ...at((part + random()) * length / parts),
      angle: angle + (random() - 0.5) * SEED_SPREAD,
    }))
  })
  const maxTips = Math.ceil(seeds.length * TIPS_PER_SEED)
  return growMistyRose(context, { seeds, maxTips, bounds: [0, 0, right, bottom] }, SCALE, animated)
}, PIXEL_RATIO_LIMIT)
</script>

<template>
  <div class="background-layer op-60">
    <canvas ref="canvas" class="w-screen h-full" />
  </div>
</template>
