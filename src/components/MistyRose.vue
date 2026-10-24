<script setup lang='ts'>
import type { Seed } from '~/lib/mistyrose'
import { useMistyRose } from '~/composables/useMistyRose'

// As Plum, the vines start at the edges and grow inwards: one vine for each
// SEED_SPACING CSS pixels of edge, each at a random place in its part of the
// edge, and at most MAX_SEEDS. As in the game, there are TIPS_PER_SEED times
// as many tips as seeds.
const SEED_SPACING = 450
const MAX_SEEDS = 12
const TIPS_PER_SEED = 1.5
const SEED_SPREAD = 0.5
// The garden grows in game units and lies on the page at this scale, so its
// box is the window divided by the scale
const SCALE = 0.8
// The sprites are pixel art at one CSS pixel per pixel, so a denser canvas
// adds no detail, only four times the pixels to store and to copy each frame
const PIXEL_RATIO_LIMIT = 1

const canvas = useMistyRose((windowWidth, windowHeight) => {
  const { random } = Math
  const [width, height] = [windowWidth / SCALE, windowHeight / SCALE]
  const sides = [
    { length: width, at: (along: number) => ({ x: along, y: 0 }), angle: Math.PI / 2 },
    { length: width, at: (along: number) => ({ x: along, y: height }), angle: -Math.PI / 2 },
    { length: height, at: (along: number) => ({ x: 0, y: along }), angle: 0 },
    { length: height, at: (along: number) => ({ x: width, y: along }), angle: Math.PI },
  ]
  const perimeter = 2 * (width + height)
  const count = Math.min(MAX_SEEDS, Math.max(sides.length, Math.round(2 * (windowWidth + windowHeight) / SEED_SPACING)))
  const seeds: Seed[] = sides.flatMap(({ length, at, angle }) => {
    const parts = Math.max(1, Math.round(count * length / perimeter))
    return Array.from({ length: parts }, (_, part) => ({
      ...at((part + random()) * length / parts),
      angle: angle + (random() - 0.5) * SEED_SPREAD,
    }))
  })
  return [{
    seeds,
    maxTips: Math.ceil(seeds.length * TIPS_PER_SEED),
    bounds: [0, 0, width, height],
    place: { x: 0, y: 0, scale: SCALE, mirror: false },
  }]
}, PIXEL_RATIO_LIMIT)
</script>

<template>
  <div class="background-layer op-45 dark:op-60">
    <canvas ref="canvas" class="w-screen h-full" />
  </div>
</template>
