<script setup lang='ts'>
// The canvas of the vines at the sides of the titles of MistyRoseTitle. A
// vine starts at each side of a title and grows outwards, the left one the
// mirror image of the right one. The canvas lies in the page, so it scrolls
// with the titles, and it spans the band of all titles at the full width of
// the page, so no vine is clipped at the side of its space. The band is at
// most MAX_WINDOWS window heights.
import type { Garden, Range } from '~/lib/mistyrose'
import { roseTitles, useMistyRose } from '~/composables/useMistyRose'

// Half the size of the game, and curls of about half the game radius, so
// that a vine stays in the height of a title for a while
const SCALE = 0.5
const CURL: Range = [60, 120]
// The curl changes its direction more often than in the game, so that a
// vine runs outwards in waves instead of a spiral at the title
const FLIP_CHANCE = 0.25
const MAX_TIPS = 3
const SEED_SPREAD = 0.6
// Many vines leave their space after a few segments. Of CANDIDATES seeds, a
// title takes the one whose full growth has the most items.
const CANDIDATES = 8
const SEED_RANGE = 2 ** 32
// In CSS pixels: the space of a vine is at most MAX_WIDTH wide and HEIGHT
// high, GAP away from the title, and a side narrower than MIN_WIDTH gets no
// vine. The band reaches ROOM above and below the middle of each title, so
// that the leaves at the edge of a space show in full.
const MAX_WIDTH = 192
const HEIGHT = 112
const GAP = 8
const MIN_WIDTH = 24
const ROOM = HEIGHT / 2 + 32
const MAX_WINDOWS = 3
// The sprites are pixel art at one CSS pixel per pixel, so a denser canvas
// adds no detail, only four times the pixels to store and to copy each frame
const PIXEL_RATIO_LIMIT = 1

const band = ref({ top: 0, height: 0 })

/** The free space at the sides of a title, in CSS pixels of the page. */
function space(title: HTMLElement) {
  const { left, right, top, height } = title.getBoundingClientRect()
  const free = Math.min(left, document.documentElement.clientWidth - right) - GAP
  return { left: left - GAP, right: right + GAP, middle: top + window.scrollY + height / 2, width: Math.min(free, MAX_WIDTH) }
}

// Runs before the canvas takes its size, which waits for an idle main thread
onMounted(() => {
  const middles = [...roseTitles].map(title => space(title).middle)
  if (!middles.length)
    return
  const top = Math.max(0, Math.min(...middles) - ROOM)
  const bottom = Math.min(Math.max(...middles) + ROOM, top + MAX_WINDOWS * window.innerHeight)
  band.value = { top, height: bottom - top }
})

const canvas = useMistyRose((_, height) => [...roseTitles].map(space)
  .map(({ middle, ...sides }) => ({ ...sides, middle: middle - band.value.top }))
  .filter(({ middle, width }) => width >= MIN_WIDTH && middle >= 0 && middle <= height)
  .flatMap(({ left, right, middle, width }) => {
    const candidates = Array.from({ length: CANDIDATES }, () => Math.floor(Math.random() * SEED_RANGE))
    const angle = (Math.random() - 0.5) * SEED_SPREAD
    const side = (x: number, mirror: boolean): Garden => ({
      seeds: [{ x: 0, y: 0, angle }],
      maxTips: MAX_TIPS,
      bounds: [0, -HEIGHT / 2 / SCALE, width / SCALE, HEIGHT / SCALE],
      curl: CURL,
      flipChance: FLIP_CHANCE,
      place: { x, y: middle, scale: SCALE, mirror },
      candidates,
    })
    return [side(right, false), side(left, true)]
  }), PIXEL_RATIO_LIMIT)
</script>

<template>
  <Teleport to="body">
    <canvas
      ref="canvas" class="absolute left-0 w-full -z-1 op-60 pointer-events-none print:hidden"
      :style="{ top: `${band.top}px`, height: `${band.height}px` }" aria-hidden="true"
    />
  </Teleport>
</template>
