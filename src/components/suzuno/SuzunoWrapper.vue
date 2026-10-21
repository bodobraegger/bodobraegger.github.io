<script setup lang="ts">
// A wrapped candy of the Suzuno project on its reference photo: an almond
// caramel or a RIBON 北海道 milk candy. `item` is the flavour and `face` the
// side. texts, difference, opacity, a class and a style go on to SuzunoFace.
// src/lib/suzuno/README.md lists the texts of each face.
import SuzunoFace from '~/components/suzuno/SuzunoFace.vue'
import type { Side, WrapperItem } from '~/lib/suzuno/faces'
import { WRAPPER_FACES, packageFace } from '~/lib/suzuno/faces'

const props = withDefaults(defineProps<{
  item: WrapperItem
  face?: Side
}>(), {
  face: 'front',
})

// In setup, so that the build prints an unknown item and still writes the page
const definition = packageFace('SuzunoWrapper', WRAPPER_FACES, props.item, props.face)
</script>

<template>
  <SuzunoFace :face="definition" />
</template>
