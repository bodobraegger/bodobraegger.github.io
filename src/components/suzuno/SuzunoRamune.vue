<script setup lang="ts">
// A piece of the strip of あべっ子ラムネ on its reference image: the header
// card or a packet. `item` is `header` or the flavour, `face` the side, and
// `pose` the pose of the character on the front of a packet. texts,
// difference, opacity, a class and a style go on to SuzunoFace.
// src/lib/suzuno/README.md lists the texts.
import SuzunoFace from '~/components/suzuno/SuzunoFace.vue'
import type { Side } from '~/lib/suzuno/faces'
import { RAMUNE_FACES, RAMUNE_SECOND_POSE, UnknownFaceError, packageFace } from '~/lib/suzuno/faces'
import type { RamuneFlavour, RamuneItem } from '~/lib/suzuno/packages/ramune'

const props = withDefaults(defineProps<{
  item: RamuneItem
  face?: Side
  pose?: number | string
}>(), {
  face: 'front',
  pose: 1,
})

// In setup, so that the build prints an unknown item or pose and still writes the page
const first = packageFace('SuzunoRamune', RAMUNE_FACES, props.item, props.face)
const pose = Number(props.pose)
if (pose !== 1 && (pose !== 2 || props.item === 'header' || props.face !== 'front'))
  throw new UnknownFaceError(`SuzunoRamune has the poses 1 and 2 on the front of a packet and pose 1 elsewhere, not pose ${props.pose} on the ${props.face} of ${props.item}`)
const definition = pose === 2 ? RAMUNE_SECOND_POSE[props.item as RamuneFlavour] : first
</script>

<template>
  <SuzunoFace :face="definition" />
</template>
