<script setup lang="ts">
// A strip of あべっ子ラムネ as one SVG, lying across: the header card at the
// left, then the packets, each piece turned so that its top points to the
// header, as on the photo of the strip. The packets take the flavours of
// `order` in turn, and each round of the order changes the pose of the
// characters, as on the strip of ten packets.
import RamuneHeader from '~/components/suzuno/packages/RamuneHeader.vue'
import RamunePacket from '~/components/suzuno/packages/RamunePacket.vue'
import type { Side } from '~/lib/suzuno/faces'
import type { RamuneFlavour, RamunePose, RamuneStripTexts } from '~/lib/suzuno/packages/ramune'
import { RAMUNE_FACE } from '~/lib/suzuno/packages/ramune'

const props = defineProps<{
  side: Side
  order: RamuneFlavour[]
  count: number
  texts: RamuneStripTexts
}>()

const POSES = 2
const length = computed(() => (props.count + 1) * RAMUNE_FACE.height)
const packets = computed(() => Array.from({ length: props.count }, (_, index) => ({
  flavour: props.order[index % props.order.length],
  pose: (Math.floor(index / props.order.length) % POSES + 1) as RamunePose,
})))
const place = (index: number) => `translate(${index * RAMUNE_FACE.height} ${RAMUNE_FACE.width}) rotate(-90)`
</script>

<template>
  <svg class="block h-auto w-full" :viewBox="`0 0 ${length} ${RAMUNE_FACE.width}`" role="img" :aria-label="texts.header.logo.join('')">
    <!-- Each piece fills an SVG viewport of its own size, so that its width of 100% is the width of the piece -->
    <g :transform="place(0)">
      <svg :width="RAMUNE_FACE.width" :height="RAMUNE_FACE.height">
        <RamuneHeader :side="side" :texts="texts.header" />
      </svg>
    </g>
    <g v-for="({ flavour, pose }, index) in packets" :key="index" :transform="place(index + 1)">
      <svg :width="RAMUNE_FACE.width" :height="RAMUNE_FACE.height">
        <RamunePacket :flavour="flavour" :side="side" :pose="pose" :texts="texts.packets[flavour]" />
      </svg>
    </g>
  </svg>
</template>
