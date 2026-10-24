<script setup lang="ts">
// Draws each kind of piece of the あべっ子ラムネ strip once into an image of
// `width` x `height` device pixels: the header card and the front of each
// flavour of `order` in each pose. It mounts the recreations hidden, draws
// them with their pictures and their fonts, and calls `ready` with the
// images by their pieceKey (src/lib/suzuno/packages/candy-snake.ts). Mount
// it when the images are needed, and remove it after `ready`.
import RamuneHeader from '~/components/suzuno/packages/RamuneHeader.vue'
import RamunePacket from '~/components/suzuno/packages/RamunePacket.vue'
import { textGlyphs } from '~/lib/suzuno/faces'
import { embeddedFonts, rasterize } from '~/lib/suzuno/packages/candy-snake'
import { FACE_GLYPHS } from '~/lib/suzuno/packages/lettering'
import type { RamuneFlavour } from '~/lib/suzuno/packages/ramune'
import { RAMUNE_FLAVOURS, RAMUNE_POSES, RAMUNE_STRIP_TEXTS, RAMUNE_STYLESHEET } from '~/lib/suzuno/packages/ramune'

const props = withDefaults(defineProps<{
  width: number
  height: number
  order?: readonly RamuneFlavour[]
}>(), {
  order: () => RAMUNE_FLAVOURS,
})

const emit = defineEmits<{
  ready: [images: Map<string, HTMLCanvasElement>]
}>()

const texts = RAMUNE_STRIP_TEXTS
const glyphs = textGlyphs(texts)
provide(FACE_GLYPHS, computed(() => glyphs))

const root = ref<HTMLElement>()
const kinds = props.order.flatMap(flavour => RAMUNE_POSES.map(pose => ({ flavour, pose, key: `${flavour}-${pose}` })))

onMounted(async () => {
  const fonts = await embeddedFonts(`${RAMUNE_STYLESHEET}&text=${encodeURIComponent(glyphs)}`).catch((error: Error) => {
    // The pieces then show their lettering in the fallback fonts
    console.warn(`RamunePieces: cannot load the fonts: ${error.message}`)
    return ''
  })
  const images = new Map<string, HTMLCanvasElement>()
  for (const svg of root.value!.querySelectorAll<SVGSVGElement>(':scope > svg'))
    images.set(svg.dataset.piece!, await rasterize(svg, props.width, props.height, fonts))
  emit('ready', images)
})
</script>

<template>
  <span ref="root" hidden>
    <RamuneHeader data-piece="header" :texts="texts.header" />
    <RamunePacket v-for="{ flavour, pose, key } in kinds" :key="key" :data-piece="key" :flavour="flavour" :pose="pose" :texts="texts.packets[flavour]" />
  </span>
</template>
