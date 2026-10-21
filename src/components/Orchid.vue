<script setup lang='ts'>
import type { Growth, Parts } from '~/lib/orchid'
import { animate } from '~/lib/orchid'
import type { VineRequest } from '~/lib/orchid-worker'
import { useBackgroundCanvas } from '~/composables/useBackgroundCanvas'

// The time between the starts of two vines, so that the page fills from
// several edges in turn
const VINE_STAGGER_MS = 100
const SEED_RANGE = 2 ** 32
// The canvas and the committed drawing behind it, at twice the window pixels,
// take less memory than the one canvas of Plum on a phone with three device
// pixels per pixel
const PIXEL_RATIO_LIMIT = 2

let growth: Growth | undefined

const canvas = useBackgroundCanvas((context, width, height, animated) => {
  growth = animate(context, paint(), animated)
  const { add, stop } = growth
  let vineCount = 0
  const worker = new Worker(new URL('../lib/orchid-worker.ts', import.meta.url), { type: 'module' })
  worker.onmessage = ({ data: drawing }: MessageEvent<Parts>) => add(drawing, vineCount++ * VINE_STAGGER_MS)
  const request: VineRequest = { width, height, seed: Math.floor(Math.random() * SEED_RANGE) }
  worker.postMessage(request)
  return () => {
    worker.terminate()
    stop()
  }
}, PIXEL_RATIO_LIMIT)

// The paint is the text colour of the layer, a theme token, so a change of
// the theme repaints the growth
function paint() {
  return getComputedStyle(canvas.value!).color
}
useMutationObserver(document.documentElement, () => growth?.repaint(paint()), { attributeFilter: ['class'] })
</script>

<template>
  <!-- As the canvas of Plum, the canvas keeps its place at the top of the
       window when a phone shows or hides its bars. -->
  <div class="background-layer op-25 text-[var(--fg)]">
    <canvas ref="canvas" class="w-screen h-full" />
  </div>
</template>
