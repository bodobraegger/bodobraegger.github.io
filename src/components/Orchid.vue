<script setup lang='ts'>
import type { Growth, Parts } from '~/lib/orchid'
import { animate } from '~/lib/orchid'
import type { VineRequest } from '~/lib/orchid-worker'
import { whenIdle } from '~/logics/idle'

// The time between the starts of two vines, so that the page fills from
// several edges in turn
const VINE_STAGGER_MS = 1000
const SEED_RANGE = 2 ** 32
// The canvas and the committed drawing behind it, at twice the window pixels,
// take less memory than the one canvas of Plum on a phone with three device
// pixels per pixel
const PIXEL_RATIO_LIMIT = 2

const container = ref<HTMLDivElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

let worker: Worker | undefined
let growth: Growth | undefined

onMounted(() => {
  // Grow only after hydration and font swaps have settled, like Plum
  whenIdle(startGrowth)
})

onUnmounted(() => {
  worker?.terminate()
  growth?.stop()
})

// The paint is the text colour of the container, a theme token, so a change
// of the theme repaints the growth
const paint = () => getComputedStyle(container.value!).color
let dark = document.documentElement.classList.contains('dark')
useMutationObserver(document.documentElement, () => {
  if (dark === document.documentElement.classList.contains('dark'))
    return
  dark = !dark
  growth?.repaint(paint())
}, { attributeFilter: ['class'] })

function initCanvas(element: HTMLCanvasElement, width: number, height: number) {
  const context = element.getContext('2d')!
  const ratio = Math.min(window.devicePixelRatio || 1, PIXEL_RATIO_LIMIT)
  element.style.width = `${width}px`
  element.style.height = `${height}px`
  element.width = ratio * width
  element.height = ratio * height
  context.scale(ratio, ratio)
  return context
}

function startGrowth() {
  if (!container.value || !canvas.value)
    return
  // The drawing keeps the size of the window at its start, like Plum
  const { width, height } = container.value.getBoundingClientRect()
  const vineGrowth = animate(initCanvas(canvas.value, width, height), paint())
  growth = vineGrowth
  let vineCount = 0
  worker = new Worker(new URL('../lib/orchid-worker.ts', import.meta.url), { type: 'module' })
  worker.onmessage = ({ data: drawing }: MessageEvent<Parts>) => vineGrowth.add(drawing, vineCount++ * VINE_STAGGER_MS)
  const request: VineRequest = { width, height, seed: Math.floor(Math.random() * SEED_RANGE) }
  worker.postMessage(request)
}
</script>

<template>
  <!-- The canvas sits at the foot of the window, so that the vines keep
       their roots at the bottom edge when a phone hides its address bar. -->
  <div
    ref="container"
    class="fixed top-0 bottom-0 left-0 right-0 pointer-events-none print:hidden op-20 text-[var(--fg)]"
    style="z-index: -1; mask-image: radial-gradient(circle, transparent, black); -webkit-mask-image: radial-gradient(circle, transparent, black)"
  >
    <canvas ref="canvas" class="absolute bottom-0 left-0" />
  </div>
</template>
