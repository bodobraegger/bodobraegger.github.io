<script setup lang="ts">
// A candy snake: the strip of あべっ子ラムネ grows along a winding path in
// the box of the component, the header card first, then one packet after
// another, as the vines of Orchid grow. `order` gives the flavours of the
// packets, which repeat. A class or a style sets the size; without them, the
// snake is as wide as the prose column. With reduced motion, the whole
// snake shows at once.
import RamunePieces from '~/components/suzuno/packages/RamunePieces.vue'
import { useBackgroundCanvas } from '~/composables/useBackgroundCanvas'
import { growSnakes, pieceKey, placesAlong, usePieceImages, windingPath } from '~/lib/suzuno/packages/candy-snake'
import type { RamuneFlavour } from '~/lib/suzuno/packages/ramune'
import { RAMUNE_FACE, RAMUNE_FLAVOURS } from '~/lib/suzuno/packages/ramune'

const props = withDefaults(defineProps<{
  order?: RamuneFlavour[]
}>(), {
  order: () => [...RAMUNE_FLAVOURS],
})

// A piece is a sixth of the shorter side of the box, within these limits in
// CSS pixels, and opens in PIECE_MS at the middle pace
const PIECES_ACROSS = 6
const SMALLEST_PIECE = 24
const LARGEST_PIECE = 56
const PIECE_MS = 220
// The images of the pieces are drawn at most at this many device pixels per CSS pixel
const PIXEL_RATIO_LIMIT = 2

const { size: pieceSize, request: requestImages, ready: imagesReady } = usePieceImages()

const canvas = useBackgroundCanvas((context, width, height, animated) => {
  let stopped = false
  let stop: (() => void) | undefined
  const across = Math.min(LARGEST_PIECE, Math.max(SMALLEST_PIECE, Math.min(width, height) / PIECES_ACROSS))
  const length = across * RAMUNE_FACE.height / RAMUNE_FACE.width
  const ratio = context.getTransform().a
  requestImages(Math.round(across * ratio), Math.round(length * ratio)).then((images) => {
    if (stopped)
      return
    const places = placesAlong(windingPath(width, height, across, Math.random() * 2 * Math.PI), length)
    const pieces = places.map((place, index) => ({ ...place, image: images.get(pieceKey(index, props.order))! }))
    stop = growSnakes(context, [{ pieces, across, length, alpha: 1, delay: 0 }], PIECE_MS, animated)
  })
  return () => {
    stopped = true
    stop?.()
  }
}, PIXEL_RATIO_LIMIT)
</script>

<template>
  <span class="suzuno-candy-snake">
    <canvas ref="canvas" class="block h-full w-full" />
    <RamunePieces v-if="pieceSize" v-bind="pieceSize" :order="order" @ready="imagesReady" />
  </span>
</template>

<!-- Not scoped: the selectors have no specificity, so that a class or a style
     on the tag of the snake wins over them. -->
<style>
:where(.suzuno-candy-snake) {
  display: block;
  width: 100%;
  aspect-ratio: 3 / 2;
  margin: 2em auto;
}
</style>
