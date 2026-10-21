<script setup lang='ts'>
// The canvas of the vines that grow from the titles of MistyRoseTitle. It lies
// in the page, so it scrolls with the titles, and it has no mask, so the vines
// show at the title. One canvas spans the band of all titles, with half a
// window height of room above and below each, as the game gives a chapter
// title the whole screen, but the band is at most MAX_WINDOWS window heights.
import type { Seed } from '~/lib/mistyrose'
import { roseTitles, useMistyRose } from '~/composables/useMistyRose'

// The game plants TITLE_SEEDS seeds in random directions behind a chapter
// title, with TITLE_TIPS tips
const TITLE_SEEDS = 4
const TITLE_TIPS = 6
const MAX_WINDOWS = 3
// The sprites are pixel art at one CSS pixel per pixel, so a denser canvas
// adds no detail, only four times the pixels to store and to copy each frame
const PIXEL_RATIO_LIMIT = 1

const band = ref({ top: 0, height: 0 })
function middle(title: HTMLElement) {
  const { left, top, width, height } = title.getBoundingClientRect()
  return { x: left + width / 2, y: top + window.scrollY + height / 2 }
}

// Runs before the canvas takes its size, which waits for an idle main thread
onMounted(() => {
  const middles = [...roseTitles].map(title => middle(title).y)
  if (!middles.length)
    return
  const room = window.innerHeight / 2
  const top = Math.max(0, Math.min(...middles) - room)
  const bottom = Math.min(Math.max(...middles) + room, top + MAX_WINDOWS * window.innerHeight)
  band.value = { top, height: bottom - top }
})

const canvas = useMistyRose((width, height) => {
  const middles = [...roseTitles].map(middle)
    .map(({ x, y }) => ({ x, y: y - band.value.top }))
    .filter(({ y }) => y >= 0 && y <= height)
  if (!middles.length)
    return
  const seeds: Seed[] = middles.flatMap(({ x, y }) =>
    Array.from({ length: TITLE_SEEDS }, () => ({ x, y, angle: (2 * Math.random() - 1) * Math.PI })))
  return { seeds, maxTips: middles.length * TITLE_TIPS, bounds: [0, 0, width, height] }
}, PIXEL_RATIO_LIMIT)
</script>

<template>
  <Teleport to="body">
    <canvas
      ref="canvas" class="absolute left-0 w-full -z-1 op-60 pointer-events-none print:hidden"
      :style="{ top: `${band.top}px`, height: `${band.height}px` }" aria-hidden="true"
    />
  </Teleport>
</template>
