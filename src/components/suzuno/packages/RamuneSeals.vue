<script setup lang="ts">
// The clear film of one piece of the あべっ子ラムネ strip, with the halves of
// the dark eye marks that lie on the seals at its top and its bottom. The
// print of the piece lies on top.
import { RAMUNE_COLOURS, RAMUNE_FACE, RAMUNE_SEALS } from '~/lib/suzuno/packages/ramune'

defineProps<{
  /** The back mirrors the marks. */
  mirrored: boolean
}>()

const { mark } = RAMUNE_SEALS
</script>

<template>
  <rect :width="RAMUNE_FACE.width" :height="RAMUNE_FACE.height" :fill="RAMUNE_COLOURS.film" />
  <g :fill="RAMUNE_COLOURS.mark">
    <rect
      v-for="y in [0, RAMUNE_FACE.height - mark.height]"
      :key="y"
      :x="mirrored ? RAMUNE_FACE.width - mark.x - mark.width : mark.x"
      :y="y"
      :width="mark.width"
      :height="mark.height"
    />
  </g>
</template>
