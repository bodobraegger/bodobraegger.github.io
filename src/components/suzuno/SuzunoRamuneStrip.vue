<script setup lang="ts">
// The strip of あべっ子ラムネ, lying across: the header card and the packets.
// `face` is the side; `order` the flavours of the packets, which repeat, and
// `count` the number of packets. The default is the strip of the photos, on
// its reference image; another strip shows its recreation alone. texts,
// difference, opacity, a class and a style go on to SuzunoFace.
import SuzunoFace from '~/components/suzuno/SuzunoFace.vue'
import type { Side } from '~/lib/suzuno/faces'
import { ramuneStripFace } from '~/lib/suzuno/faces'
import type { RamuneFlavour } from '~/lib/suzuno/packages/ramune'
import { RAMUNE_FLAVOURS, RAMUNE_STRIP } from '~/lib/suzuno/packages/ramune'

const props = withDefaults(defineProps<{
  face?: Side
  order?: RamuneFlavour[]
  count?: number | string
}>(), {
  face: 'front',
  order: () => [...RAMUNE_FLAVOURS],
  count: RAMUNE_STRIP.length,
})

const definition = ramuneStripFace(props.face, props.order, Number(props.count))
</script>

<template>
  <SuzunoFace :face="definition" />
</template>
