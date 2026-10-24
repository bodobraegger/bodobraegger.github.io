<script setup lang='ts'>
// Candy snakes of あべっ子ラムネ that grow in from the edges of the window,
// one packet after another, as the vines of Orchid grow. The layout is in
// src/lib/honeydew.ts, the images of the pieces come from RamunePieces, and
// growSnakes of src/lib/suzuno/packages/candy-snake.ts grows them.
import RamunePieces from '~/components/suzuno/packages/RamunePieces.vue'
import { useBackgroundCanvas } from '~/composables/useBackgroundCanvas'
import { candySnakes } from '~/lib/honeydew'
import { growSnakes, pieceKey, usePieceImages } from '~/lib/suzuno/packages/candy-snake'
import { RAMUNE_FLAVOURS } from '~/lib/suzuno/packages/ramune'

// A packet opens in PIECE_MS at the middle pace, so that the snakes fill a
// desktop window in about 50 seconds and a phone in about 25
const PIECE_MS = 300
const SEED_RANGE = 2 ** 32
// As for Orchid, at most twice the window pixels
const PIXEL_RATIO_LIMIT = 2

const { size: pieceSize, request: requestImages, ready: imagesReady } = usePieceImages()

const canvas = useBackgroundCanvas((context, width, height, animated) => {
  let stopped = false
  let stop: (() => void) | undefined
  const snakes = candySnakes(width, height, Math.floor(Math.random() * SEED_RANGE))
  if (!snakes.length)
    return
  // The images have the size of the pieces of the nearest snake; the farther ones draw them smaller
  const nearest = snakes.reduce((largest, snake) => snake.across > largest.across ? snake : largest)
  const ratio = context.getTransform().a
  requestImages(Math.round(nearest.across * ratio), Math.round(nearest.length * ratio)).then((images) => {
    if (stopped)
      return
    stop = growSnakes(context, snakes.map(snake => ({
      ...snake,
      pieces: snake.pieces.map((piece, index) => ({ ...piece, image: images.get(pieceKey(index, RAMUNE_FLAVOURS))! })),
    })), PIECE_MS, animated)
  })
  return () => {
    stopped = true
    stop?.()
  }
}, PIXEL_RATIO_LIMIT)
</script>

<template>
  <!-- As the canvas of Plum, the canvas keeps its place at the top of the
       window when a phone shows or hides its bars. -->
  <!-- The light film of the packets stands out more on a dark page -->
  <div class="background-layer op-40 dark:op-25">
    <canvas ref="canvas" class="w-screen h-full" />
    <RamunePieces v-if="pieceSize" v-bind="pieceSize" @ready="imagesReady" />
  </div>
</template>
