<script setup lang='ts'>
/*
MistyRoseTitle: a title with a rose vine of Hammerfight at each side. The two
vines are the same growth, the left one mirrored, and they grow from the
title outwards.

  <MistyRoseTitle>

  ## A title

  </MistyRoseTitle>

The wrapper is as wide as the title and takes no more space. The vines grow
in the free space at the sides of the title, up to the edge of the window or
MAX_WIDTH, over the content above and below. Both vines get the width of
the narrower side, so that they stay mirror images.
*/
import type { Garden, Range } from '~/lib/mistyrose'
import { random } from '~/lib/orchid'
import { growMistyRose, yieldOf } from '~/lib/mistyrose'
import { useBackgroundCanvas } from '~/composables/useBackgroundCanvas'

const SEED_RANGE = 2 ** 32
// Half the size of the game, and curls of about half the game radius, so
// that a vine stays in the height of a title for a while
const SCALE = 0.5
const CURL: Range = [60, 120]
// The curl changes its direction more often than in the game, so that a
// vine runs outwards in waves instead of a spiral at the title
const FLIP_CHANCE = 0.25
const MAX_TIPS = 3
const SEED_SPREAD = 0.6
const PIXEL_RATIO_LIMIT = 2
// Many vines leave the title space after a few segments. Of CANDIDATES
// seeds, the title takes the one whose full growth has the most items.
const CANDIDATES = 8
// In CSS pixels: the widest vine, the gap between the title and a vine, and
// the narrowest vine that still shows a few segments
const MAX_WIDTH = 192
const GAP = 8
const MIN_WIDTH = 24

const candidates = Array.from({ length: CANDIDATES }, () => ({
  seed: Math.floor(Math.random() * SEED_RANGE),
  angle: (Math.random() - 0.5) * SEED_SPREAD,
}))

function vine() {
  return useBackgroundCanvas((context, width, height, animated) => {
    if (width < MIN_WIDTH)
      return
    const [right, bottom] = [width / SCALE, height / SCALE]
    const garden = (angle: number): Garden => ({ seeds: [{ x: 0, y: bottom / 2, angle }], maxTips: MAX_TIPS, bounds: [0, 0, right, bottom], curl: CURL, flipChance: FLIP_CHANCE })
    const yields = candidates.map(({ seed, angle }) => yieldOf(garden(angle), random(seed)))
    const { seed, angle } = candidates[yields.indexOf(Math.max(...yields))]
    return growMistyRose(context, garden(angle), SCALE, animated, random(seed))
  }, PIXEL_RATIO_LIMIT)
}

const title = ref<HTMLDivElement>()
const left = vine()
const right = vine()
const width = ref(0)

// Runs before the canvases take their size, which waits for an idle main thread
onMounted(() => {
  const { left: start, right: end } = title.value!.getBoundingClientRect()
  const space = Math.min(start, document.documentElement.clientWidth - end, MAX_WIDTH + GAP)
  width.value = Math.max(0, space - GAP)
})
</script>

<template>
  <div ref="title" class="relative w-fit">
    <slot />
    <canvas
      ref="left" class="absolute right-full top-1/2 -translate-y-1/2 -scale-x-100 mr-2 h-28 pointer-events-none"
      :style="{ width: `${width}px` }" aria-hidden="true"
    />
    <canvas
      ref="right" class="absolute left-full top-1/2 -translate-y-1/2 ml-2 h-28 pointer-events-none"
      :style="{ width: `${width}px` }" aria-hidden="true"
    />
  </div>
</template>
