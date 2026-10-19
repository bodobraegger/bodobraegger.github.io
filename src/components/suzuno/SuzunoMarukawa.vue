<script setup lang="ts">
// A MARUKAWA bubble gum box of the Suzuno project on its reference photo.
// `item` is the flavour. The front and the back carry the same print, so the
// box has one face. texts, difference, opacity, a class and a style go on to
// SuzunoFace. src/lib/suzuno/README.md lists the texts.
import SuzunoFace from '~/components/suzuno/SuzunoFace.vue'
import type { MarukawaItem } from '~/lib/suzuno/faces'
import { MARUKAWA_FACES, packageFace } from '~/lib/suzuno/faces'

const props = defineProps<{
  item: MarukawaItem
}>()

const definition = computed(() => packageFace('SuzunoMarukawa', MARUKAWA_FACES, props.item, 'front'))
</script>

<template>
  <SuzunoFace :face="definition" />
</template>
