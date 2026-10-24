<script setup lang="ts">
// A candy snake: the strip of あべっ子ラムネ grows along a winding path in
// the box of the component, the header card first, then one packet after
// another, as the vines of Orchid grow. `order` gives the flavours of the
// packets, which repeat. A class or a style sets the size; without them, the
// snake is as wide as the prose column. With reduced motion, the whole
// snake shows at once.
import { nextTick } from 'vue'
import RamuneHeader from '~/components/suzuno/packages/RamuneHeader.vue'
import RamunePacket from '~/components/suzuno/packages/RamunePacket.vue'
import { useBackgroundCanvas } from '~/composables/useBackgroundCanvas'
import { textGlyphs } from '~/lib/suzuno/faces'
import { embeddedFonts, growSnake, placesAlong, rasterize, windingPath } from '~/lib/suzuno/packages/candy-snake'
import { FACE_GLYPHS } from '~/lib/suzuno/packages/lettering'
import type { RamuneFlavour, RamunePose } from '~/lib/suzuno/packages/ramune'
import { RAMUNE_FACE, RAMUNE_FLAVOURS, RAMUNE_POSES, RAMUNE_STRIP_TEXTS, RAMUNE_STYLESHEET } from '~/lib/suzuno/packages/ramune'

const props = withDefaults(defineProps<{
  order?: RamuneFlavour[]
}>(), {
  order: () => [...RAMUNE_FLAVOURS],
})

// A piece is a sixth of the shorter side of the box, within these limits in CSS pixels
const PIECES_ACROSS = 6
const SMALLEST_PIECE = 24
const LARGEST_PIECE = 56
// The images of the pieces are drawn at most at this many device pixels per CSS pixel
const PIXEL_RATIO_LIMIT = 2

const texts = RAMUNE_STRIP_TEXTS
const glyphs = textGlyphs(texts)
provide(FACE_GLYPHS, computed(() => glyphs))

// The recreations mount only when the snake starts to grow, and only to be drawn into images
const sources = ref<HTMLElement>()
const showSources = ref(false)
const kinds = props.order.flatMap(flavour => RAMUNE_POSES.map(pose => ({ flavour, pose })))
const key = (flavour: RamuneFlavour, pose: RamunePose) => `${flavour}-${pose}`

const canvas = useBackgroundCanvas((context, width, height, animated) => {
  let stopped = false
  let stop: (() => void) | undefined
  const across = Math.min(LARGEST_PIECE, Math.max(SMALLEST_PIECE, Math.min(width, height) / PIECES_ACROSS))
  const length = across * RAMUNE_FACE.height / RAMUNE_FACE.width
  const ratio = context.getTransform().a
  showSources.value = true
  nextTick(async () => {
    const fonts = await embeddedFonts(`${RAMUNE_STYLESHEET}&text=${encodeURIComponent(glyphs)}`).catch((error: Error) => {
      // The pieces then show their lettering in the fallback fonts
      console.warn(`SuzunoCandySnake: cannot load the fonts: ${error.message}`)
      return ''
    })
    const draw = (svg: SVGSVGElement) => rasterize(svg, Math.round(across * ratio), Math.round(length * ratio), fonts)
    const images = new Map<string, HTMLCanvasElement>()
    for (const svg of sources.value!.querySelectorAll<SVGSVGElement>(':scope > svg'))
      images.set(svg.dataset.piece!, await draw(svg))
    showSources.value = false
    if (stopped)
      return
    const places = placesAlong(windingPath(width, height, across, Math.random() * 2 * Math.PI), length)
    const pieces = places.map((place, index) => {
      const packet = index - 1
      const flavour = props.order[packet % props.order.length]
      const pose = RAMUNE_POSES[Math.floor(packet / props.order.length) % RAMUNE_POSES.length]
      return { ...place, image: images.get(index ? key(flavour, pose) : 'header')! }
    })
    stop = growSnake(context, pieces, length, across, animated)
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
    <span v-if="showSources" ref="sources" hidden>
      <RamuneHeader data-piece="header" :texts="texts.header" />
      <RamunePacket v-for="{ flavour, pose } in kinds" :key="key(flavour, pose)" :data-piece="key(flavour, pose)" :flavour="flavour" :pose="pose" :texts="texts.packets[flavour]" />
    </span>
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
