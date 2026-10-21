<script setup lang="ts">
// A big candy bag of the Suzuno project on its reference photo: Almond
// Caramel, RIBON 北海道 milk candy or salt lemon. `item` is the flavour and
// `face` the side. texts, difference, opacity, a class and a style go on to
// SuzunoFace. src/lib/suzuno/README.md lists the texts of each face.
import SuzunoFace from '~/components/suzuno/SuzunoFace.vue'
import type { BagItem, Side } from '~/lib/suzuno/faces'
import { BAG_FACES, packageFace } from '~/lib/suzuno/faces'

const props = withDefaults(defineProps<{
  item: BagItem
  face?: Side
}>(), {
  face: 'front',
})

// In setup, so that the build prints an unknown item and still writes the page
const definition = packageFace('SuzunoBag', BAG_FACES, props.item, props.face)
</script>

<template>
  <SuzunoFace :face="definition" />
</template>
