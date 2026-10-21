<script setup lang='ts'>
import type { Fn } from '@vueuse/core'
import { useBackgroundCanvas } from '~/composables/useBackgroundCanvas'

const r180 = Math.PI
const r90 = Math.PI / 2
const r15 = Math.PI / 12
const color = '#88888825'

const { random } = Math

const MIN_BRANCH = 30
const LENGTH = 6
const FRAMES_PER_SECOND = 40

function polar2cart(x = 0, y = 0, r = 0, theta = 0) {
  const dx = r * Math.cos(theta)
  const dy = r * Math.sin(theta)
  return [x + dx, y + dy]
}

const canvas = useBackgroundCanvas((ctx, width, height, animated) => {
  let steps: Fn[] = []

  const step = (x: number, y: number, rad: number, counter: { value: number } = { value: 0 }) => {
    const length = random() * LENGTH
    counter.value += 1

    const [nx, ny] = polar2cart(x, y, length, rad)

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(nx, ny)
    ctx.stroke()

    const rad1 = rad + random() * r15
    const rad2 = rad - random() * r15

    if (nx < -100 || nx > width + 100 || ny < -100 || ny > height + 100)
      return

    const rate = counter.value <= MIN_BRANCH
      ? 0.8
      : 0.5

    if (random() < rate)
      steps.push(() => step(nx, ny, rad1, counter))

    if (random() < rate)
      steps.push(() => step(nx, ny, rad2, counter))
  }

  // Runs the steps of the previous frame
  const advance = () => {
    const prevSteps = steps
    steps = []
    prevSteps.forEach((i) => {
      // 50% chance to keep the step for the next frame, to create a more organic look
      if (random() < 0.5)
        steps.push(i)
      else
        i()
    })
  }

  const randomMiddle = () => random() * 0.6 + 0.2

  ctx.lineWidth = 1
  ctx.strokeStyle = color
  steps = [
    () => step(randomMiddle() * width, -5, r90),
    () => step(randomMiddle() * width, height + 5, -r90),
    () => step(-5, randomMiddle() * height, 0),
    () => step(width + 5, randomMiddle() * height, r180),
  ]
  if (width < 500)
    steps = steps.slice(0, 2)

  // Without motion the whole drawing appears at once, as the orchid does
  if (!animated) {
    while (steps.length)
      advance()
    return
  }
  const controls = useRafFn(() => {
    if (!steps.length)
      controls.pause()
    advance()
  }, { fpsLimit: FRAMES_PER_SECOND })
  return controls.pause
})
</script>

<template>
  <div class="background-layer">
    <canvas ref="canvas" class="w-screen h-full" />
  </div>
</template>
